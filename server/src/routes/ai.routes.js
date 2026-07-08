const express = require('express');
const axios = require('axios');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

const FASTAPI_INTERNAL_URL = process.env.FASTAPI_INTERNAL_URL || 'http://localhost:8001';

// Internal helper: calls the FastAPI companion service to generate AI responses. Returns the text output or throws an error if the service is unavailable.
const callAI = async ({ system, prompt, session = 'teamorbit', json = false }) => {
  try {
    const { data } = await axios.post(
      `${FASTAPI_INTERNAL_URL}/api/_ai/generate`,
      { system, prompt, session, json },
      { timeout: 90000 }
    );
    return data.text;
  } catch (err) {
    console.error('[AI] error', err.response?.data || err.message);
    throw new Error('AI service temporarily unavailable');
  }
};

// 1. Smart Task Distribution — suggests best member for a task based on skills & workload
router.post('/task-distribution', auth, async (req, res, next) => {
  try {
    const { projectId, taskTitle, taskDescription } = req.body;
    const project = await Project.findById(projectId).populate('members', 'name skills');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ project: projectId, status: { $ne: 'completed' } });
    const workload = project.members.map((m) => ({
      name: m.name,
      skills: m.skills || [],
      openTasks: tasks.filter((t) => t.assignees.map(String).includes(String(m._id))).length,
    }));
    const system =
      'You are an AI assistant that helps student teams assign tasks fairly based on member skills and current workload. Respond as JSON only.';
    const prompt = `Task: "${taskTitle}"\nDescription: ${taskDescription || 'N/A'}\n\nTeam members:\n${JSON.stringify(
      workload,
      null,
      2
    )}\n\nPick the best member. Respond in strict JSON: {"recommended":"<name>","reason":"<short reason>","alternates":["<name>","<name>"]}`;
    const text = await callAI({ system, prompt, session: `dist-${projectId}`, json: true });
    let parsed;
    try {
      parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch {
      parsed = { recommended: workload[0]?.name || 'Team lead', reason: text.slice(0, 200), alternates: [] };
    }
    res.json({ suggestion: parsed });
  } catch (err) {
    next(err);
  }
});

// 2. AI Meeting Assistant — extracts tasks from meeting notes
router.post('/meeting-notes', auth, async (req, res, next) => {
  try {
    const { projectId, notes } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes required' });
    const system =
      'You convert meeting notes into structured tasks for a student project team. Always respond in strict JSON.';
    const prompt = `Meeting notes:\n"""${notes}"""\n\nExtract action items. Respond as JSON:\n{"summary":"<2-3 sentence summary>","tasks":[{"title":"...","description":"...","priority":"low|medium|high","deadline_days":<int>}]}`;
    const text = await callAI({ system, prompt, session: `meeting-${projectId}`, json: true });
    let parsed;
    try {
      parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch {
      parsed = { summary: 'Could not parse structured output.', tasks: [] };
    }
    // Auto-create tasks
    const created = [];
    if (projectId && Array.isArray(parsed.tasks)) {
      for (const t of parsed.tasks) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (t.deadline_days || 7));
        const task = await Task.create({
          title: t.title,
          description: t.description || '',
          project: projectId,
          priority: t.priority || 'medium',
          deadline,
          createdBy: req.user._id,
          history: [{ by: req.user._id, action: 'auto-created from meeting notes' }],
        });
        created.push(task);
      }
    }
    res.json({ summary: parsed.summary, tasks: created });
  } catch (err) {
    next(err);
  }
});

// 3. AI Documentation Generator (README / Report / Feature list / API docs / Future scope)
router.post('/documentation', auth, async (req, res, next) => {
  try {
    const { projectId, docType } = req.body;
    const type = docType || 'readme';
    const project = await Project.findById(projectId).populate('members', 'name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ project: projectId });
    const context = {
      name: project.name,
      description: project.description,
      problem: project.problemStatement,
      techStack: project.techStack,
      members: project.members.map((m) => m.name),
      taskCount: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      features: tasks.filter((t) => t.labels?.includes('feature')).map((t) => t.title),
    };
    const styles = {
      readme: 'a professional GitHub README.md with sections: Overview, Features, Tech Stack, Setup, Usage, Contributors, License',
      report:
        'a formal academic project report with sections: Abstract, Introduction, Problem Statement, Methodology, Implementation, Results, Future Scope, References',
      features: 'a bullet-point feature list grouped by category',
      api: 'API documentation in markdown with example requests and responses',
      future: 'a Future Scope document with 5-8 items, each with rationale',
    };
    const system = 'You are a technical writer generating high-quality markdown documentation.';
    const prompt = `Generate ${styles[type] || styles.readme} for this student project.\n\nContext: ${JSON.stringify(
      context,
      null,
      2
    )}\n\nReturn only the markdown, no wrapping code fences.`;
    const text = await callAI({ system, prompt, session: `doc-${projectId}-${type}` });
    res.json({ document: text, type });
  } catch (err) {
    next(err);
  }
});

// 4. AI Presentation Generator — outputs slide deck outline as JSON
router.post('/presentation', auth, async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const system =
      'You are a presentation designer that outputs a slide deck outline as strict JSON. Each slide has a title and 3-5 concise bullets.';
    const prompt = `Create a 8-slide presentation for the student project:\nName: ${project.name}\nProblem: ${project.problemStatement}\nDescription: ${project.description}\nTech Stack: ${project.techStack.join(', ')}\n\nSlides needed: Problem Statement, Solution, Features, Architecture, Tech Stack, Timeline, Impact, Future Scope.\n\nRespond as JSON: {"slides":[{"title":"...","bullets":["...","..."]}, ...]}`;
    const text = await callAI({ system, prompt, session: `pres-${projectId}`, json: true });
    let parsed;
    try {
      parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch {
      parsed = { slides: [{ title: 'Overview', bullets: [text.slice(0, 200)] }] };
    }
    res.json({ deck: parsed });
  } catch (err) {
    next(err);
  }
});

// 5. Smart Deadline Prediction
router.post('/deadline-prediction', auth, async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ project: projectId });
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed'
    ).length;
    const percentDone = Math.round((done / total) * 100);
    const daysLeft = project.deadline
      ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    const system =
      'You are an AI project risk analyst for student teams. Respond in strict JSON.';
    const prompt = `Project: ${project.name}\nProgress: ${percentDone}% (${done}/${total} tasks)\nOverdue tasks: ${overdue}\nDays left until deadline: ${daysLeft ?? 'unknown'}\n\nPredict deadline risk. JSON: {"risk":"low|medium|high","confidence":<0-100>,"reason":"<sentence>","recommendation":"<actionable suggestion>"}`;
    const text = await callAI({ system, prompt, session: `pred-${projectId}`, json: true });
    let parsed;
    try {
      parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch {
      parsed = {
        risk: overdue > 0 ? 'high' : percentDone < 40 ? 'medium' : 'low',
        confidence: 75,
        reason: 'Based on completion rate and overdue tasks.',
        recommendation: 'Redistribute overdue tasks to available members.',
      };
    }
    res.json({ prediction: parsed, stats: { percentDone, overdue, done, total, daysLeft } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

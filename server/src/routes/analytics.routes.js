const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, async (req, res, next) => {
  try {
    const myProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).select('_id name progress status deadline');
    const projectIds = myProjects.map((p) => p._id);
    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = allTasks.filter((t) => t.assignees.map(String).includes(String(req.user._id)));
    const completed = allTasks.filter((t) => t.status === 'completed').length;
    const inProgress = allTasks.filter((t) => t.status === 'in-progress').length;
    const review = allTasks.filter((t) => t.status === 'review').length;
    const todo = allTasks.filter((t) => t.status === 'todo').length;
    const upcoming = allTasks
      .filter((t) => t.deadline && new Date(t.deadline) > new Date() && t.status !== 'completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
    // Weekly progress: tasks completed per day in last 7 days
    const now = new Date();
    const weekly = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - i));
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = allTasks.filter(
        (t) => t.status === 'completed' && t.updatedAt >= day && t.updatedAt < next
      ).length;
      return {
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count,
      };
    });
    res.json({
      counts: {
        projects: myProjects.length,
        myTasksToday: myTasks.filter((t) => t.status !== 'completed').length,
        upcomingDeadlines: upcoming.length,
        completed,
        inProgress,
        review,
        todo,
      },
      projects: myProjects,
      upcoming,
      weekly,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/contribution/:projectId', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members', 'name avatar activityScore');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ project: project._id });
    const stats = project.members.filter((m) => m).map((m) => {
      const assigned = tasks.filter((t) => t.assignees.map(String).includes(String(m._id)));
      const done = assigned.filter((t) => t.status === 'completed').length;
      const comments = tasks.reduce(
        (acc, t) => acc + t.comments.filter((c) => String(c.author) === String(m._id)).length,
        0
      );
      return {
        user: { _id: m._id, name: m.name, avatar: m.avatar },
        assigned: assigned.length,
        completed: done,
        comments,
        score: done * 5 + comments,
      };
    });
    const totalScore = stats.reduce((a, b) => a + b.score, 0) || 1;
    const withPct = stats.map((s) => ({ ...s, percentage: Math.round((s.score / totalScore) * 100) }));
    res.json({ contributions: withPct });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', auth, async (_req, res, next) => {
  try {
    const users = await User.find()
      .select('name avatar activityScore tasksCompleted')
      .sort({ activityScore: -1 })
      .limit(10);
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const { project, status, assignee } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignee) filter.assignees = assignee;
    if (!project) {
      const mine = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      filter.project = { $in: mine.map((p) => p._id) };
    }
    const tasks = await Task.find(filter)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name')
      .sort({ order: 1, createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, project, assignees, priority, deadline, labels, checklist, status } =
      req.body;
    if (!title || !project) return res.status(400).json({ error: 'Title and project required' });
    const task = await Task.create({
      title,
      description,
      project,
      assignees: assignees || [],
      priority: priority || 'medium',
      deadline,
      labels: labels || [],
      checklist: checklist || [],
      status: status || 'todo',
      createdBy: req.user._id,
      history: [{ by: req.user._id, action: 'created' }],
    });
    if (assignees && assignees.length) {
      await Promise.all(
        assignees.map((uid) =>
          Notification.create({
            user: uid,
            type: 'task_assigned',
            title: 'New task assigned',
            message: `You were assigned to "${title}"`,
          })
        )
      );
    }
    const populated = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    res.json({ task: populated });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('history.by', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'assignees', 'status', 'priority', 'deadline', 'labels', 'checklist', 'order'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const previous = await Task.findById(req.params.id);
    if (!previous) return res.status(404).json({ error: 'Task not found' });
    Object.assign(previous, updates);
    previous.history.push({ by: req.user._id, action: `updated: ${Object.keys(updates).join(', ')}` });
    if (updates.status === 'completed' && previous.status !== 'completed') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { tasksCompleted: 1, activityScore: 5 } });
    }
    await previous.save();
    const populated = await Task.findById(previous._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    res.json({ task: populated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comment', auth, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.comments.push({ author: req.user._id, text });
    task.history.push({ by: req.user._id, action: 'commented' });
    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { activityScore: 1 } });
    const populated = await Task.findById(task._id).populate('comments.author', 'name email avatar');
    res.json({ task: populated });
  } catch (err) {
    next(err);
  }
});

router.post('/reorder', auth, async (req, res, next) => {
  try {
    const { updates } = req.body; // [{id, status, order}]
    await Promise.all(
      (updates || []).map((u) =>
        Task.findByIdAndUpdate(u.id, { status: u.status, order: u.order })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

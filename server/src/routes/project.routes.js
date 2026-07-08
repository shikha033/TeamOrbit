const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('team', 'name inviteCode')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, problemStatement, techStack, team, priority, deadline, hackathonMode, tags } =
      req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    const project = await Project.create({
      name,
      description,
      problemStatement,
      techStack: techStack || [],
      owner: req.user._id,
      members: [req.user._id],
      team,
      priority: priority || 'medium',
      deadline,
      hackathonMode: !!hackathonMode,
      tags: tags || [],
    });
    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar skills');
    res.json({ project: populated });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar skills bio')
      .populate('team', 'name inviteCode');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'description', 'problemStatement', 'techStack', 'status', 'priority', 'deadline', 'progress', 'hackathonMode', 'tags'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (String(project.owner) !== String(req.user._id))
      return res.status(403).json({ error: 'Only owner can delete this project' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/invite', auth, async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.members.map(String).includes(String(userId))) {
      project.members.push(userId);
      await project.save();
    }
    const populated = await Project.findById(project._id).populate('members', 'name email avatar');
    res.json({ project: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const crypto = require('crypto');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

const generateCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

router.get('/', auth, async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar skills')
      .sort({ createdAt: -1 });
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, college } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required' });
    const team = await Team.create({
      name,
      description,
      college,
      owner: req.user._id,
      inviteCode: generateCode(),
      members: [{ user: req.user._id, role: 'owner' }],
    });
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar skills bio');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/join', auth, async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: 'Invite code required' });
    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!team) return res.status(404).json({ error: 'Invalid invite code' });
    const already = team.members.find((m) => String(m.user) === String(req.user._id));
    if (already) return res.status(400).json({ error: 'You are already a member of this team' });
    team.members.push({ user: req.user._id, role: 'member' });
    await team.save();
    await Notification.create({
      user: team.owner,
      type: 'member_joined',
      title: 'New member joined',
      message: `${req.user.name} joined your team "${team.name}"`,
    });
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (String(team.owner) !== String(req.user._id))
      return res.status(403).json({ error: 'Only the owner can delete the team' });
    await team.deleteOne();
    res.json({ message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

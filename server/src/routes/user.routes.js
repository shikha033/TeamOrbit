const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res) => res.json({ user: req.user }));

router.put('/me', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'bio', 'college', 'skills'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

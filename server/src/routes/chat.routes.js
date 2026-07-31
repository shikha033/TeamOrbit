const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// In-memory "who is typing" tracker: { [projectId]: { [userId]: { name, at } } }
// Lightweight by design (matches the existing polling-based chat architecture).
// Entries older than TYPING_TTL_MS are treated as stale and ignored.
const typingMap = {};
const TYPING_TTL_MS = 4000;

router.post('/:projectId/typing', auth, (req, res) => {
  const { projectId } = req.params;
  typingMap[projectId] = typingMap[projectId] || {};
  typingMap[projectId][req.user._id] = { name: req.user.name, at: Date.now() };
  res.json({ ok: true });
});

router.get('/:projectId/typing', auth, (req, res) => {
  const { projectId } = req.params;
  const bucket = typingMap[projectId] || {};
  const now = Date.now();
  const typing = Object.entries(bucket)
    .filter(([uid, v]) => uid !== String(req.user._id) && now - v.at < TYPING_TTL_MS)
    .map(([, v]) => v.name);
  res.json({ typing });
});

router.get('/:projectId', auth, async (req, res, next) => {
  try {
    const messages = await Message.find({ project: req.params.projectId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(200);
    // Auto-mark as read for the current user
    await Message.updateMany(
      { project: req.params.projectId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:projectId', auth, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text required' });
    const message = await Message.create({
      project: req.params.projectId,
      author: req.user._id,
      text,
      readBy: [req.user._id],
    });
    const populated = await Message.findById(message._id).populate('author', 'name email avatar');
    res.json({ message: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

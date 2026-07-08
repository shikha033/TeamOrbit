const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniq = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniq + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload/:taskId', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const url = `/uploads/${req.file.filename}`;
    task.attachments.push({
      name: req.file.originalname,
      url,
      size: req.file.size,
      uploadedBy: req.user.name,
      uploadedAt: new Date(),
    });
    task.history.push({ by: req.user._id, action: `uploaded ${req.file.originalname}` });
    await task.save();
    res.json({ attachment: task.attachments[task.attachments.length - 1] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

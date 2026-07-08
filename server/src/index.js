require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/team.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const fileRoutes = require('./routes/file.routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/', (_req, res) => res.json({ message: 'TeamOrbit API' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'teamorbit-node' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 8002;
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

mongoose
  .connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    console.log(`[MONGO] connected → ${DB_NAME}`);
    app.listen(PORT, '0.0.0.0', () => console.log(`[TEAMORBIT] Node.js API listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('[MONGO] connection error', err);
    process.exit(1);
  });

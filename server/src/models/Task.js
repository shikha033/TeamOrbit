const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    text: String,
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const historySchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    deadline: { type: Date },
    labels: [{ type: String }],
    checklist: [checklistItemSchema],
    comments: [commentSchema],
    attachments: [{ name: String, url: String, size: Number, uploadedBy: String, uploadedAt: Date }],
    history: [historySchema],
    order: { type: Number, default: 0 },
    aiSuggestion: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

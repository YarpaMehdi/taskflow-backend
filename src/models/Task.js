const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign the task to an employee'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });

// Auto-set completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);

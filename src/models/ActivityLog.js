const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'TASK_CREATED',
      'TASK_UPDATED',
      'STATUS_CHANGED',
      'TASK_DELETED',
      'USER_LOGIN',
      'USER_REGISTERED',
      'USER_UPDATED',
      'USER_DELETED',
    ],
  },
  entityType: {
    type: String,
    enum: ['task', 'user'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

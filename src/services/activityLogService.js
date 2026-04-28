const ActivityLog = require('../models/ActivityLog');

const getLogs = async (query) => {
  const { userId, action, startDate, endDate, page = 1, limit = 20 } = query;
  const filter = {};

  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.timestamp.$lte = end;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort('-timestamp')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  };
};

const getLogsByUser = async (userId, query) => {
  return getLogs({ ...query, userId });
};

module.exports = { getLogs, getLogsByUser };

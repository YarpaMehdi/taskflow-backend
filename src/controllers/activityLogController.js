const asyncHandler = require('../utils/asyncHandler');
const activityLogService = require('../services/activityLogService');

const getLogs = asyncHandler(async (req, res) => {
  const result = await activityLogService.getLogs(req.query);
  res.status(200).json({ success: true, ...result });
});

const getLogsByUser = asyncHandler(async (req, res) => {
  const result = await activityLogService.getLogsByUser(req.params.userId, req.query);
  res.status(200).json({ success: true, ...result });
});

module.exports = { getLogs, getLogsByUser };

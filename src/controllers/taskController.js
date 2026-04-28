const asyncHandler = require('../utils/asyncHandler');
const taskService = require('../services/taskService');

// @desc    Create task
// @route   POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user);
  res.status(201).json({ success: true, data: task });
});

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({ success: true, data: task });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id, req.user);
  res.status(200).json({ success: true, ...result });
});

// @desc    Get tasks by user
// @route   GET /api/tasks/user/:userId
const getTasksByUser = asyncHandler(async (req, res) => {
  const result = await taskService.getTasksByUser(req.params.userId, req.query);
  res.status(200).json({ success: true, ...result });
});

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getTasksByUser };

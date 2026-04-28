const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

const createTask = async (taskData, adminUser) => {
  const task = await Task.create({ ...taskData, assignedBy: adminUser._id });
  const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email');

  // Log task creation
  await ActivityLog.create({
    userId: adminUser._id,
    action: 'TASK_CREATED',
    entityType: 'task',
    entityId: task._id,
    details: { title: task.title, assignedTo: task.assignedTo },
  });

  return populated;
};

const getTasks = async (query, user) => {
  const { status, priority, assignedTo, search, sort, page = 1, limit = 10, dateRange, startDate, endDate } = query;
  const filter = {};

  // Employees can only see their own tasks
  if (user.role === 'employee') {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  
  if (dateRange) {
    const now = new Date();
    if (dateRange === 'weekly') {
      filter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === 'monthly') {
      filter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === 'custom' && startDate && endDate) {
      filter.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }
  }

  if (search) {
    const matchingUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    
    if (userIds.length > 0) {
      filter.$or.push({ assignedTo: { $in: userIds } });
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOption = sort ? sort.replace(',', ' ') : '-createdAt';

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignedTo', 'name email department')
    .populate('assignedBy', 'name email');

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const updateTask = async (taskId, updateData, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  // Employees can only update status of their own tasks
  if (user.role === 'employee') {
    if (task.assignedTo.toString() !== user._id.toString()) {
      const error = new Error('Not authorized to update this task');
      error.statusCode = 403;
      throw error;
    }
    // Employees can only update status
    if (Object.keys(updateData).some((key) => key !== 'status')) {
      const error = new Error('Employees can only update task status');
      error.statusCode = 403;
      throw error;
    }
  }

  const oldStatus = task.status;

  Object.assign(task, updateData);
  await task.save();

  const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email');

  // Log the update
  const action = updateData.status && updateData.status !== oldStatus ? 'STATUS_CHANGED' : 'TASK_UPDATED';
  await ActivityLog.create({
    userId: user._id,
    action,
    entityType: 'task',
    entityId: task._id,
    details: {
      title: task.title,
      ...(action === 'STATUS_CHANGED' && { oldStatus, newStatus: updateData.status }),
      changes: updateData,
    },
  });

  return populated;
};

const deleteTask = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await ActivityLog.create({
    userId: user._id,
    action: 'TASK_DELETED',
    entityType: 'task',
    entityId: task._id,
    details: { title: task.title },
  });

  await task.deleteOne();
  return { message: 'Task deleted successfully' };
};

const getTasksByUser = async (userId, query) => {
  const { status, page = 1, limit = 20 } = query;
  const filter = { assignedTo: userId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Task.countDocuments(filter),
  ]);

  return { tasks, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } };
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, getTasksByUser };

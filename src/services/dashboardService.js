const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const getDashboardSummary = async () => {
  const [totalTasks, completed, inProgress, todo, overdue, recentActivity, employees] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'todo' }),
    Task.countDocuments({ status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }),
    ActivityLog.find()
      .populate('userId', 'name email')
      .sort('-timestamp')
      .limit(10)
      .lean(),
    User.find({ role: 'employee' }).lean(),
  ]);

  // Per-employee performance for team table
  const teamPerformance = await Promise.all(
    employees.map(async (emp) => {
      const [empTotal, empCompleted, empInProgress] = await Promise.all([
        Task.countDocuments({ assignedTo: emp._id }),
        Task.countDocuments({ assignedTo: emp._id, status: 'completed' }),
        Task.countDocuments({ assignedTo: emp._id, status: 'in-progress' }),
      ]);

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        assigned: empTotal,
        completed: empCompleted,
        inProgress: empInProgress,
        completionRate: empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0,
      };
    })
  );

  teamPerformance.sort((a, b) => b.completionRate - a.completionRate);

  return {
    stats: { totalTasks, completed, inProgress, todo, overdue },
    recentActivity,
    teamPerformance,
  };
};

const getAnalytics = async () => {
  // Per-employee performance
  const employees = await User.find({ role: 'employee' }).lean();

  const employeeStats = await Promise.all(
    employees.map(async (emp) => {
      const [total, completed, inProgress, todo] = await Promise.all([
        Task.countDocuments({ assignedTo: emp._id }),
        Task.countDocuments({ assignedTo: emp._id, status: 'completed' }),
        Task.countDocuments({ assignedTo: emp._id, status: 'in-progress' }),
        Task.countDocuments({ assignedTo: emp._id, status: 'todo' }),
      ]);

      return {
        employee: { _id: emp._id, name: emp.name, email: emp.email, department: emp.department },
        total,
        completed,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    })
  );

  // Sort by completion rate descending for leaderboard
  employeeStats.sort((a, b) => b.completionRate - a.completionRate);

  // Weekly trend (last 8 weeks)
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = await Task.countDocuments({
      status: 'completed',
      completedAt: { $gte: weekStart, $lt: weekEnd },
    });

    weeks.push({
      week: `Week ${8 - i}`,
      startDate: weekStart,
      completed: count,
    });
  }

  // Task distribution
  const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'todo' }),
  ]);

  return {
    employeeStats,
    weeklyTrend: weeks,
    taskDistribution: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
    },
    totalEmployees: employees.length,
    avgCompletionRate: employeeStats.length > 0
      ? Math.round(employeeStats.reduce((sum, e) => sum + e.completionRate, 0) / employeeStats.length)
      : 0,
  };
};

module.exports = { getDashboardSummary, getAnalytics };

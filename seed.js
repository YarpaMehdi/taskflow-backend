require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const ActivityLog = require('./src/models/ActivityLog');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Task.deleteMany(), ActivityLog.deleteMany()]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@agency.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
    });

    const employees = await User.create([
      { name: 'Sarah Johnson', email: 'sarah@agency.com', password: 'password123', role: 'employee', department: 'Design' },
      { name: 'John Smith', email: 'john@agency.com', password: 'password123', role: 'employee', department: 'Engineering' },
      { name: 'Emma Wilson', email: 'emma@agency.com', password: 'password123', role: 'employee', department: 'Marketing' },
      { name: 'Mike Davis', email: 'mike@agency.com', password: 'password123', role: 'employee', department: 'Engineering' },
      { name: 'Lisa Chen', email: 'lisa@agency.com', password: 'password123', role: 'employee', department: 'Design' },
      { name: 'David Park', email: 'david@agency.com', password: 'password123', role: 'employee', department: 'QA' },
    ]);

    console.log('Created users');

    // Create tasks
    const tasks = await Task.create([
      { title: 'Design Landing Page', description: 'Create high-fidelity mockups for the new client landing page. Include responsive variations for mobile, tablet, and desktop views.', status: 'in-progress', priority: 'high', assignedTo: employees[0]._id, assignedBy: admin._id, dueDate: new Date('2026-05-15') },
      { title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging environment.', status: 'completed', priority: 'medium', assignedTo: employees[1]._id, assignedBy: admin._id, dueDate: new Date('2026-05-10'), completedAt: new Date('2026-05-08') },
      { title: 'Write API Documentation', description: 'Document all REST API endpoints using Swagger/OpenAPI specification. Include request/response examples.', status: 'todo', priority: 'low', assignedTo: employees[2]._id, assignedBy: admin._id, dueDate: new Date('2026-05-20') },
      { title: 'Implement Auth Module', description: 'Build JWT-based authentication with login, register, and password reset functionality.', status: 'in-progress', priority: 'high', assignedTo: employees[3]._id, assignedBy: admin._id, dueDate: new Date('2026-05-08') },
      { title: 'Database Schema Design', description: 'Design and implement MongoDB schemas for users, tasks, and activity logs with proper indexing.', status: 'completed', priority: 'medium', assignedTo: employees[0]._id, assignedBy: admin._id, dueDate: new Date('2026-05-05'), completedAt: new Date('2026-05-04') },
      { title: 'Create User Dashboard', description: 'Build the employee dashboard with task summary widgets, upcoming deadlines, and recent activity.', status: 'todo', priority: 'high', assignedTo: employees[4]._id, assignedBy: admin._id, dueDate: new Date('2026-05-25') },
      { title: 'Unit Testing', description: 'Write comprehensive unit tests for all service layer functions and API endpoints.', status: 'in-progress', priority: 'medium', assignedTo: employees[1]._id, assignedBy: admin._id, dueDate: new Date('2026-05-18') },
      { title: 'Code Review', description: 'Review all pull requests from the team, ensure code quality standards and best practices.', status: 'todo', priority: 'low', assignedTo: employees[2]._id, assignedBy: admin._id, dueDate: new Date('2026-05-22') },
      { title: 'Responsive Design QA', description: 'Test all pages across mobile, tablet, and desktop breakpoints. File bugs for any layout issues.', status: 'in-progress', priority: 'medium', assignedTo: employees[5]._id, assignedBy: admin._id, dueDate: new Date('2026-05-12') },
      { title: 'Performance Optimization', description: 'Analyze and optimize frontend bundle size, implement lazy loading for routes and images.', status: 'todo', priority: 'medium', assignedTo: employees[3]._id, assignedBy: admin._id, dueDate: new Date('2026-05-28') },
      { title: 'Deploy to Production', description: 'Configure production environment, set up SSL, and deploy the application to cloud hosting.', status: 'todo', priority: 'high', assignedTo: employees[1]._id, assignedBy: admin._id, dueDate: new Date('2026-06-01') },
      { title: 'Client Feedback Integration', description: 'Incorporate client feedback from sprint review into the design system and component library.', status: 'completed', priority: 'medium', assignedTo: employees[4]._id, assignedBy: admin._id, dueDate: new Date('2026-05-02'), completedAt: new Date('2026-05-01') },
    ]);

    console.log(`Created ${tasks.length} tasks`);

    // Create activity logs
    await ActivityLog.create([
      { userId: admin._id, action: 'TASK_CREATED', entityType: 'task', entityId: tasks[0]._id, details: { title: 'Design Landing Page', assignedTo: 'Sarah Johnson' }, timestamp: new Date('2026-04-27T10:00:00') },
      { userId: admin._id, action: 'TASK_CREATED', entityType: 'task', entityId: tasks[1]._id, details: { title: 'Setup CI/CD Pipeline', assignedTo: 'John Smith' }, timestamp: new Date('2026-04-27T10:05:00') },
      { userId: employees[0]._id, action: 'STATUS_CHANGED', entityType: 'task', entityId: tasks[0]._id, details: { title: 'Design Landing Page', oldStatus: 'todo', newStatus: 'in-progress' }, timestamp: new Date('2026-04-27T14:30:00') },
      { userId: employees[1]._id, action: 'STATUS_CHANGED', entityType: 'task', entityId: tasks[1]._id, details: { title: 'Setup CI/CD Pipeline', oldStatus: 'in-progress', newStatus: 'completed' }, timestamp: new Date('2026-04-27T13:00:00') },
      { userId: employees[2]._id, action: 'USER_LOGIN', entityType: 'user', entityId: employees[2]._id, details: { email: 'emma@agency.com' }, ipAddress: '192.168.1.45', timestamp: new Date('2026-04-27T12:00:00') },
      { userId: admin._id, action: 'TASK_CREATED', entityType: 'task', entityId: tasks[2]._id, details: { title: 'Write API Documentation', assignedTo: 'Emma Wilson' }, timestamp: new Date('2026-04-27T10:30:00') },
      { userId: employees[3]._id, action: 'STATUS_CHANGED', entityType: 'task', entityId: tasks[3]._id, details: { title: 'Implement Auth Module', oldStatus: 'todo', newStatus: 'in-progress' }, timestamp: new Date('2026-04-27T10:00:00') },
    ]);

    console.log('Created activity logs');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:    admin@agency.com / admin123');
    console.log('   Employee: sarah@agency.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();

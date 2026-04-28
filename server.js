require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const userRoutes = require('./src/routes/userRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');

// Connect to database
connectDB();

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 TrickleUp Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

module.exports = app;

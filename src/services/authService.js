const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const registerUser = async ({ name, email, password, role, department }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password, role, department });
  const token = generateToken(user._id);

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
  };
};

const loginUser = async ({ email, password, ip }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Log the login activity
  await ActivityLog.create({
    userId: user._id,
    action: 'USER_LOGIN',
    entityType: 'user',
    entityId: user._id,
    details: { email: user.email },
    ipAddress: ip,
  });

  const token = generateToken(user._id);

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { registerUser, loginUser, getCurrentUser };

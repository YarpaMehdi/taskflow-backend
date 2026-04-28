const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const result = await authService.registerUser({ name, email, password, role, department });
  res.status(201).json({ success: true, ...result });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await authService.loginUser({ email, password, ip });
  res.status(200).json({ success: true, ...result });
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, getMe };

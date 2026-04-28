const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.status(200).json({ success: true, ...result });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  res.status(200).json({ success: true, ...result });
});

module.exports = { getUsers, getUser, updateUser, deleteUser };

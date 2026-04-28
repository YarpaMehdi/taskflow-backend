const User = require('../models/User');

const getUsers = async (query = {}) => {
  const { search, role, page = 1, limit = 10 } = query;
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (role) {
    filter.role = role;
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const users = await User.find(filter)
    .sort('name')
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const total = await User.countDocuments(filter);

  return {
    data: users,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      limit: limitNumber
    }
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  await user.deleteOne();
  return { message: 'User deleted successfully' };
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };

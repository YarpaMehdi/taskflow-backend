const express = require('express');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

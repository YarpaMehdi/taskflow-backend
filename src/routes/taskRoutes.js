const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, getTask, updateTask, deleteTask, getTasksByUser } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect); // All task routes require authentication

router
  .route('/')
  .get(getTasks)
  .post(
    authorize('admin'),
    [
      body('title').notEmpty().withMessage('Task title is required'),
      body('assignedTo').notEmpty().withMessage('Please assign the task to an employee'),
      body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    ],
    validate,
    createTask
  );

router
  .route('/:id')
  .get(getTask)
  .put(
    [
      body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
      body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    ],
    validate,
    updateTask
  )
  .delete(authorize('admin'), deleteTask);

router.get('/user/:userId', getTasksByUser);

module.exports = router;

const express = require('express');
const { getLogs, getLogsByUser } = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getLogs);
router.get('/user/:userId', getLogsByUser);

module.exports = router;

const express = require('express');
const { getSummary, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDashboardSummary, getRecentActivity } = require('../controllers/dashboardController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Protected dashboard routes
router.use(auth);
router.use(isAdmin); // Ensure only admins can access dashboard data

router.get('/summary', getDashboardSummary);
router.get('/recent-activity', getRecentActivity);

module.exports = router; 
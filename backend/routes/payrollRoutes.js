const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Get all payrolls (admin only)
router.get('/', isAdmin, payrollController.getAllPayrolls);

module.exports = router; 
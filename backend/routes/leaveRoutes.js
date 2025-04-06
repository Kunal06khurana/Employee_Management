const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Protected leave routes
router.use(auth);

// Admin routes
router.get('/all', isAdmin, leaveController.getAllLeaves);
router.get('/pending', isAdmin, leaveController.getPendingLeaves);

// Employee routes
router.get('/employee/:employeeId', leaveController.getEmployeeLeaves);
router.post('/apply', leaveController.applyLeave);
router.put('/:leaveId/status', isAdmin, leaveController.updateLeaveStatus);
router.delete('/:leaveId', leaveController.deleteLeave);

module.exports = router; 
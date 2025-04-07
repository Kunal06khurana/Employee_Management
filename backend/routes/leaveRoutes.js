const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all leaves (admin only)
router.get('/all', isAdmin, leaveController.getAllLeaves);

// Get pending leaves (admin only)
router.get('/pending', isAdmin, leaveController.getPendingLeaves);

// Get leaves for a specific employee
router.get('/:employeeId', leaveController.getEmployeeLeaves);

// Get leave count for salary calculation
router.get('/:employeeId/count', leaveController.getLeaveCount);

// Apply for leave
router.post('/:employeeId', leaveController.addLeave);

// Update leave status (admin only)
router.put('/:leaveId/status', isAdmin, leaveController.updateLeaveStatus);

// Delete leave
router.delete('/:leaveId', isAdmin, leaveController.deleteLeave);

module.exports = router; 
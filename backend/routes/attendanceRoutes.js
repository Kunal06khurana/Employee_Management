const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.use(auth);

// Routes for all authenticated users
router.post('/mark', attendanceController.markAttendance);
router.get('/employee/:id', attendanceController.getEmployeeAttendance);

// Routes for managers
router.get('/department', attendanceController.getDepartmentAttendance);

// Admin only routes
router.put('/:attendanceId', isAdmin, attendanceController.updateAttendance);
router.get('/summary', isAdmin, attendanceController.getAttendanceSummary);

module.exports = router; 
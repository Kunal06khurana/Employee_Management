const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes - require authentication
router.use(verifyToken);

// Routes for all authenticated users
router.post('/mark', attendanceController.addAttendance);
router.get('/employee/:id', attendanceController.getEmployeeAttendance);

// Routes for managers
router.get('/department', attendanceController.getDepartmentAttendance);

// Admin only routes
router.put('/:attendanceId', isAdmin, attendanceController.updateAttendance);
router.get('/summary', isAdmin, attendanceController.getAttendanceSummary);

// Today's attendance route (admin only)
router.get('/today', isAdmin, (req, res, next) => {
  console.log('Today attendance route accessed');
  next();
}, attendanceController.getTodayAttendance);

module.exports = router; 
const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.use(auth);

// Admin only routes
router.get('/all', isAdmin, payrollController.getAllPayrolls);
router.post('/calculate', isAdmin, payrollController.calculateSalary);
router.put('/update/:employeeId', isAdmin, payrollController.updateSalaryDetails);

// Routes accessible by admin and the employee themselves
router.get('/payslip/:id/:month/:year', payrollController.getPayslip);

module.exports = router; 
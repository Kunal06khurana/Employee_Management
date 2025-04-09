const express = require('express');
const router = express.Router();
const employeePayrollController = require('../controllers/employeePayrollController');
const { verifyToken } = require('../middleware/auth');

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Get employee's own payslip
router.get('/payslip/:month/:year', employeePayrollController.getOwnPayslip);

// Get employee's own salary details
router.get('/salary', employeePayrollController.getOwnSalaryDetails);

// Get employee's overtime details
router.get('/overtime', employeePayrollController.getOwnOvertimeDetails);

// Get employee's leave deductions
router.get('/leave-deductions', employeePayrollController.getOwnLeaveDeductions);

module.exports = router; 
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const dependentController = require('../controllers/dependentController');
const attendanceController = require('../controllers/attendanceController');
const leaveController = require('../controllers/leaveController');
const payrollController = require('../controllers/payrollController');

// Debug middleware for all routes
router.use((req, res, next) => {
  console.log('\n=== Employee Route Debug ===');
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Params:`, req.params);
  console.log('===================\n');
  next();
});

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Employee routes
router.get('/', employeeController.getAllEmployees);
router.post('/', isAdmin, employeeController.createEmployee);

// Payroll routes (must be before single employee route)
router.get('/:employeeId/payroll', (req, res, next) => {
  console.log('Payroll route hit:', req.params.employeeId);
  next();
}, payrollController.getPayrollDetails);

router.get('/:employeeId/payroll/payslip/:month/:year', payrollController.getPayslip);
router.get('/:employeeId/payroll/overtime', payrollController.getOvertimeDetails);
router.get('/:employeeId/payroll/leave-deductions', payrollController.getLeaveDeductions);
router.post('/:employeeId/payroll/calculate', isAdmin, payrollController.calculateSalary);
router.post('/:employeeId/payroll', isAdmin, payrollController.updatePayroll);

// Single employee routes
router.get('/:id', (req, res, next) => {
  console.log('Single employee route hit:', req.params.id);
  next();
}, employeeController.getEmployeeById);

router.put('/:id', isAdmin, employeeController.updateEmployee);
router.delete('/:id', isAdmin, employeeController.deleteEmployee);

// Dependent routes
router.get('/:employeeId/dependents', dependentController.getDependents);
router.post('/:employeeId/dependents', dependentController.addDependent);
router.put('/:employeeId/dependents/:dependentId', dependentController.updateDependent);
router.delete('/:employeeId/dependents/:dependentId', dependentController.deleteDependent);

// Attendance routes
router.get('/:employeeId/attendance', attendanceController.getAttendance);
router.get('/:employeeId/attendance/overtime', attendanceController.getOvertimeHours);
router.post('/:employeeId/attendance', isAdmin, attendanceController.addAttendance);
router.put('/:employeeId/attendance/:attendanceId', isAdmin, attendanceController.updateAttendance);

// Leave routes
router.get('/:employeeId/leaves', leaveController.getEmployeeLeaves);
router.get('/:employeeId/leaves/count', leaveController.getLeaveCount);
router.post('/:employeeId/leaves', leaveController.addLeave);
router.put('/:employeeId/leaves/:leaveId', isAdmin, leaveController.updateLeaveStatus);
router.delete('/:employeeId/leaves/:leaveId', isAdmin, leaveController.deleteLeave);

module.exports = router; 
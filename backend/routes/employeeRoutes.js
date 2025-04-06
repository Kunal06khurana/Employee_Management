const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Get all employees
router.get('/', isAdmin, employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', isAdmin, employeeController.getEmployeeById);

// Create new employee
router.post('/', isAdmin, employeeController.createEmployee);

// Update employee
router.put('/:id', isAdmin, employeeController.updateEmployee);

// Delete employee
router.delete('/:id', isAdmin, employeeController.deleteEmployee);

module.exports = router; 
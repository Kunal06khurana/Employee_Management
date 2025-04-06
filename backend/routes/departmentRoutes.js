const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/auth');

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Get all departments (accessible to all authenticated users)
router.get('/', (req, res, next) => {
  console.log('GET /api/departments route hit');
  departmentController.getAllDepartments(req, res, next);
});

// Get department by ID (accessible to all authenticated users)
router.get('/:id', (req, res, next) => {
  console.log(`GET /api/departments/${req.params.id} route hit`);
  departmentController.getDepartmentById(req, res, next);
});

// Admin-only routes
router.post('/', verifyToken, departmentController.createDepartment);
router.put('/:id', verifyToken, departmentController.updateDepartment);
router.delete('/:id', verifyToken, departmentController.deleteDepartment);

module.exports = router; 
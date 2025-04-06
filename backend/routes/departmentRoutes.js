const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/auth');

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('\n=== Department Route Debug ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('===========================\n');
  next();
});

// Get all departments
router.get('/', verifyToken, async (req, res, next) => {
  try {
    console.log('\n=== GET /departments ===');
    console.log('User:', req.user);
    await departmentController.getAllDepartments(req, res);
  } catch (error) {
    console.error('Error in GET /departments:', error);
    next(error);
  }
});

// Get department by ID
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    console.log('\n=== GET /departments/:id ===');
    console.log('ID:', req.params.id);
    console.log('User:', req.user);
    await departmentController.getDepartmentById(req, res);
  } catch (error) {
    console.error('Error in GET /departments/:id:', error);
    next(error);
  }
});

// Create department
router.post('/', verifyToken, async (req, res, next) => {
  try {
    console.log('\n=== POST /departments ===');
    await departmentController.createDepartment(req, res);
  } catch (error) {
    next(error);
  }
});

// Update department
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    console.log('\n=== PUT /departments/:id ===');
    await departmentController.updateDepartment(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete department
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    console.log('\n=== DELETE /departments/:id ===');
    await departmentController.deleteDepartment(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
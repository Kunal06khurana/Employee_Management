const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/admin/login', authController.adminLogin);
router.post('/employee/login', authController.employeeLogin);

// Protected routes
router.get('/verify', auth, authController.verifyToken);
router.post('/admin/register', auth, isAdmin, authController.registerAdmin);

module.exports = router; 
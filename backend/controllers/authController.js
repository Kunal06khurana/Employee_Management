const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const authController = {
  // Admin Login
  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt with email:', email); // Debug log

      // Get admin by email
      const [admins] = await db.query(
        'SELECT * FROM Admin WHERE Email = ?',
        [email]
      );
      console.log('Found admin:', admins[0] ? 'Yes' : 'No'); // Debug log

      const admin = admins[0];
      if (!admin) {
        console.log('No admin found with email:', email); // Debug log
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, admin.Password);
      console.log('Password valid:', validPassword); // Debug log

      if (!validPassword) {
        console.log('Invalid password for admin:', email); // Debug log
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      await db.query(
        'UPDATE Admin SET Last_Login = NOW() WHERE Admin_ID = ?',
        [admin.Admin_ID]
      );

      // Generate token
      const token = jwt.sign(
        { 
          id: admin.Admin_ID,
          isAdmin: true,
          email: admin.Email
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '1d' }
      );

      // Send response
      res.json({
        token,
        user: {
          id: admin.Admin_ID,
          email: admin.Email,
          isAdmin: true
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Employee Login
  employeeLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const [employees] = await db.query(
        `SELECT e.*, d.Manager_ID 
         FROM Employee e 
         LEFT JOIN Department d ON e.Department_ID = d.Department_ID 
         WHERE e.Email = ?`,
        [email]
      );

      if (!employees[0]) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, employees[0].Password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isManager = employees[0].Employee_ID === employees[0].Manager_ID;

      const token = jwt.sign(
        { 
          id: employees[0].Employee_ID,
          isAdmin: false,
          isManager,
          departmentId: employees[0].Department_ID
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: {
          id: employees[0].Employee_ID,
          firstName: employees[0].First_Name,
          lastName: employees[0].Last_Name,
          email: employees[0].Email,
          isAdmin: false,
          isManager,
          departmentId: employees[0].Department_ID
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Register new admin (should be protected)
  registerAdmin: async (req, res) => {
    try {
      const { username, password, email } = req.body;

      // Check if admin already exists
      const [existingAdmins] = await db.query(
        'SELECT * FROM Admin WHERE Username = ? OR Email = ?',
        [username, email]
      );

      if (existingAdmins[0]) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new admin
      await db.query(
        'INSERT INTO Admin (Username, Password, Email) VALUES (?, ?, ?)',
        [username, hashedPassword, email]
      );

      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

module.exports = authController; 
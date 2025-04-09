require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const employeePayrollRoutes = require('./routes/employeePayrollRoutes');

// Middleware
app.use(morgan('dev')); // Add logging
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/employee/payroll', employeePayrollRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n=== Error Details ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('===================\n');
  
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  console.log('\n=== 404 Error ===');
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('===================\n');
  
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n=== Server Started ===');
  console.log(`Time: [${new Date().toISOString()}]`);
  console.log(`Port: ${PORT}`);
  console.log('Test endpoint:', `http://localhost:${PORT}/api/test`);
  console.log('Departments endpoint:', `http://localhost:${PORT}/api/departments`);
  console.log('Attendance endpoint:', `http://localhost:${PORT}/api/attendance`);
  console.log('Employee Payroll endpoint:', `http://localhost:${PORT}/api/employee/payroll`);
  console.log('===================\n');
}); 
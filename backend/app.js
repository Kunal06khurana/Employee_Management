const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();

// Debug CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
console.log('CORS configured with options:', corsOptions);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
  console.log('\n=== Request Details ===');
  console.log(`Time: [${new Date().toISOString()}]`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('===================\n');
  next();
});

// Test route to verify basic functionality
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'API is working' });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const employeePayrollRoutes = require('./routes/employeePayrollRoutes');

console.log('Routes loaded:', {
  auth: !!authRoutes,
  leave: !!leaveRoutes,
  employees: !!employeeRoutes,
  departments: !!departmentRoutes,
  payroll: !!payrollRoutes,
  attendance: !!attendanceRoutes,
  employeePayroll: !!employeePayrollRoutes
});

// Mount routes with debugging
app.use('/api/auth', (req, res, next) => {
  console.log('Auth route accessed');
  next();
}, authRoutes);

app.use('/api/employees', (req, res, next) => {
  console.log('Employees route accessed');
  next();
}, employeeRoutes);

app.use('/api/departments', (req, res, next) => {
  console.log('Departments route accessed');
  next();
}, departmentRoutes);

app.use('/api/leave', (req, res, next) => {
  console.log('Leave route accessed');
  next();
}, leaveRoutes);

app.use('/api/payroll', (req, res, next) => {
  console.log('Payroll route accessed');
  next();
}, payrollRoutes);

// Employee routes
app.use('/api/employee/payroll', employeePayrollRoutes);

// Attendance routes with logging
app.use('/api/attendance', (req, res, next) => {
  console.log('Attendance route accessed');
  next();
}, attendanceRoutes);

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

// 404 handler - must be last
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n=== Server Started ===');
  console.log(`Time: [${new Date().toISOString()}]`);
  console.log(`Port: ${PORT}`);
  console.log('Test endpoint:', `http://localhost:${PORT}/api/test`);
  console.log('Departments endpoint:', `http://localhost:${PORT}/api/departments`);
  console.log('Attendance endpoint:', `http://localhost:${PORT}/api/attendance`);
  console.log('===================\n');
}); 
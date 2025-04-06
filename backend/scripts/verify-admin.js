const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sankalp2005',
  database: process.env.DB_NAME || 'EmployeeSalaryManagement'
});

connection.connect();

// Query to check admin user
connection.query(
  'SELECT Admin_ID, Username, Email, Password FROM Admin WHERE Email = ?',
  ['admin@company.com'],
  function(error, results, fields) {
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log('Admin user found:', results.length > 0);
    if (results.length > 0) {
      console.log('Admin details:', {
        id: results[0].Admin_ID,
        username: results[0].Username,
        email: results[0].Email,
        hasPassword: !!results[0].Password,
        passwordLength: results[0].Password ? results[0].Password.length : 0
      });
    }
    
    process.exit(0);
  }
); 
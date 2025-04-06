const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Sankalp2005',
      database: process.env.DB_NAME || 'EmployeeSalaryManagement'
    });

    // Generate new password hash
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update admin password
    await connection.query(
      `INSERT INTO Admin (Username, Password, Email) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE Password = VALUES(Password)`,
      ['admin', hashedPassword, 'admin@company.com']
    );

    console.log('Admin password reset successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error resetting admin password:', error);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetAdminPassword(); 
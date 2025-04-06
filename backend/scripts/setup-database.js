const mysql = require('mysql2');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sankalp2005',
  multipleStatements: true // Enable multiple statements
});

async function setupDatabase() {
  try {
    // Read SQL files
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const initAdminPath = path.join(__dirname, '../models/init-admin.sql');
    
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    const initAdminSQL = await fs.readFile(initAdminPath, 'utf8');

    // Execute schema.sql
    console.log('Creating database and tables...');
    await connection.promise().query(schemaSQL);
    console.log('Database and tables created successfully.');

    // Switch to the database
    await connection.promise().query('USE EmployeeSalaryManagement');

    // Execute init-admin.sql
    console.log('Initializing admin user...');
    await connection.promise().query(initAdminSQL);
    console.log('Admin user initialized successfully.');

    console.log('\nDatabase setup completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    connection.end();
  }
}

setupDatabase(); 
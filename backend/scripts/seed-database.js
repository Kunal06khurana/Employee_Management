const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sankalp2005',
      database: 'EmployeeSalaryManagement',
      multipleStatements: true // Enable multiple statements
    });

    console.log('Connected to database');

    // Hash password for employees
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('employee123', salt);

    // Read the SQL file
    let sql = await fs.readFile(path.join(__dirname, 'seed-data.sql'), 'utf8');
    
    // Replace placeholder password with actual hashed password
    sql = sql.replace(/\$2a\$10\$your_hashed_password/g, hashedPassword);

    // Execute the SQL statements
    await connection.query(sql);
    console.log('Sample data inserted successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    throw error;
  } finally {
    if (connection) {
      try {
        // Make sure foreign key checks are re-enabled even if there was an error
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }); 
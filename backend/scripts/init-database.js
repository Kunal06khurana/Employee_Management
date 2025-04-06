const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initDatabase() {
  let connection;
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sankalp2005',
      multipleStatements: true
    });

    console.log('Connected to MySQL');

    // Read and execute schema.sql
    const schema = await fs.readFile(path.join(__dirname, '../models/schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('Database schema created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 
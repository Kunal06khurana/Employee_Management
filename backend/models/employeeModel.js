const db = require('./db');

class Employee {
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  static async create(employeeData) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO employees SET ?', employeeData, (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  }

  static async update(id, employeeData) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE employees SET ? WHERE id = ?', [employeeData, id], (err, results) => {
        if (err) reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM employees WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = Employee; 
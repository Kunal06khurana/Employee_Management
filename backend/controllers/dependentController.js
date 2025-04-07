const pool = require('../config/database');

const dependentController = {
  // Get all dependents for an employee
  getDependents: async (req, res) => {
    try {
      const { employeeId } = req.params;

      const [dependents] = await pool.query(
        `SELECT * FROM Dependent WHERE Employee_ID = ?`,
        [employeeId]
      );

      res.json(dependents);
    } catch (error) {
      console.error('Error in getDependents:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Add a new dependent
  addDependent: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { Name, Relationship, DOB, Gender, Contact } = req.body;

      // Validate required fields
      if (!Name || !Relationship || !DOB || !Gender || !Contact) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const [result] = await pool.query(
        `INSERT INTO Dependent (Employee_ID, Name, Relationship, DOB, Gender, Contact)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeId, Name, Relationship, DOB, Gender, Contact]
      );

      res.status(201).json({
        message: 'Dependent added successfully',
        dependentId: result.insertId
      });
    } catch (error) {
      console.error('Error in addDependent:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // Update a dependent
  updateDependent: async (req, res) => {
    try {
      const { employeeId, dependentId } = req.params;
      const { name, relationship, dob, gender, contact } = req.body;

      const [result] = await pool.query(
        `UPDATE Dependent 
         SET Name = ?, Relationship = ?, DOB = ?, Gender = ?, Contact = ?
         WHERE Dependent_ID = ? AND Employee_ID = ?`,
        [name, relationship, dob, gender, contact, dependentId, employeeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Dependent not found' });
      }

      res.json({ message: 'Dependent updated successfully' });
    } catch (error) {
      console.error('Error in updateDependent:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete a dependent
  deleteDependent: async (req, res) => {
    try {
      const { employeeId, dependentId } = req.params;

      const [result] = await pool.query(
        `DELETE FROM Dependent 
         WHERE Dependent_ID = ? AND Employee_ID = ?`,
        [dependentId, employeeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Dependent not found' });
      }

      res.json({ message: 'Dependent deleted successfully' });
    } catch (error) {
      console.error('Error in deleteDependent:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = dependentController; 
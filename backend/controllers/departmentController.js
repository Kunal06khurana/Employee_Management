const db = require('../models/db');

const departmentController = {
  // Get all departments
  getAllDepartments: async (req, res) => {
    try {
      console.log('Fetching all departments...');
      const [departments] = await db.query(`
        SELECT d.*, 
               CONCAT(e.First_Name, ' ', e.Last_Name) as Manager_Name
        FROM Department d
        LEFT JOIN Employee e ON d.Manager_ID = e.Employee_ID
        ORDER BY d.Department_ID
      `);
      
      if (!departments || departments.length === 0) {
        console.log('No departments found');
        return res.json([]); // Return empty array instead of error
      }
      
      console.log('Departments fetched successfully:', departments);
      res.json(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          message: 'Department table does not exist. Please initialize the database.',
          error: error.message 
        });
      }
      res.status(500).json({ 
        message: 'Error fetching departments', 
        error: error.message 
      });
    }
  },

  // Get department by ID
  getDepartmentById: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching department with ID: ${id}`);
      const [departments] = await db.query(`
        SELECT d.*, 
               CONCAT(e.First_Name, ' ', e.Last_Name) as Manager_Name
        FROM Department d
        LEFT JOIN Employee e ON d.Manager_ID = e.Employee_ID
        WHERE d.Department_ID = ?
      `, [id]);

      if (departments.length === 0) {
        console.log(`Department with ID ${id} not found`);
        return res.status(404).json({ message: 'Department not found' });
      }

      console.log('Department fetched successfully:', departments[0]);
      res.json(departments[0]);
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({ message: 'Error fetching department', error: error.message });
    }
  },

  // Create new department
  createDepartment: async (req, res) => {
    try {
      const { Department_Name, Location, Manager_ID } = req.body;
      console.log('Creating new department:', { Department_Name, Location, Manager_ID });

      const [result] = await db.query(`
        INSERT INTO Department (Department_Name, Location, Manager_ID)
        VALUES (?, ?, ?)
      `, [Department_Name, Location, Manager_ID]);

      console.log('Department created successfully with ID:', result.insertId);
      res.status(201).json({
        message: 'Department created successfully',
        departmentId: result.insertId
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({ message: 'Error creating department', error: error.message });
    }
  },

  // Update department
  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { Department_Name, Location, Manager_ID } = req.body;
      console.log(`Updating department with ID ${id}:`, { Department_Name, Location, Manager_ID });

      // Check if department exists
      const [existing] = await db.query('SELECT * FROM Department WHERE Department_ID = ?', [id]);
      if (existing.length === 0) {
        console.log(`Department with ID ${id} not found`);
        return res.status(404).json({ message: 'Department not found' });
      }

      // Prepare update fields
      const updateFields = [];
      const updateValues = [];

      if (Department_Name) { updateFields.push('Department_Name = ?'); updateValues.push(Department_Name); }
      if (Location) { updateFields.push('Location = ?'); updateValues.push(Location); }
      if (Manager_ID !== undefined) { updateFields.push('Manager_ID = ?'); updateValues.push(Manager_ID); }

      if (updateFields.length === 0) {
        console.log('No fields to update');
        return res.status(400).json({ message: 'No fields to update' });
      }

      updateValues.push(id);

      await db.query(`
        UPDATE Department
        SET ${updateFields.join(', ')}
        WHERE Department_ID = ?
      `, updateValues);

      console.log('Department updated successfully');
      res.json({ message: 'Department updated successfully' });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ message: 'Error updating department', error: error.message });
    }
  },

  // Delete department
  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting department with ID: ${id}`);

      // Check if department exists
      const [existing] = await db.query('SELECT * FROM Department WHERE Department_ID = ?', [id]);
      if (existing.length === 0) {
        console.log(`Department with ID ${id} not found`);
        return res.status(404).json({ message: 'Department not found' });
      }

      // Check if department has employees
      const [employees] = await db.query('SELECT COUNT(*) as count FROM Employee WHERE Department_ID = ?', [id]);
      if (employees[0].count > 0) {
        console.log(`Cannot delete department with ID ${id} as it has employees`);
        return res.status(400).json({ message: 'Cannot delete department with employees' });
      }

      await db.query('DELETE FROM Department WHERE Department_ID = ?', [id]);
      console.log('Department deleted successfully');
      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
  }
};

module.exports = departmentController; 
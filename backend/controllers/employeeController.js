const bcrypt = require('bcryptjs');
const db = require('../models/db');

const employeeController = {
  // Get all employees
  getAllEmployees: async (req, res) => {
    try {
      const [employees] = await db.query(`
        SELECT e.*, d.Department_Name
        FROM Employee e
        LEFT JOIN Department d ON e.Department_ID = d.Department_ID
        ORDER BY e.Employee_ID DESC
      `);
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
  },

  // Get employee by ID
  getEmployeeById: async (req, res) => {
    try {
      const { id } = req.params;
      const [employees] = await db.query(`
        SELECT e.*, d.Department_Name
        FROM Employee e
        LEFT JOIN Department d ON e.Department_ID = d.Department_ID
        WHERE e.Employee_ID = ?
      `, [id]);

      if (employees.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employees[0]);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ message: 'Error fetching employee', error: error.message });
    }
  },

  // Create new employee
  createEmployee: async (req, res) => {
    try {
      const {
        First_Name,
        Last_Name,
        Email,
        Job_Title,
        Department_ID,
        Date_Joined,
        DOB,
        Address,
        Contact,
        Bank_Account_Number,
        IFSC_Code,
        Password,
        Performance_Rating
      } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const [result] = await db.query(`
        INSERT INTO Employee (
          First_Name, Last_Name, Email, Job_Title, Department_ID,
          Date_Joined, DOB, Address, Contact, Bank_Account_Number,
          IFSC_Code, Password, Performance_Rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        First_Name, Last_Name, Email, Job_Title, Department_ID,
        Date_Joined, DOB, Address, Contact, Bank_Account_Number,
        IFSC_Code, hashedPassword, Performance_Rating
      ]);

      res.status(201).json({
        message: 'Employee created successfully',
        employeeId: result.insertId
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Error creating employee', error: error.message });
    }
  },

  // Update employee
  updateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        First_Name,
        Last_Name,
        Email,
        Job_Title,
        Department_ID,
        Date_Joined,
        DOB,
        Address,
        Contact,
        Bank_Account_Number,
        IFSC_Code,
        Password,
        Performance_Rating
      } = req.body;

      // Check if employee exists
      const [existing] = await db.query('SELECT * FROM Employee WHERE Employee_ID = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Prepare update fields
      const updateFields = [];
      const updateValues = [];

      if (First_Name) { updateFields.push('First_Name = ?'); updateValues.push(First_Name); }
      if (Last_Name) { updateFields.push('Last_Name = ?'); updateValues.push(Last_Name); }
      if (Email) { updateFields.push('Email = ?'); updateValues.push(Email); }
      if (Job_Title) { updateFields.push('Job_Title = ?'); updateValues.push(Job_Title); }
      if (Department_ID) { updateFields.push('Department_ID = ?'); updateValues.push(Department_ID); }
      if (Date_Joined) { updateFields.push('Date_Joined = ?'); updateValues.push(Date_Joined); }
      if (DOB) { updateFields.push('DOB = ?'); updateValues.push(DOB); }
      if (Address) { updateFields.push('Address = ?'); updateValues.push(Address); }
      if (Contact) { updateFields.push('Contact = ?'); updateValues.push(Contact); }
      if (Bank_Account_Number) { updateFields.push('Bank_Account_Number = ?'); updateValues.push(Bank_Account_Number); }
      if (IFSC_Code) { updateFields.push('IFSC_Code = ?'); updateValues.push(IFSC_Code); }
      if (Password) {
        const hashedPassword = await bcrypt.hash(Password, 10);
        updateFields.push('Password = ?');
        updateValues.push(hashedPassword);
      }
      if (Performance_Rating !== undefined) {
        updateFields.push('Performance_Rating = ?');
        updateValues.push(Performance_Rating);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      updateValues.push(id);

      await db.query(`
        UPDATE Employee
        SET ${updateFields.join(', ')}
        WHERE Employee_ID = ?
      `, updateValues);

      res.json({ message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
  },

  // Delete employee
  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if employee exists
      const [existing] = await db.query('SELECT * FROM Employee WHERE Employee_ID = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      await db.query('DELETE FROM Employee WHERE Employee_ID = ?', [id]);

      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
  },

  // Get employees by department (for managers)
  getDepartmentEmployees: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const [employees] = await db.promise().query(
        `SELECT e.* 
         FROM Employee e
         WHERE e.Department_ID = ?`,
        [departmentId]
      );
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get employee details
  getEmployeeDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const [[employee]] = await db.promise().query(
        `SELECT 
          e.Employee_ID as id,
          CONCAT(e.First_Name, ' ', e.Last_Name) as name,
          e.Email as email,
          e.Job_Title as position,
          d.Department_Name as department,
          e.Date_Joined as joinDate,
          p.Basic_Salary as salary,
          e.Contact as phone,
          e.Address as address,
          e.Bank_Account_Number as bankAccount,
          CASE
            WHEN l.Status = 'Approved' AND l.Start_Date <= CURDATE() AND l.End_Date >= CURDATE() THEN 'on_leave'
            WHEN e.Employee_ID IN (SELECT Manager_ID FROM Department WHERE Manager_ID IS NOT NULL) THEN 'manager'
            ELSE 'active'
          END as status
         FROM Employee e
         LEFT JOIN Department d ON e.Department_ID = d.Department_ID
         LEFT JOIN Payroll p ON e.Employee_ID = p.Employee_ID
         LEFT JOIN \`Leave\` l ON e.Employee_ID = l.Employee_ID AND l.Status = 'Approved'
         AND CURDATE() BETWEEN l.Start_Date AND l.End_Date
         WHERE e.Employee_ID = ?`,
        [id]
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = employeeController; 
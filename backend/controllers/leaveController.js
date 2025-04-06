const db = require('../models/db');

const leaveController = {
  // Get all leaves
  getAllLeaves: async (req, res) => {
    try {
      const [leaves] = await db.query(`
        SELECT l.*, e.First_Name, e.Last_Name, e.Email, e.Department_ID,
               d.Department_Name
        FROM \`Leave\` l
        JOIN Employee e ON l.Employee_ID = e.Employee_ID
        LEFT JOIN Department d ON e.Department_ID = d.Department_ID
        ORDER BY l.Start_Date DESC
      `);
      
      res.json(leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
  },

  // Get leaves for a specific employee
  getEmployeeLeaves: async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      const [leaves] = await db.query(`
        SELECT l.*, e.First_Name, e.Last_Name
        FROM \`Leave\` l
        JOIN Employee e ON l.Employee_ID = e.Employee_ID
        WHERE l.Employee_ID = ?
        ORDER BY l.Start_Date DESC
      `, [employeeId]);
      
      res.json(leaves);
    } catch (error) {
      console.error('Error fetching employee leaves:', error);
      res.status(500).json({ message: 'Error fetching employee leaves', error: error.message });
    }
  },

  // Apply for leave
  applyLeave: async (req, res) => {
    try {
      const { employeeId, leaveType, startDate, endDate } = req.body;
      
      const [result] = await db.query(`
        INSERT INTO \`Leave\` (Employee_ID, Leave_Type, Start_Date, End_Date, Status)
        VALUES (?, ?, ?, ?, 'Pending')
      `, [employeeId, leaveType, startDate, endDate]);
      
      res.json({ message: 'Leave application submitted successfully', leaveId: result.insertId });
    } catch (error) {
      console.error('Error applying for leave:', error);
      res.status(500).json({ message: 'Error applying for leave', error: error.message });
    }
  },

  // Update leave status (approve/reject)
  updateLeaveStatus: async (req, res) => {
    try {
      const { leaveId } = req.params;
      const { status } = req.body;
      
      // Update leave status
      await db.query(`
        UPDATE \`Leave\`
        SET Status = ?
        WHERE Leave_ID = ?
      `, [status, leaveId]);
      
      // If approved, update leave balance
      if (status === 'Approved') {
        await db.query(`
          UPDATE Employee e
          JOIN \`Leave\` l ON e.Employee_ID = l.Employee_ID
          SET e.Leave_Balance = e.Leave_Balance - DATEDIFF(l.End_Date, l.Start_Date) - 1
          WHERE l.Leave_ID = ?
        `, [leaveId]);
      }
      
      res.json({ message: `Leave ${status.toLowerCase()} successfully` });
    } catch (error) {
      console.error('Error updating leave status:', error);
      res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
  },

  // Delete leave application
  deleteLeave: async (req, res) => {
    try {
      const { leaveId } = req.params;
      
      await db.query('DELETE FROM \`Leave\` WHERE Leave_ID = ?', [leaveId]);
      
      res.json({ message: 'Leave application deleted successfully' });
    } catch (error) {
      console.error('Error deleting leave:', error);
      res.status(500).json({ message: 'Error deleting leave', error: error.message });
    }
  },

  // Get all pending leave requests (admin or manager)
  getPendingLeaves: async (req, res) => {
    try {
      const [leaves] = await db.query(
        `SELECT l.*, 
          e.First_Name, 
          e.Last_Name, 
          e.Email,
          d.Department_Name
        FROM \`Leave\` l
        JOIN Employee e ON l.Employee_ID = e.Employee_ID
        LEFT JOIN Department d ON e.Department_ID = d.Department_ID
        WHERE l.Status = 'Pending'
        ORDER BY l.Start_Date DESC`
      );

      res.json(leaves);
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
      res.status(500).json({ message: 'Error fetching pending leaves' });
    }
  }
};

module.exports = leaveController; 
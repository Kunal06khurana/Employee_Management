const pool = require('../config/database');

const leaveController = {
  // Get all leaves
  getAllLeaves: async (req, res) => {
    try {
      const [leaves] = await pool.query(`
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

  // Get all leaves for an employee
  getEmployeeLeaves: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [leaves] = await pool.query(
        `SELECT * FROM \`Leave\` 
         WHERE Employee_ID = ? 
         AND MONTH(Start_Date) = ? 
         AND YEAR(Start_Date) = ?
         ORDER BY Start_Date DESC`,
        [employeeId, currentMonth, currentYear]
      );

      res.json(leaves);
    } catch (error) {
      console.error('Error in getEmployeeLeaves:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get leave count for salary deduction
  getLeaveCount: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [leaveCount] = await pool.query(
        `SELECT COUNT(*) as total_leaves,
         SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) as approved_leaves
         FROM \`Leave\`
         WHERE Employee_ID = ? 
         AND MONTH(Start_Date) = ? 
         AND YEAR(Start_Date) = ?`,
        [employeeId, currentMonth, currentYear]
      );

      res.json({
        totalLeaves: leaveCount[0].total_leaves || 0,
        approvedLeaves: leaveCount[0].approved_leaves || 0
      });
    } catch (error) {
      console.error('Error in getLeaveCount:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Add new leave request
  addLeave: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { leaveType, startDate, endDate, status = 'Pending' } = req.body;

      const [result] = await pool.query(
        `INSERT INTO \`Leave\` (
          Employee_ID, Leave_Type, Start_Date, End_Date, Status
        ) VALUES (?, ?, ?, ?, ?)`,
        [employeeId, leaveType, startDate, endDate, status]
      );

      res.status(201).json({
        message: 'Leave request added successfully',
        leaveId: result.insertId
      });
    } catch (error) {
      console.error('Error in addLeave:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update leave status
  updateLeaveStatus: async (req, res) => {
    try {
      const { employeeId, leaveId } = req.params;
      const { status } = req.body;

      const [result] = await pool.query(
        `UPDATE \`Leave\` 
         SET Status = ?
         WHERE Leave_ID = ? AND Employee_ID = ?`,
        [status, leaveId, employeeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Leave request not found' });
      }

      res.json({ message: 'Leave status updated successfully' });
    } catch (error) {
      console.error('Error in updateLeaveStatus:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete leave application
  deleteLeave: async (req, res) => {
    try {
      const { leaveId } = req.params;
      
      await pool.query('DELETE FROM \`Leave\` WHERE Leave_ID = ?', [leaveId]);
      
      res.json({ message: 'Leave application deleted successfully' });
    } catch (error) {
      console.error('Error deleting leave:', error);
      res.status(500).json({ message: 'Error deleting leave', error: error.message });
    }
  },

  // Get all pending leave requests (admin or manager)
  getPendingLeaves: async (req, res) => {
    try {
      const [leaves] = await pool.query(
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
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

      const [leaves] = await pool.query(
        `SELECT * FROM \`Leave\` 
         WHERE Employee_ID = ? 
         ORDER BY Start_Date DESC`,
        [employeeId]
      );

      res.json(leaves);
    } catch (error) {
      console.error('Error in getEmployeeLeaves:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // Get leave count for salary deduction
  getLeaveCount: async (req, res) => {
    try {
      const { employeeId } = req.params;

      // Get employee's leave balance
      const [[employee]] = await pool.query(
        `SELECT Leave_Balance FROM Employee WHERE Employee_ID = ?`,
        [employeeId]
      );

      // Get approved leaves count
      const [leaveCount] = await pool.query(
        `SELECT COUNT(*) as approved_leaves
         FROM \`Leave\`
         WHERE Employee_ID = ? 
         AND Status = 'Approved'`,
        [employeeId]
      );

      res.json({
        leaveBalance: employee.Leave_Balance || 0,
        approvedLeaves: leaveCount[0].approved_leaves || 0
      });
    } catch (error) {
      console.error('Error in getLeaveCount:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // Add new leave request
  addLeave: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { 
        Leave_Type, 
        Start_Date, 
        End_Date, 
        Status = 'Pending', 
        Remarks 
      } = req.body;

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Get current leave balance
        const [[employee]] = await connection.query(
          `SELECT Leave_Balance FROM Employee WHERE Employee_ID = ?`,
          [employeeId]
        );

        // Insert leave request
        const [leaveResult] = await connection.query(
          `INSERT INTO \`Leave\` (
            Employee_ID, Leave_Type, Start_Date, End_Date, Status, Leave_Balance, Remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [employeeId, Leave_Type, Start_Date, End_Date, Status, employee.Leave_Balance, Remarks]
        );

        // Commit the transaction
        await connection.commit();
        
        res.status(201).json({
          message: 'Leave request added successfully',
          leaveId: leaveResult.insertId
        });
      } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        throw error;
      } finally {
        // Release the connection
        connection.release();
      }
    } catch (error) {
      console.error('Error in addLeave:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // Update leave status
  updateLeaveStatus: async (req, res) => {
    try {
      const { employeeId, leaveId } = req.params;
      const { status } = req.body;

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Get leave request details
        const [[leaveRequest]] = await connection.query(
          `SELECT * FROM \`Leave\` WHERE Leave_ID = ? AND Employee_ID = ?`,
          [leaveId, employeeId]
        );

        if (!leaveRequest) {
          await connection.rollback();
          return res.status(404).json({ message: 'Leave request not found' });
        }

        // Get current leave balance
        const [[employee]] = await connection.query(
          `SELECT Leave_Balance FROM Employee WHERE Employee_ID = ?`,
          [employeeId]
        );

        // Calculate leave duration
        const startDate = new Date(leaveRequest.Start_Date);
        const endDate = new Date(leaveRequest.End_Date);
        const diffTime = Math.abs(endDate - startDate);
        const leaveDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

        // Update leave status
        await connection.query(
          `UPDATE \`Leave\` SET Status = ? WHERE Leave_ID = ? AND Employee_ID = ?`,
          [status, leaveId, employeeId]
        );

        // If leave is approved, reduce the leave balance
        if (status === 'Approved') {
          const newBalance = employee.Leave_Balance - leaveDuration;
          if (newBalance < 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Insufficient leave balance' });
          }

          await connection.query(
            `UPDATE Employee SET Leave_Balance = ? WHERE Employee_ID = ?`,
            [newBalance, employeeId]
          );
        }

        // Commit the transaction
        await connection.commit();
        res.json({ message: 'Leave status updated successfully' });
      } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        throw error;
      } finally {
        // Release the connection
        connection.release();
      }
    } catch (error) {
      console.error('Error in updateLeaveStatus:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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
          e.Employee_ID,
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
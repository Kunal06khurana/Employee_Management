const pool = require('../config/database');

const attendanceController = {
  // Get attendance for an employee
  getAttendance: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [attendance] = await pool.query(
        `SELECT * FROM Attendance 
         WHERE Employee_ID = ? 
         AND MONTH(Date) = ? 
         AND YEAR(Date) = ?
         ORDER BY Date DESC`,
        [employeeId, currentMonth, currentYear]
      );

      res.json(attendance);
    } catch (error) {
      console.error('Error in getAttendance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get overtime hours for an employee
  getOvertimeHours: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [overtimeResult] = await pool.query(
        `SELECT 
           SUM(GREATEST(Hours_Worked - 8, 0)) as total_overtime,
           COUNT(*) as total_days,
           SUM(Hours_Worked) as total_hours
         FROM Attendance 
         WHERE Employee_ID = ? 
         AND MONTH(Date) = ? 
         AND YEAR(Date) = ?`,
        [employeeId, currentMonth, currentYear]
      );

      res.json({
        overtimeHours: overtimeResult[0].total_overtime || 0,
        totalDays: overtimeResult[0].total_days || 0,
        totalHours: overtimeResult[0].total_hours || 0
      });
    } catch (error) {
      console.error('Error in getOvertimeHours:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Add attendance record
  addAttendance: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { date, hoursWorked, status, shiftDetails } = req.body;

      const [result] = await pool.query(
        `INSERT INTO Attendance (
          Employee_ID, Date, Hours_Worked, Status, Shift_Details
        ) VALUES (?, ?, ?, ?, ?)`,
        [employeeId, date, hoursWorked, status, shiftDetails]
      );

      res.status(201).json({
        message: 'Attendance record added successfully',
        attendanceId: result.insertId
      });
    } catch (error) {
      console.error('Error in addAttendance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update attendance record
  updateAttendance: async (req, res) => {
    try {
      const { employeeId, attendanceId } = req.params;
      const { hoursWorked, status, shiftDetails } = req.body;

      const [result] = await pool.query(
        `UPDATE Attendance 
         SET Hours_Worked = ?, Status = ?, Shift_Details = ?
         WHERE Attendance_ID = ? AND Employee_ID = ?`,
        [hoursWorked, status, shiftDetails, attendanceId, employeeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      res.json({ message: 'Attendance record updated successfully' });
    } catch (error) {
      console.error('Error in updateAttendance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get attendance for an employee
  getEmployeeAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      const { month, year } = req.query;

      console.log('Getting attendance for employee:', id);
      console.log('User requesting:', req.user);

      // Check permissions
      if (!req.user.isAdmin && req.user.id !== parseInt(id) &&
          (!req.user.isManager || req.user.departmentId !== parseInt(id))) {
        console.log('Access denied for user:', req.user.id);
        return res.status(403).json({ message: 'Access denied' });
      }

      let query = `
        SELECT a.*, e.First_Name, e.Last_Name
        FROM Attendance a
        JOIN Employee e ON e.Employee_ID = a.Employee_ID
        WHERE a.Employee_ID = ?`;
      
      const params = [id];

      if (month && year) {
        query += ' AND MONTH(a.Date) = ? AND YEAR(a.Date) = ?';
        params.push(month, year);
      }

      query += ' ORDER BY a.Date DESC';

      console.log('Executing query:', query);
      console.log('With params:', params);

      const [attendance] = await pool.query(query, params);
      console.log('Found attendance records:', attendance.length);
      
      res.json(attendance);
    } catch (error) {
      console.error('Error in getEmployeeAttendance:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get department attendance (for managers)
  getDepartmentAttendance: async (req, res) => {
    try {
      const { date } = req.query;
      const departmentId = req.user.departmentId;

      const [attendance] = await pool.query(
        `SELECT a.*, e.First_Name, e.Last_Name
         FROM Attendance a
         JOIN Employee e ON e.Employee_ID = a.Employee_ID
         WHERE e.Department_ID = ? AND a.Date = ?
         ORDER BY e.First_Name`,
        [departmentId, date]
      );

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get attendance summary (admin only)
  getAttendanceSummary: async (req, res) => {
    try {
      const { month, year } = req.query;

      const [summary] = await pool.query(
        `SELECT e.Employee_ID, e.First_Name, e.Last_Name,
                COUNT(CASE WHEN a.Status = 'Present' THEN 1 END) as present_days,
                COUNT(CASE WHEN a.Status = 'Absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN a.Status = 'Half-Day' THEN 1 END) as half_days,
                COUNT(CASE WHEN a.Status = 'Leave' THEN 1 END) as leave_days,
                SUM(a.Hours_Worked) as total_hours
         FROM Employee e
         LEFT JOIN Attendance a ON e.Employee_ID = a.Employee_ID
         AND MONTH(a.Date) = ? AND YEAR(a.Date) = ?
         GROUP BY e.Employee_ID`,
        [month, year]
      );

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get today's attendance (admin only)
  getTodayAttendance: async (req, res) => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching attendance for date:', today);
      
      // First get all attendance records for today with employee details
      const [attendance] = await pool.query(
        `SELECT 
          a.Attendance_ID,
          a.Employee_ID,
          e.First_Name,
          e.Last_Name,
          a.Date,
          a.Hours_Worked,
          a.Status,
          a.Shift_Details
         FROM Attendance a
         JOIN Employee e ON e.Employee_ID = a.Employee_ID
         WHERE DATE(a.Date) = ?
         ORDER BY e.First_Name`,
        [today]
      );

      // Get summary counts
      const [summary] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN Status = 'Present' THEN 1 END) as present_count,
          COUNT(CASE WHEN Status = 'Absent' THEN 1 END) as absent_count,
          COUNT(CASE WHEN Status = 'Half-Day' THEN 1 END) as half_day_count,
          COUNT(CASE WHEN Status = 'Leave' THEN 1 END) as leave_count
         FROM Attendance
         WHERE DATE(Date) = ?`,
        [today]
      );

      console.log('Attendance records found:', attendance.length);
      console.log('Summary:', summary[0]);

      res.json({
        attendance,
        summary: summary[0]
      });
    } catch (error) {
      console.error('Error in getTodayAttendance:', error);
      res.status(500).json({ 
        message: 'Error fetching today\'s attendance',
        error: error.message 
      });
    }
  }
};

module.exports = attendanceController; 
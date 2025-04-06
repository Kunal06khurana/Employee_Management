const db = require('../models/db');

const attendanceController = {
  // Mark attendance for an employee
  markAttendance: async (req, res) => {
    try {
      const { date, status, hoursWorked, shiftDetails } = req.body;
      const employeeId = req.user.id;

      // Check if attendance already marked for the date
      const [[existing]] = await db.promise().query(
        'SELECT * FROM Attendance WHERE Employee_ID = ? AND Date = ?',
        [employeeId, date]
      );

      if (existing) {
        return res.status(400).json({ message: 'Attendance already marked for this date' });
      }

      // Insert attendance record
      await db.promise().query(
        `INSERT INTO Attendance (Employee_ID, Date, Status, Hours_Worked, Shift_Details)
         VALUES (?, ?, ?, ?, ?)`,
        [employeeId, date, status, hoursWorked, shiftDetails]
      );

      // If overtime hours, update payroll
      if (hoursWorked > 8) {
        const overtimeHours = hoursWorked - 8;
        await db.promise().query(
          `UPDATE Payroll SET Overtime_Hours = Overtime_Hours + ?
           WHERE Employee_ID = ?`,
          [overtimeHours, employeeId]
        );
      }

      res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get attendance for an employee
  getEmployeeAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      const { month, year } = req.query;

      // Check permissions
      if (!req.user.isAdmin && req.user.id !== parseInt(id) &&
          (!req.user.isManager || req.user.departmentId !== req.user.departmentId)) {
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

      const [attendance] = await db.promise().query(query, params);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get department attendance (for managers)
  getDepartmentAttendance: async (req, res) => {
    try {
      const { date } = req.query;
      const departmentId = req.user.departmentId;

      const [attendance] = await db.promise().query(
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

  // Update attendance (admin only)
  updateAttendance: async (req, res) => {
    try {
      const { attendanceId } = req.params;
      const { status, hoursWorked, shiftDetails } = req.body;

      await db.promise().query(
        `UPDATE Attendance SET
         Status = ?,
         Hours_Worked = ?,
         Shift_Details = ?
         WHERE Attendance_ID = ?`,
        [status, hoursWorked, shiftDetails, attendanceId]
      );

      res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get attendance summary (admin only)
  getAttendanceSummary: async (req, res) => {
    try {
      const { month, year } = req.query;

      const [summary] = await db.promise().query(
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
  }
};

module.exports = attendanceController; 
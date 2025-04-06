const pool = require('../config/database');

const getDashboardSummary = async (req, res) => {
  try {
    // Get total employees
    const [employeeCount] = await pool.query(
      'SELECT COUNT(*) as total FROM Employee'
    );

    // Get department statistics
    const [departmentStats] = await pool.query(`
      SELECT 
        d.Department_ID,
        d.Department_Name,
        COUNT(e.Employee_ID) as EmployeeCount,
        COALESCE(AVG(p.Basic_Salary), 0) as AverageSalary
      FROM Department d
      LEFT JOIN Employee e ON d.Department_ID = e.Department_ID
      LEFT JOIN Payroll p ON e.Employee_ID = p.Employee_ID
      GROUP BY d.Department_ID, d.Department_Name
    `);

    res.json({
      totalEmployees: employeeCount[0].total,
      departmentStats: departmentStats.map(dept => ({
        ...dept,
        AverageSalary: Number(dept.AverageSalary) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Error fetching dashboard summary' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    // Get recent leave requests and status changes
    const [recentLeaves] = await pool.query(`
      SELECT 
        l.Leave_ID,
        CONCAT(e.First_Name, ' ', e.Last_Name) as employee_name,
        l.Leave_Type,
        l.Status,
        GREATEST(l.Start_Date, COALESCE(l.Updated_At, l.Start_Date)) as timestamp,
        'leave_request' as activity_type
      FROM \`Leave\` l
      JOIN Employee e ON l.Employee_ID = e.Employee_ID
      ORDER BY timestamp DESC
      LIMIT 5
    `);

    // Get recent attendance records
    const [recentAttendance] = await pool.query(`
      SELECT 
        a.Attendance_ID,
        CONCAT(e.First_Name, ' ', e.Last_Name) as employee_name,
        a.Status,
        a.Date as timestamp,
        'attendance' as activity_type
      FROM Attendance a
      JOIN Employee e ON a.Employee_ID = e.Employee_ID
      ORDER BY a.Date DESC
      LIMIT 5
    `);

    // Combine and format activities
    const activities = [...recentLeaves, ...recentAttendance]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(activity => {
        let description = '';
        if (activity.activity_type === 'leave_request') {
          if (activity.Status === 'Pending') {
            description = `${activity.employee_name} requested ${activity.Leave_Type} leave`;
          } else if (activity.Status === 'Approved') {
            description = `${activity.employee_name}'s ${activity.Leave_Type} leave was approved`;
          } else {
            description = `${activity.employee_name}'s ${activity.Leave_Type} leave was rejected`;
          }
        } else {
          description = `${activity.employee_name} marked as ${activity.Status}`;
        }
        return {
          description,
          timestamp: activity.timestamp
        };
      });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

module.exports = {
  getDashboardSummary,
  getRecentActivity
}; 
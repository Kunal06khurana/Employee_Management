const pool = require('../config/database');

const employeePayrollController = {
  // Get employee's own payslip
  getOwnPayslip: async (req, res) => {
    try {
      const employeeId = req.user.id; // Get employee ID from JWT token
      const { month, year } = req.params;
      
      // Validate month and year
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ message: 'Invalid month or year' });
      }
      
      const currentDate = new Date();
      const isCurrentMonth = monthNum === currentDate.getMonth() + 1 && yearNum === currentDate.getFullYear();
      const isFutureMonth = yearNum > currentDate.getFullYear() || 
                           (yearNum === currentDate.getFullYear() && monthNum > currentDate.getMonth() + 1);
      
      // For future months, return a projected payslip
      if (isFutureMonth) {
        // Get employee details
        const [[employee]] = await pool.query(
          `SELECT e.*, e.Basic_Salary 
           FROM Employee e
           WHERE e.Employee_ID = ?`,
          [employeeId]
        );

        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }

        // Get number of dependents for insurance calculation
        const [dependentResult] = await pool.query(
          `SELECT COUNT(*) as dependent_count
           FROM Dependent
           WHERE Employee_ID = ?`,
          [employeeId]
        );

        const basicSalary = employee.Basic_Salary || 0;
        const dependentCount = dependentResult[0].dependent_count || 0;

        // Calculate components according to requirements
        const tax = basicSalary * 0.1; // 10% of basic salary
        const allowances = basicSalary * 0.05; // 5% of basic salary
        const bonus = basicSalary * 0.1; // 10% of basic salary
        const leaveDeductions = 0; // No leaves for future months
        const insurance = 1000 * (1 + dependentCount);
        const overtimeHours = 0; // No overtime for future months

        // Calculate net salary
        const netSalary = (
          basicSalary - 
          tax + 
          allowances - 
          insurance + 
          overtimeHours - 
          leaveDeductions + 
          bonus
        );

        const projectedPayslip = {
          Employee_ID: employeeId,
          First_Name: employee.First_Name,
          Last_Name: employee.Last_Name,
          Department_ID: employee.Department_ID,
          Basic_Salary: basicSalary,
          Overtime_Hours: overtimeHours,
          Bonus: bonus,
          Tax: tax,
          Insurance: insurance,
          Leave_Deductions: leaveDeductions,
          Net_Salary: netSalary,
          Allowances: allowances,
          Payment_Date: new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0],
          Is_Projected: true
        };

        return res.json(projectedPayslip);
      }

      // First try to get existing payslip
      const [[payslip]] = await pool.query(
        `SELECT p.*, e.First_Name, e.Last_Name, e.Department_ID,
                d.Department_Name
         FROM Payroll p
         JOIN Employee e ON p.Employee_ID = e.Employee_ID
         LEFT JOIN Department d ON e.Department_ID = d.Department_ID
         WHERE p.Employee_ID = ? 
         AND MONTH(p.Payment_Date) = ?
         AND YEAR(p.Payment_Date) = ?`,
        [employeeId, monthNum, yearNum]
      );

      // Get employee details
      const [[employee]] = await pool.query(
        `SELECT e.*, e.Basic_Salary 
         FROM Employee e
         WHERE e.Employee_ID = ?`,
        [employeeId]
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Get overtime hours and total hours worked
      const [overtimeResult] = await pool.query(
        `SELECT 
           SUM(GREATEST(Hours_Worked - 8, 0)) as total_overtime,
           SUM(Hours_Worked) as total_hours
         FROM Attendance 
         WHERE Employee_ID = ? 
         AND MONTH(Date) = ? 
         AND YEAR(Date) = ?`,
        [employeeId, month, year]
      );

      // Get approved leaves
      const [leaveResult] = await pool.query(
        `SELECT COUNT(*) as approved_leaves
         FROM \`Leave\`
         WHERE Employee_ID = ? 
         AND Status = 'Approved'
         AND MONTH(Start_Date) = ?
         AND YEAR(Start_Date) = ?`,
        [employeeId, monthNum, yearNum]
      );

      // Get number of dependents for insurance calculation
      const [dependentResult] = await pool.query(
        `SELECT COUNT(*) as dependent_count
         FROM Dependent
         WHERE Employee_ID = ?`,
        [employeeId]
      );

      const basicSalary = employee.Basic_Salary || 0;
      const overtime = overtimeResult[0].total_overtime || 0;
      const totalHours = overtimeResult[0].total_hours || 0;
      const approvedLeaves = leaveResult[0].approved_leaves || 0;
      const dependentCount = dependentResult[0].dependent_count || 0;

      // Calculate components according to requirements
      const tax = basicSalary * 0.1; // 10% of basic salary
      const allowances = basicSalary * 0.05; // 5% of basic salary
      const bonus = basicSalary * 0.1; // 10% of basic salary
      const leaveDeductions = approvedLeaves * 1000; // 1000 per leave
      
      // Calculate insurance: 1000*(1 + dependents)
      const insurance = 1000 * (1 + dependentCount);
      const overtimeHours = 100 * (overtime);
      // console.log(overtimeHours);

      // Calculate net salary
      const netSalary = (
        basicSalary - 
        tax + 
        allowances - 
        insurance + 
        overtimeHours - 
        leaveDeductions + 
        bonus
      );

      // If it's current month or no payslip exists, return calculated values
      if (isCurrentMonth || !payslip) {
        const calculatedPayslip = {
          Employee_ID: employeeId,
          First_Name: employee.First_Name,
          Last_Name: employee.Last_Name,
          Department_ID: employee.Department_ID,
          Basic_Salary: basicSalary,
          Overtime_Hours: overtimeHours,
          Bonus: bonus,
          Tax: tax,
          Insurance: insurance,
          Leave_Deductions: leaveDeductions,
          Net_Salary: netSalary,
          Allowances: allowances,
          Payment_Date: new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0]
        };

        // If it's current month, save the calculated payslip
        if (isCurrentMonth) {
          try {
            await pool.query(
              `INSERT INTO Payroll (
                Employee_ID, Basic_Salary, Overtime_Hours, Bonus,
                Tax, Insurance, Leave_Deductions, Net_Salary,
                Allowances, Payment_Date
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                Overtime_Hours = VALUES(Overtime_Hours),
                Leave_Deductions = VALUES(Leave_Deductions),
                Net_Salary = VALUES(Net_Salary)`,
              [
                employeeId, basicSalary, overtimeHours, bonus,
                tax, insurance, leaveDeductions, netSalary,
                allowances, new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0]
              ]
            );
          } catch (dbError) {
            console.error('Error saving payslip to database:', dbError);
            // Continue without saving to database
          }
        }

        return res.json(calculatedPayslip);
      }

      // For past months, return the stored payslip
      res.json(payslip);
    } catch (error) {
      console.error('Error in getOwnPayslip:', error);
      res.status(500).json({ message: 'Failed to fetch payslip', error: error.message });
    }
  },

  // Get employee's own salary details
  getOwnSalaryDetails: async (req, res) => {
    try {
      const employeeId = req.user.id;

      const [[employee]] = await pool.query(
        `SELECT e.*, e.Basic_Salary 
         FROM Employee e
         WHERE e.Employee_ID = ?`,
        [employeeId]
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({
        basicSalary: employee.Basic_Salary,
        employeeId: employee.Employee_ID,
        firstName: employee.First_Name,
        lastName: employee.Last_Name,
        departmentId: employee.Department_ID
      });
    } catch (error) {
      console.error('Error in getOwnSalaryDetails:', error);
      res.status(500).json({ message: 'Failed to fetch salary details' });
    }
  },

  // Get employee's own overtime details
  getOwnOvertimeDetails: async (req, res) => {
    try {
      const employeeId = req.user.id;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [overtimeResult] = await pool.query(
        `SELECT SUM(GREATEST(Hours_Worked - 8, 0)) as total_overtime
         FROM Attendance 
         WHERE Employee_ID = ? 
         AND MONTH(Date) = ? 
         AND YEAR(Date) = ?`,
        [employeeId, currentMonth, currentYear]
      );

      res.json({ overtimeHours: overtimeResult[0].total_overtime || 0 });
    } catch (error) {
      console.error('Error in getOwnOvertimeDetails:', error);
      res.status(500).json({ message: 'Failed to fetch overtime details' });
    }
  },

  // Get employee's own leave deductions
  getOwnLeaveDeductions: async (req, res) => {
    try {
      const employeeId = req.user.id;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [leaveResult] = await pool.query(
        `SELECT COUNT(*) as approved_leaves
         FROM \`Leave\`
         WHERE Employee_ID = ? 
         AND Status = 'Approved'
         AND MONTH(Start_Date) = ?
         AND YEAR(Start_Date) = ?`,
        [employeeId, currentMonth, currentYear]
      );

      const deductions = (leaveResult[0].approved_leaves || 0) * 1000;
      res.json({ deductions, approvedLeaves: leaveResult[0].approved_leaves || 0 });
    } catch (error) {
      console.error('Error in getOwnLeaveDeductions:', error);
      res.status(500).json({ message: 'Failed to fetch leave deductions' });
    }
  }
};

module.exports = employeePayrollController; 
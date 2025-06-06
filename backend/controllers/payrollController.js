const pool = require('../config/database');

const payrollController = {
  // Get all payrolls (admin only)
  getAllPayrolls: async (req, res) => {
    try {
      const [payrolls] = await pool.query(
        `SELECT p.*, e.First_Name, e.Last_Name 
         FROM Payroll p
         JOIN Employee e ON p.Employee_ID = e.Employee_ID
         ORDER BY p.Payment_Date DESC`
      );
      res.json(payrolls);
    } catch (error) {
      console.error('Error in getAllPayrolls:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get payroll details for an employee
  getPayrollDetails: async (req, res) => {
    try {
      const { employeeId } = req.params;
      console.log('\n=== Payroll Controller Debug ===');
      console.log('Employee ID:', employeeId);
      console.log('Request params:', req.params);
      console.log('Request query:', req.query);
      console.log('===================\n');

      const [payroll] = await pool.query(
        `SELECT p.*, e.First_Name, e.Last_Name, e.Department_ID 
         FROM Payroll p 
         JOIN Employee e ON p.Employee_ID = e.Employee_ID 
         WHERE p.Employee_ID = ?
         ORDER BY p.Payment_Date DESC
         LIMIT 1`,
        [employeeId]
      );

      console.log('Query result:', payroll);

      if (!payroll.length) {
        console.log('No payroll record found');
        return res.status(404).json({ message: 'No payroll record found for this employee' });
      }

      res.json(payroll[0]);
    } catch (error) {
      console.error('Error in getPayrollDetails:', error);
      res.status(500).json({ message: 'Failed to fetch payroll details' });
    }
  },

  // Calculate salary for an employee
  calculateSalary: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.body;

      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }

      // Get basic salary and employee details
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
        [employeeId, month, year]
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
      
      // Calculate insurance: 1000*(1 + dependents + 100*(hours - 8))
      const insurance = 1000 * (1 + dependentCount);
      const overtimeHours = 100 * (overtime);
      

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

      // Log salary components for debugging
      console.log('Salary Components:', {
        basicSalary,
        tax,
        allowances,
        insurance,
        overtimeHours,
        leaveDeductions,
        bonus,
        netSalary
      });

      // Return the calculated salary details
      return res.json({
        employeeId,
        basicSalary,
        overtimeHours,
        totalHours,
        approvedLeaves,
        dependentCount,
        tax,
        allowances,
        bonus,
        leaveDeductions,
        insurance,
        netSalary,
        month,
        year
      });
    } catch (error) {
      console.error('Error in calculateSalary:', error);
      return res.status(500).json({ message: 'Failed to calculate salary' });
    }
  },

  // Update or create payroll record
  updatePayroll: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const {
        Basic_Salary,
        Overtime_Hours,
        Bonus,
        Net_Salary,
        Taxable_Income,
        Payment_Date,
        insurance  // Accept lowercase 'insurance' from frontend
      } = req.body;

      // Use the insurance from request body if available, otherwise calculate it
      let insuranceValue = insurance;
      
      // If insurance not provided in request, calculate based on dependents
      if (insuranceValue === undefined || insuranceValue === null) {
        // Get number of dependents for insurance calculation
        const [dependentResult] = await pool.query(
          `SELECT COUNT(*) as dependent_count
           FROM Dependent
           WHERE Employee_ID = ?`,
          [employeeId]
        );

        const dependentCount = dependentResult[0].dependent_count || 0;
        insuranceValue = 1000 * (1 + dependentCount); // Base insurance + 1000 per dependent
      }

      console.log('Creating/updating payroll record:', {
        employeeId,
        Basic_Salary,
        Overtime_Hours,
        Bonus,
        insurance: insuranceValue,
        Net_Salary,
        Taxable_Income,
        Payment_Date
      });

      // Check if payroll record exists
      const [existingPayroll] = await pool.query(
        'SELECT * FROM Payroll WHERE Employee_ID = ?',
        [employeeId]
      );

      if (existingPayroll.length > 0) {
        // Update existing record with lowercase 'insurance' field
        await pool.query(
          `UPDATE Payroll 
           SET Basic_Salary = ?,
               Overtime_Hours = ?,
               Bonus = ?,
               insurance = ?,
               Net_Salary = ?,
               Taxable_Income = ?,
               Payment_Date = ?
           WHERE Employee_ID = ?`,
          [Basic_Salary, Overtime_Hours, Bonus, insuranceValue, Net_Salary, Taxable_Income, Payment_Date, employeeId]
        );
      } else {
        // Create new record with lowercase 'insurance' field
        await pool.query(
          `INSERT INTO Payroll (
            Employee_ID, Basic_Salary, Overtime_Hours, Bonus, 
            insurance, Net_Salary, Taxable_Income, Payment_Date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [employeeId, Basic_Salary, Overtime_Hours, Bonus, insuranceValue, Net_Salary, Taxable_Income, Payment_Date]
        );
      }

      res.json({ message: 'Payroll updated successfully' });
    } catch (error) {
      console.error('Error in updatePayroll:', error);
      res.status(500).json({ message: 'Failed to update payroll', error: error.message });
    }
  },

  // Get payslip for a specific month
  getPayslip: async (req, res) => {
    try {
      const { employeeId, month, year } = req.params;

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
        [employeeId, month, year]
      );

      if (payslip) {
        return res.json(payslip);
      }

      // If no payslip exists, calculate salary for the requested month
      // Get basic salary and employee details
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
        [employeeId, month, year]
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
      const tax = basicSalary * 0.1;
      const allowances = basicSalary * 0.05; // 5% of basic salary
      const bonus = basicSalary * 0.1; // 10% of basic salary
      const leaveDeductions = approvedLeaves * 1000; // 1000 per leave
      
      // Calculate insurance: 1000*(1 + dependents + 100*(hours - 8))
      const insurance = 1000 * (1 + dependentCount);
      const overtimeHours = 100 * (overtime);

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

      // Create a payslip object with calculated values
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
        Payment_Date: new Date(year, month - 1, 1).toISOString().split('T')[0]
      };

      res.json(calculatedPayslip);
    } catch (error) {
      console.error('Error in getPayslip:', error);
      res.status(500).json({ message: 'Failed to fetch payslip' });
    }
  },

  // Get overtime details
  getOvertimeDetails: async (req, res) => {
    try {
      const { employeeId } = req.params;
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
      console.error('Error in getOvertimeDetails:', error);
      res.status(500).json({ message: 'Failed to fetch overtime details' });
    }
  },

  // Get leave deductions
  getLeaveDeductions: async (req, res) => {
    try {
      const { employeeId } = req.params;
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
      console.error('Error in getLeaveDeductions:', error);
      res.status(500).json({ message: 'Failed to fetch leave deductions' });
    }
  }
};

module.exports = payrollController;
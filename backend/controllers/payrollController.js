const db = require('../models/db');

const payrollController = {
  // Calculate salary for an employee
  calculateSalary: async (req, res) => {
    try {
      const { employeeId, month, year } = req.body;

      // Get employee's basic salary and attendance
      const [[employee]] = await db.promise().query(
        `SELECT p.Basic_Salary, p.Overtime_Hours, p.Bonus,
                e.First_Name, e.Last_Name, e.Job_Title
         FROM Payroll p
         JOIN Employee e ON e.Employee_ID = p.Employee_ID
         WHERE p.Employee_ID = ?`,
        [employeeId]
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee payroll not found' });
      }

      // Get attendance for the month
      const [attendance] = await db.promise().query(
        `SELECT COUNT(*) as present_days, SUM(Hours_Worked) as total_hours
         FROM Attendance
         WHERE Employee_ID = ? AND MONTH(Date) = ? AND YEAR(Date) = ? AND Status = 'Present'`,
        [employeeId, month, year]
      );

      // Get deductions
      const [[deductions]] = await db.promise().query(
        `SELECT Tax, Provident_Fund, Loan_Repayments, Insurance, Other_Deductions
         FROM Deductions
         WHERE Employee_ID = ?`,
        [employeeId]
      );

      // Calculate overtime pay (1.5x hourly rate for hours > 8)
      const overtimePay = employee.Overtime_Hours * (employee.Basic_Salary / 176) * 1.5; // 176 = 22 working days * 8 hours

      // Calculate gross salary
      const grossSalary = employee.Basic_Salary + overtimePay + (employee.Bonus || 0);

      // Calculate total deductions
      const totalDeductions = deductions ? 
        (deductions.Tax + deductions.Provident_Fund + deductions.Loan_Repayments + 
         deductions.Insurance + deductions.Other_Deductions) : 0;

      // Calculate net salary
      const netSalary = grossSalary - totalDeductions;

      // Update payroll record
      await db.promise().query(
        `UPDATE Payroll SET
         Net_Salary = ?,
         Taxable_Income = ?,
         Payment_Date = CURDATE()
         WHERE Employee_ID = ?`,
        [netSalary, grossSalary, employeeId]
      );

      res.json({
        employeeId,
        employeeName: `${employee.First_Name} ${employee.Last_Name}`,
        jobTitle: employee.Job_Title,
        month,
        year,
        basicSalary: employee.Basic_Salary,
        overtimePay,
        bonus: employee.Bonus,
        grossSalary,
        deductions: {
          tax: deductions?.Tax || 0,
          providentFund: deductions?.Provident_Fund || 0,
          loanRepayments: deductions?.Loan_Repayments || 0,
          insurance: deductions?.Insurance || 0,
          otherDeductions: deductions?.Other_Deductions || 0,
          total: totalDeductions
        },
        netSalary,
        attendance: {
          presentDays: attendance[0].present_days,
          totalHours: attendance[0].total_hours
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get payslip for an employee
  getPayslip: async (req, res) => {
    try {
      const { id, month, year } = req.params;

      // Check permissions
      if (!req.user.isAdmin && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const [[payslip]] = await db.promise().query(
        `SELECT p.*, e.First_Name, e.Last_Name, e.Job_Title, e.Bank_Account_Number,
                d.Tax, d.Provident_Fund, d.Loan_Repayments, d.Insurance, d.Other_Deductions
         FROM Payroll p
         JOIN Employee e ON e.Employee_ID = p.Employee_ID
         LEFT JOIN Deductions d ON d.Employee_ID = p.Employee_ID
         WHERE p.Employee_ID = ? AND MONTH(p.Payment_Date) = ? AND YEAR(p.Payment_Date) = ?`,
        [id, month, year]
      );

      if (!payslip) {
        return res.status(404).json({ message: 'Payslip not found' });
      }

      res.json(payslip);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update basic salary and bonus
  updateSalaryDetails: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { basicSalary, bonus } = req.body;

      // Only admin can update salary details
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await db.promise().query(
        `UPDATE Payroll SET
         Basic_Salary = ?,
         Bonus = ?
         WHERE Employee_ID = ?`,
        [basicSalary, bonus, employeeId]
      );

      res.json({ message: 'Salary details updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all payroll records (admin only)
  getAllPayrolls: async (req, res) => {
    try {
      const [payrolls] = await db.promise().query(
        `SELECT p.*, e.First_Name, e.Last_Name
         FROM Payroll p
         JOIN Employee e ON e.Employee_ID = p.Employee_ID`
      );

      res.json(payrolls);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = payrollController; 
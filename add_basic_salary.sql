-- Add Basic_Salary column to Employee table
ALTER TABLE Employee
ADD COLUMN Basic_Salary DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Update any existing employees with Basic_Salary from Payroll table if available
UPDATE Employee e
LEFT JOIN Payroll p ON e.Employee_ID = p.Employee_ID
SET e.Basic_Salary = COALESCE(p.Basic_Salary, 0.00); 
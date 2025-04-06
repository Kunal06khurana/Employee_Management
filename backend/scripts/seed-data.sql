-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Delete existing data
DELETE FROM Deductions;
DELETE FROM Payroll;
DELETE FROM Attendance;
DELETE FROM `Leave`;
DELETE FROM Employee;
DELETE FROM Department;

-- Insert Departments first without Manager_ID
INSERT INTO Department (Department_ID, Department_Name, Location) VALUES
(1, 'Engineering', 'Floor 3'),
(2, 'Marketing', 'Floor 2'),
(3, 'Human Resources', 'Floor 1'),
(4, 'Finance', 'Floor 2'),
(5, 'Operations', 'Floor 1');

-- Insert Employees
INSERT INTO Employee (First_Name, Last_Name, DOB, Address, Contact, Email, Job_Title, Department_ID, Date_Joined, Performance_Rating, Bank_Account_Number, IFSC_Code, Password) VALUES
('John', 'Doe', '1990-05-15', '123 Main St', '1234567890', 'john@company.com', 'Senior Engineer', 1, '2022-01-15', 4.5, 'ACCT001', 'IFSC001', '$2a$10$your_hashed_password'),
('Jane', 'Smith', '1992-08-20', '456 Oak Ave', '2345678901', 'jane@company.com', 'Marketing Manager', 2, '2022-02-01', 4.2, 'ACCT002', 'IFSC002', '$2a$10$your_hashed_password'),
('Mike', 'Johnson', '1988-03-10', '789 Pine Rd', '3456789012', 'mike@company.com', 'HR Manager', 3, '2022-03-15', 4.0, 'ACCT003', 'IFSC003', '$2a$10$your_hashed_password'),
('Sarah', 'Williams', '1991-12-05', '321 Elm St', '4567890123', 'sarah@company.com', 'Financial Analyst', 4, '2022-04-01', 4.3, 'ACCT004', 'IFSC004', '$2a$10$your_hashed_password'),
('David', 'Brown', '1993-07-25', '654 Maple Dr', '5678901234', 'david@company.com', 'Operations Lead', 5, '2022-05-15', 4.1, 'ACCT005', 'IFSC005', '$2a$10$your_hashed_password');

-- Update Department Managers
UPDATE Department d
JOIN Employee e ON d.Department_ID = e.Department_ID
SET d.Manager_ID = e.Employee_ID
WHERE e.Job_Title LIKE '%Manager%' OR e.Job_Title LIKE '%Lead%';

-- Insert Leave Requests
INSERT INTO `Leave` (Employee_ID, Leave_Type, Start_Date, End_Date, Status, Leave_Balance) VALUES
(1, 'Vacation', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pending', 10),
(2, 'Sick', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Pending', 8),
(3, 'Personal', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Pending', 12);

-- Insert Attendance Records
INSERT INTO Attendance (Employee_ID, Date, Hours_Worked, Status, Shift_Details) VALUES
(1, CURDATE(), 8, 'Present', 'Day Shift'),
(2, CURDATE(), 8, 'Present', 'Day Shift'),
(3, CURDATE(), 0, 'Absent', 'Day Shift'),
(4, CURDATE(), 4, 'Half-Day', 'Morning Shift'),
(5, CURDATE(), 8, 'Present', 'Day Shift');

-- Insert Payroll Records
INSERT INTO Payroll (Employee_ID, Basic_Salary, Overtime_Hours, Bonus, Net_Salary, Taxable_Income, Payment_Date) VALUES
(1, 75000, 10, 5000, 80000, 75000, CURDATE()),
(2, 65000, 5, 3000, 68000, 65000, CURDATE()),
(3, 55000, 0, 2000, 57000, 55000, CURDATE()),
(4, 45000, 8, 2500, 47500, 45000, CURDATE()),
(5, 35000, 12, 1500, 36500, 35000, CURDATE());

-- Insert Deductions
INSERT INTO Deductions (Employee_ID, Tax, Provident_Fund, Loan_Repayments, Other_Deductions, Insurance) VALUES
(1, 7500, 3750, 0, 500, 1000),
(2, 6500, 3250, 1000, 300, 1000),
(3, 5500, 2750, 0, 200, 1000),
(4, 4500, 2250, 500, 150, 1000),
(5, 3500, 1750, 0, 100, 1000);

-- Re-enable foreign key checks after all data is inserted
SET FOREIGN_KEY_CHECKS = 1; 
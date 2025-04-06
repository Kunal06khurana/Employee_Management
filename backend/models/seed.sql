-- Insert initial admin
INSERT INTO Admin (Username, Password, Email) VALUES
('admin', '$2a$10$your_hashed_password', 'admin@company.com');

-- Insert departments
INSERT INTO Department (Department_Name, Location) VALUES
('Engineering', 'Building A'),
('Human Resources', 'Building B'),
('Marketing', 'Building A'),
('Finance', 'Building B'),
('Product', 'Building A');

-- Insert employees (with hashed passwords)
INSERT INTO Employee (
    First_Name, Last_Name, Email, Password, Job_Title,
    Department_ID, Date_Joined, Contact, Address,
    Bank_Account_Number, IFSC_Code, DOB
) VALUES
('John', 'Doe', 'john@example.com', '$2a$10$your_hashed_password', 'Software Engineer',
 1, '2022-01-15', '+1 (555) 123-4567', '123 Main St, Anytown, CA 12345',
 '****4567', 'IFSC001', '1990-01-01'),
 
('Jane', 'Smith', 'jane@example.com', '$2a$10$your_hashed_password', 'HR Manager',
 2, '2021-05-20', '+1 (555) 234-5678', '456 Oak St, Somewhere, NY 54321',
 '****7890', 'IFSC002', '1988-05-15'),
 
('Michael', 'Brown', 'michael@example.com', '$2a$10$your_hashed_password', 'Marketing Specialist',
 3, '2022-03-10', '+1 (555) 345-6789', '789 Pine St, Nowhere, TX 67890',
 '****2345', 'IFSC003', '1992-08-20'),
 
('Sarah', 'Johnson', 'sarah@example.com', '$2a$10$your_hashed_password', 'Financial Analyst',
 4, '2021-11-05', '+1 (555) 456-7890', '321 Elm St, Everywhere, FL 13579',
 '****3456', 'IFSC004', '1991-03-25'),
 
('Robert', 'Wilson', 'robert@example.com', '$2a$10$your_hashed_password', 'Product Manager',
 5, '2022-02-28', '+1 (555) 567-8901', '654 Maple St, Someplace, WA 24680',
 '****4567', 'IFSC005', '1987-11-10');

-- Update department managers
UPDATE Department SET Manager_ID = 2 WHERE Department_ID = 2; -- Jane is HR Manager
UPDATE Department SET Manager_ID = 5 WHERE Department_ID = 5; -- Robert is Product Manager

-- Insert payroll records
INSERT INTO Payroll (Employee_ID, Basic_Salary, Overtime_Hours, Bonus, Net_Salary, Payment_Date) VALUES
(1, 85000, 0, 5000, 90000, CURDATE()),
(2, 75000, 0, 4000, 79000, CURDATE()),
(3, 65000, 0, 3000, 68000, CURDATE()),
(4, 70000, 0, 3500, 73500, CURDATE()),
(5, 90000, 0, 6000, 96000, CURDATE());

-- Insert deductions
INSERT INTO Deductions (Employee_ID, Tax, Provident_Fund, Insurance) VALUES
(1, 8500, 4250, 2000),
(2, 7500, 3750, 2000),
(3, 6500, 3250, 2000),
(4, 7000, 3500, 2000),
(5, 9000, 4500, 2000);

-- Insert some leave records
INSERT INTO `Leave` (Employee_ID, Leave_Type, Start_Date, End_Date, Status, Leave_Balance) VALUES
(1, 'Vacation', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Approved', 15),
(2, 'Sick', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Approved', 18),
(3, 'Personal', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Pending', 20),
(4, 'Vacation', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Pending', 20),
(5, 'Sick', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Approved', 17);

-- Insert attendance records for current month
INSERT INTO Attendance (Employee_ID, Date, Status, Hours_Worked) VALUES
(1, CURDATE(), 'Present', 8),
(2, CURDATE(), 'Present', 8),
(3, CURDATE(), 'Leave', 0),
(4, CURDATE(), 'Present', 8),
(5, CURDATE(), 'Present', 9); 
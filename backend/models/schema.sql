-- Drop database if exists and create new one
DROP DATABASE IF EXISTS EmployeeSalaryManagement;
CREATE DATABASE EmployeeSalaryManagement;
USE EmployeeSalaryManagement;

-- Create Department table with nullable Manager_ID
CREATE TABLE Department (
    Department_ID INT PRIMARY KEY AUTO_INCREMENT,
    Department_Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    Manager_ID INT NULL -- Making this nullable
);

-- Create Employee table
CREATE TABLE Employee (
    Employee_ID INT PRIMARY KEY AUTO_INCREMENT,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    DOB DATE NOT NULL,
    Address TEXT,
    Contact VARCHAR(20),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Job_Title VARCHAR(100) NOT NULL,
    Department_ID INT NOT NULL,
    Date_Joined DATE NOT NULL,
    Performance_Rating DECIMAL(3,2),
    Bank_Account_Number VARCHAR(50),
    IFSC_Code VARCHAR(20),
    Password VARCHAR(255) NOT NULL,
    Leave_Balance INT DEFAULT 20,
    FOREIGN KEY (Department_ID) REFERENCES Department(Department_ID),
    CONSTRAINT valid_rating CHECK (Performance_Rating BETWEEN 0 AND 5)
);

-- Add foreign key to Department for Manager_ID after Employee table exists
ALTER TABLE Department
ADD CONSTRAINT fk_manager
FOREIGN KEY (Manager_ID) REFERENCES Employee(Employee_ID)
ON DELETE SET NULL;

-- Create Leave table
CREATE TABLE `Leave` (
    Leave_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT,
    Leave_Type ENUM('Sick', 'Vacation', 'Personal', 'Other') NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    Leave_Balance INT,
    Remarks TEXT,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE,
    CONSTRAINT valid_dates CHECK (End_Date >= Start_Date)
);

-- Create Attendance table
CREATE TABLE Attendance (
    Attendance_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT,
    Date DATE NOT NULL,
    Hours_Worked DECIMAL(4,2),
    Status ENUM('Present', 'Absent', 'Half-Day', 'Leave') NOT NULL,
    Shift_Details VARCHAR(50),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE,
    CONSTRAINT valid_hours CHECK (Hours_Worked BETWEEN 0 AND 24)
);

-- Create Payroll table
CREATE TABLE Payroll (
    Payroll_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT UNIQUE,
    Basic_Salary DECIMAL(10,2) NOT NULL,
    Overtime_Hours DECIMAL(5,2) DEFAULT 0,
    Bonus DECIMAL(10,2) DEFAULT 0,
    Net_Salary DECIMAL(10,2),
    Taxable_Income DECIMAL(10,2),
    Payment_Date DATE,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE
);

-- Create Deductions table
CREATE TABLE Deductions (
    Deduction_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT UNIQUE,
    Tax DECIMAL(10,2) DEFAULT 0,
    Provident_Fund DECIMAL(10,2) DEFAULT 0,
    Loan_Repayments DECIMAL(10,2) DEFAULT 0,
    Other_Deductions DECIMAL(10,2) DEFAULT 0,
    Insurance DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE
);

-- Create Admin table
CREATE TABLE Admin (
    Admin_ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Last_Login DATETIME,
    Security_Question TEXT
);

-- Dependent Table
CREATE TABLE Dependent (
    Dependent_ID INT PRIMARY KEY AUTO_INCREMENT,
    Employee_ID INT,
    Name VARCHAR(100) NOT NULL,
    Relationship VARCHAR(50) NOT NULL,
    DOB DATE,
    Gender ENUM('M', 'F', 'Other'),
    Contact VARCHAR(20),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE
); 
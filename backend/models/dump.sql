-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: EmployeeSalaryManagement
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `Admin_ID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Last_Login` datetime DEFAULT NULL,
  `Security_Question` text,
  PRIMARY KEY (`Admin_ID`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin','$2a$10$zOqVAQD3LlZEYlIQYrEGl.4OvRF2M8a4r670IDgKWQ21hrAzoz3tC','admin@company.com','2025-04-29 01:04:33',NULL);
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `Attendance_ID` int NOT NULL AUTO_INCREMENT,
  `Employee_ID` int DEFAULT NULL,
  `Date` date NOT NULL,
  `Hours_Worked` decimal(4,2) DEFAULT NULL,
  `Status` enum('Present','Absent','Half-Day','Leave') NOT NULL,
  `Shift_Details` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Attendance_ID`),
  KEY `Employee_ID` (`Employee_ID`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`) ON DELETE CASCADE,
  CONSTRAINT `valid_hours` CHECK ((`Hours_Worked` between 0 and 24))
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (292,18,'2025-04-01',8.50,'Present','Morning'),(293,18,'2025-04-02',NULL,'Absent',NULL),(294,18,'2025-04-03',3.00,'Half-Day','Evening'),(295,18,'2025-04-04',7.50,'Present','Night'),(296,18,'2025-04-05',NULL,'Leave',NULL),(297,18,'2025-04-06',9.50,'Present','Morning'),(298,18,'2025-04-07',2.00,'Half-Day','Evening'),(299,18,'2025-04-08',6.50,'Present','Morning'),(300,18,'2025-04-09',NULL,'Absent',NULL),(301,18,'2025-04-10',10.00,'Present','Night'),(302,18,'2025-04-11',NULL,'Leave',NULL),(303,18,'2025-04-12',3.50,'Half-Day','Morning'),(304,18,'2025-04-13',7.00,'Present','Evening'),(305,18,'2025-04-14',NULL,'Absent',NULL),(306,18,'2025-04-15',8.00,'Present','Morning'),(307,18,'2025-04-16',2.50,'Half-Day','Night'),(308,18,'2025-04-17',9.00,'Present','Evening'),(309,18,'2025-04-18',NULL,'Leave',NULL),(310,18,'2025-04-19',6.00,'Present','Morning'),(311,18,'2025-04-20',2.00,'Half-Day','Evening'),(312,18,'2025-04-21',9.50,'Present','Morning'),(313,18,'2025-04-22',NULL,'Absent',NULL),(314,18,'2025-04-23',7.50,'Present','Night'),(315,18,'2025-04-24',3.00,'Half-Day','Morning'),(316,18,'2025-04-25',8.50,'Present','Evening'),(317,18,'2025-04-26',NULL,'Leave',NULL),(318,18,'2025-04-27',9.00,'Present','Morning'),(319,18,'2025-04-28',NULL,'Absent',NULL),(320,18,'2025-04-29',7.00,'Present','Night'),(321,19,'2025-04-01',9.00,'Present','Morning'),(322,19,'2025-04-02',NULL,'Absent',NULL),(323,19,'2025-04-03',2.50,'Half-Day','Evening'),(324,19,'2025-04-04',7.00,'Present','Night'),(325,19,'2025-04-05',NULL,'Leave',NULL),(326,19,'2025-04-06',8.00,'Present','Morning'),(327,19,'2025-04-07',3.00,'Half-Day','Evening'),(328,19,'2025-04-08',6.50,'Present','Night'),(329,19,'2025-04-09',NULL,'Absent',NULL),(330,19,'2025-04-10',9.50,'Present','Morning'),(331,19,'2025-04-11',NULL,'Leave',NULL),(332,19,'2025-04-12',2.00,'Half-Day','Evening'),(333,19,'2025-04-13',7.50,'Present','Night'),(334,19,'2025-04-14',NULL,'Absent',NULL),(335,19,'2025-04-15',8.00,'Present','Morning'),(336,19,'2025-04-16',2.50,'Half-Day','Night'),(337,19,'2025-04-17',9.00,'Present','Evening'),(338,19,'2025-04-18',NULL,'Leave',NULL),(339,19,'2025-04-19',7.00,'Present','Morning'),(340,19,'2025-04-20',3.50,'Half-Day','Evening'),(341,19,'2025-04-21',8.50,'Present','Night'),(342,19,'2025-04-22',NULL,'Absent',NULL),(343,19,'2025-04-23',6.50,'Present','Morning'),(344,19,'2025-04-24',2.50,'Half-Day','Evening'),(345,19,'2025-04-25',8.00,'Present','Night'),(346,19,'2025-04-26',NULL,'Leave',NULL),(347,19,'2025-04-27',9.00,'Present','Morning'),(348,19,'2025-04-28',NULL,'Absent',NULL),(349,19,'2025-04-29',7.00,'Present','Evening'),(350,20,'2025-04-01',8.00,'Present','Morning'),(351,20,'2025-04-02',NULL,'Absent',NULL),(352,20,'2025-04-03',3.00,'Half-Day','Evening'),(353,20,'2025-04-04',7.50,'Present','Night'),(354,20,'2025-04-05',NULL,'Leave',NULL),(355,20,'2025-04-06',8.50,'Present','Morning'),(356,20,'2025-04-07',2.50,'Half-Day','Evening'),(357,20,'2025-04-08',6.00,'Present','Night'),(358,20,'2025-04-09',NULL,'Absent',NULL),(359,20,'2025-04-10',9.00,'Present','Morning'),(360,20,'2025-04-11',NULL,'Leave',NULL),(361,20,'2025-04-12',2.00,'Half-Day','Evening'),(362,20,'2025-04-13',7.50,'Present','Night'),(363,20,'2025-04-14',NULL,'Absent',NULL),(364,20,'2025-04-15',8.00,'Present','Morning'),(365,20,'2025-04-16',3.00,'Half-Day','Night'),(366,20,'2025-04-17',8.50,'Present','Evening'),(367,20,'2025-04-18',NULL,'Leave',NULL),(368,20,'2025-04-19',7.00,'Present','Morning'),(369,20,'2025-04-20',2.50,'Half-Day','Evening'),(370,20,'2025-04-21',9.00,'Present','Night'),(371,20,'2025-04-22',NULL,'Absent',NULL),(372,20,'2025-04-23',7.00,'Present','Morning'),(373,20,'2025-04-24',2.00,'Half-Day','Evening'),(374,20,'2025-04-25',8.50,'Present','Night'),(375,20,'2025-04-26',NULL,'Leave',NULL),(376,20,'2025-04-27',9.00,'Present','Morning'),(377,20,'2025-04-28',NULL,'Absent',NULL),(378,20,'2025-04-29',7.00,'Present','Evening'),(379,21,'2025-04-01',8.00,'Present','Morning'),(380,21,'2025-04-02',NULL,'Absent',NULL),(381,21,'2025-04-03',3.00,'Half-Day','Evening'),(382,21,'2025-04-04',7.00,'Present','Night'),(383,21,'2025-04-05',NULL,'Leave',NULL),(384,21,'2025-04-06',8.50,'Present','Morning'),(385,21,'2025-04-07',2.50,'Half-Day','Evening'),(386,21,'2025-04-08',6.00,'Present','Night'),(387,21,'2025-04-09',NULL,'Absent',NULL),(388,21,'2025-04-10',9.00,'Present','Morning'),(389,21,'2025-04-11',NULL,'Leave',NULL),(390,21,'2025-04-12',2.50,'Half-Day','Evening'),(391,21,'2025-04-13',7.50,'Present','Night'),(392,21,'2025-04-14',NULL,'Absent',NULL),(393,21,'2025-04-15',8.00,'Present','Morning'),(394,21,'2025-04-16',3.00,'Half-Day','Night'),(395,21,'2025-04-17',8.50,'Present','Evening'),(396,21,'2025-04-18',NULL,'Leave',NULL),(397,21,'2025-04-19',7.00,'Present','Morning'),(398,21,'2025-04-20',2.50,'Half-Day','Evening'),(399,21,'2025-04-21',9.00,'Present','Night'),(400,21,'2025-04-22',NULL,'Absent',NULL),(401,21,'2025-04-23',7.50,'Present','Morning'),(402,21,'2025-04-24',2.50,'Half-Day','Evening'),(403,21,'2025-04-25',8.00,'Present','Night'),(404,21,'2025-04-26',NULL,'Leave',NULL),(405,21,'2025-04-27',9.00,'Present','Morning'),(406,21,'2025-04-28',NULL,'Absent',NULL),(407,21,'2025-04-29',7.00,'Present','Evening');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `Department_ID` int NOT NULL AUTO_INCREMENT,
  `Department_Name` varchar(100) NOT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `Manager_ID` int DEFAULT NULL,
  PRIMARY KEY (`Department_ID`),
  KEY `fk_manager` (`Manager_ID`),
  CONSTRAINT `fk_manager` FOREIGN KEY (`Manager_ID`) REFERENCES `employee` (`Employee_ID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Engineering','Floor 3',NULL),(2,'Marketing','Floor 2',19),(3,'Human Resources','Floor 1',18),(4,'Finance','Floor 2',21),(5,'Operations','Floor 1',20);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dependent`
--

DROP TABLE IF EXISTS `dependent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dependent` (
  `Dependent_ID` int NOT NULL AUTO_INCREMENT,
  `Employee_ID` int DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Relationship` varchar(50) NOT NULL,
  `DOB` date DEFAULT NULL,
  `Gender` enum('M','F','Other') DEFAULT NULL,
  `Contact` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`Dependent_ID`),
  KEY `Employee_ID` (`Employee_ID`),
  CONSTRAINT `dependent_ibfk_1` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dependent`
--

LOCK TABLES `dependent` WRITE;
/*!40000 ALTER TABLE `dependent` DISABLE KEYS */;
INSERT INTO `dependent` VALUES (13,18,'Rajesh','Parent','1973-07-29','M','7876567654'),(14,19,'Pawan Kumar','Parent','1975-09-27','M','9255255360'),(15,19,'Rama Rani','Parent','1976-09-29','F','567656767'),(16,20,'Navneet','Parent','1978-02-28','M','56787654567'),(17,21,'Raveena','Spouse','2000-06-29','F','6765456765');
/*!40000 ALTER TABLE `dependent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `Employee_ID` int NOT NULL AUTO_INCREMENT,
  `First_Name` varchar(50) NOT NULL,
  `Last_Name` varchar(50) NOT NULL,
  `DOB` date NOT NULL,
  `Address` text,
  `Contact` varchar(20) DEFAULT NULL,
  `Email` varchar(100) NOT NULL,
  `Job_Title` varchar(100) NOT NULL,
  `Department_ID` int NOT NULL,
  `Date_Joined` date NOT NULL,
  `Performance_Rating` decimal(3,2) DEFAULT NULL,
  `Bank_Account_Number` varchar(50) DEFAULT NULL,
  `IFSC_Code` varchar(20) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Leave_Balance` int DEFAULT '20',
  `Basic_Salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`Employee_ID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `Department_ID` (`Department_ID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`),
  CONSTRAINT `valid_rating` CHECK ((`Performance_Rating` between 0 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (18,'Siddhartha','Srivastva','2003-03-31','Mirzapur,Uttar Pradesh','6752341874','siddharthasrivastva234@gmail.com','HR',3,'2025-04-01',2.00,'677876567876765','4vt45','$2a$10$8smcjiRRiu0HNK4Xg3bfC./r68k0RhNphBLkGxOW6Lx7ROtG95gIa',20,80000.00),(19,'Kunal','Khurana','2004-01-06','Kaithal,Haryana','6787654676','kunalkhurana250@gmail.com','Finance Manager',2,'2025-04-01',3.00,'56787654345678765','xyz123','$2a$10$oQcBPxgsTI/paTZ0hoTVbO5LxXNqx72i0Wmmi38LMRIqZcmlWm6O2',20,89999.99),(20,'Sankalp','Brahm.','2005-09-06','Perbani,Maharashtra','56765456899','sankalpbrah34@gmail.com','Others',5,'2025-04-01',1.00,'54567876543234567','xtv5153','$2a$10$TYexXvz6MMaZQe.7UaQOjerrljcIi3FPww0/4kDNDRAXoB5Axf3gu',20,3000.00),(21,'Rohit','Sharma','1998-06-29','Pune,Maharashtra','7859082321','rohitsharma12@gmail.com','Finance Manager',4,'2025-04-01',0.98,'567654567654567','xxhygf161','$2a$10$WXPCY0y3me3y.HYo5HNJv.VDNlDWscd7Z1hVthKA5CJ1os4tbV6VO',18,10000.00);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave`
--

DROP TABLE IF EXISTS `leave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave` (
  `Leave_ID` int NOT NULL AUTO_INCREMENT,
  `Employee_ID` int DEFAULT NULL,
  `Leave_Type` enum('Sick','Vacation','Personal','Other') NOT NULL,
  `Start_Date` date NOT NULL,
  `End_Date` date NOT NULL,
  `Status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `Leave_Balance` int DEFAULT NULL,
  `Remarks` text,
  `Updated_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Leave_ID`),
  KEY `Employee_ID` (`Employee_ID`),
  CONSTRAINT `leave_ibfk_1` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`) ON DELETE CASCADE,
  CONSTRAINT `valid_dates` CHECK ((`End_Date` >= `Start_Date`))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave`
--

LOCK TABLES `leave` WRITE;
/*!40000 ALTER TABLE `leave` DISABLE KEYS */;
INSERT INTO `leave` VALUES (15,21,'Sick','2025-04-29','2025-04-30','Approved',20,'because of vomiting.','2025-04-28 19:32:50'),(17,19,'Vacation','2025-05-08','2025-05-16','Rejected',20,'family vacation.','2025-04-28 19:35:26');
/*!40000 ALTER TABLE `leave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `Payroll_ID` int NOT NULL AUTO_INCREMENT,
  `Employee_ID` int DEFAULT NULL,
  `Basic_Salary` decimal(10,2) NOT NULL,
  `Overtime_Hours` decimal(5,2) DEFAULT '0.00',
  `Bonus` decimal(10,2) DEFAULT '0.00',
  `Net_Salary` decimal(10,2) DEFAULT NULL,
  `Taxable_Income` decimal(10,2) DEFAULT NULL,
  `Payment_Date` date DEFAULT NULL,
  `insurance` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`Payroll_ID`),
  UNIQUE KEY `Employee_ID` (`Employee_ID`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (14,18,80000.00,800.00,8000.00,82800.00,88000.00,'2025-04-28',2000.00),(15,19,89999.99,500.00,9000.00,91999.99,98999.99,'2025-04-28',3000.00),(16,20,3000.00,450.00,300.00,1600.00,3300.00,'2025-04-28',2000.00),(17,21,10000.00,400.00,1000.00,7900.00,11000.00,'2025-04-28',2000.00);
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-29  1:47:48

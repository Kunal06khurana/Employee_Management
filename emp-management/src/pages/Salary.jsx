"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { DollarSign, Calculator, FileText, ArrowRight, Search, Users, RefreshCw, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import logoImage from "../assets/images/logo.png" // Import the IIITA logo

const Salary = () => {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [salaryDetails, setSalaryDetails] = useState({
    basicSalary: 0,
    overtimeHours: 0,
    overtimeRate: 200, // Rate per hour for overtime
    bonus: 0,
    tax: 0,
    dependents: 0,
    insurance: 0,
    leaveDeductions: 0,
    netSalary: 0,
    allowances: 0,
  })
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setEmployees(response.data)
    } catch (err) {
      setError("Failed to fetch employees")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSelect = async (employeeId) => {
    setLoading(true)
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // Calculate salary using the backend endpoint
      const salaryResponse = await axios.post(
        `http://localhost:5000/api/employees/${employeeId}/payroll/calculate`,
        {
          month: currentMonth,
          year: currentYear,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )

      const selectedEmp = employees.find((emp) => emp.Employee_ID === employeeId)
      setSelectedEmployee(selectedEmp)

      // Update salary details with calculated values from backend
      setSalaryDetails({
        basicSalary: salaryResponse.data.basicSalary || 0,
        overtimeHours: salaryResponse.data.overtimeHours || 0,
        overtimeRate: 200,
        bonus: salaryResponse.data.bonus || 0,
        tax: salaryResponse.data.tax || 0,
        dependents: salaryResponse.data.dependentCount || 0,
        insurance: salaryResponse.data.insurance || 0,
        leaveDeductions: salaryResponse.data.leaveDeductions || 0,
        netSalary: salaryResponse.data.netSalary || 0,
        allowances: salaryResponse.data.allowances || 0,
      })
    } catch (err) {
      setError("Failed to fetch employee details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateSalary = async () => {
    setCalculating(true)
    try {
      const { basicSalary, overtimeHours, bonus, tax, insurance, leaveDeductions, allowances } = salaryDetails

      // Calculate net salary using the same formula as backend
      const netSalary = basicSalary - tax + allowances - insurance + overtimeHours - leaveDeductions + bonus

      setSalaryDetails((prev) => ({
        ...prev,
        netSalary,
      }))

      // Create a payroll data object to update the database
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split("T")[0]

      // Ensure values are valid numbers before calculations
      const basicSalaryNum = Number(basicSalary) || 0
      const bonusNum = Number(bonus) || 0
      const overtimeHoursNum = Number(overtimeHours) || 0
      const netSalaryNum = netSalary || 0
      const insuranceNum = Number(insurance) || 0

      // Calculate taxable income (basic salary + bonus)
      const taxableIncome = basicSalaryNum + bonusNum

      // Format numbers to 2 decimal places to avoid floating point precision issues
      const payrollData = {
        Basic_Salary: basicSalaryNum.toFixed(2),
        Overtime_Hours: overtimeHoursNum.toFixed(2),
        Bonus: bonusNum.toFixed(2),
        Net_Salary: netSalaryNum.toFixed(2),
        Taxable_Income: taxableIncome.toFixed(2),
        Payment_Date: formattedDate,
        insurance: insuranceNum.toFixed(2),
      }

      // Update the payroll in the database
      await axios.post(`http://localhost:5000/api/employees/${selectedEmployee.Employee_ID}/payroll`, payrollData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

    } catch (err) {
      setError("Failed to update payroll information")
      console.error(err)
    } finally {
      setTimeout(() => {
        setCalculating(false)
      }, 800)
    }
  }

  const generatePayslip = async () => {
    try {
      setGenerating(true)
      // Save payroll data to database first
      const currentDate = new Date()

      // Format date as YYYY-MM-DD for MySQL
      const formattedDate = currentDate.toISOString().split("T")[0]

      // Ensure values are valid numbers before calculations
      const basicSalary = Number(salaryDetails.basicSalary) || 0
      const bonus = Number(salaryDetails.bonus) || 0
      const overtimeHours = Number(salaryDetails.overtimeHours) || 0
      const netSalary = Number(salaryDetails.netSalary) || 0
      const insurance = Number(salaryDetails.insurance) || 0

      // Calculate taxable income (basic salary + bonus)
      const taxableIncome = basicSalary + bonus

      // Format numbers to 2 decimal places to avoid floating point precision issues
      const payrollData = {
        Basic_Salary: basicSalary.toFixed(2),
        Overtime_Hours: overtimeHours.toFixed(2),
        Bonus: bonus.toFixed(2),
        Net_Salary: netSalary.toFixed(2),
        Taxable_Income: taxableIncome.toFixed(2),
        Payment_Date: formattedDate,
        insurance: insurance.toFixed(2),
      }

      await axios.post(`http://localhost:5000/api/employees/${selectedEmployee.Employee_ID}/payroll`, payrollData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      // Create new jsPDF instance
      const doc = new jsPDF()
      doc.autoTable = autoTable

      const {
        basicSalary: pdfBasic = 0,
        overtimeHours: pdfOvertime = 0,
        overtimeRate = 200,
        bonus: pdfBonus = 0,
        tax = 0,
        insurance: pdfInsurance = 0,
        leaveDeductions = 0,
        allowances = 0,
        netSalary: pdfNet = 0,
      } = salaryDetails

      // Convert all values to numbers and ensure they're not null/undefined
      const basicSalaryNum = Number(pdfBasic) || 0
      const overtimeHoursNum = Number(pdfOvertime) || 0
      const overtimeRateNum = Number(overtimeRate) || 200
      const bonusNum = Number(pdfBonus) || 0
      const taxNum = Number(tax) || 0
      const insuranceNum = Number(pdfInsurance) || 0
      const leaveDeductionsNum = Number(leaveDeductions) || 0
      const allowancesNum = Number(allowances) || 0
      const netSalaryNum = Number(pdfNet) || 0

      // Add IIITA logo
      try {
        // Use the imported logoImage directly
        const img = new Image()
        img.src = logoImage
        doc.addImage(img, 'PNG', 85, 10, 40, 20) // Logo centered at top
      } catch (error) {
        console.error("Error adding logo:", error)
        doc.setFontSize(12)
        doc.text("[IIITA Logo Here]", 105, 15, { align: "center" })
      }

      // Add report header with better spacing
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text("IIITA Employee Salary Report", 105, 40, { align: "center" })
      
      // Add report type
      doc.setFontSize(14)
      doc.text("Employee Payslip", 105, 50, { align: "center" })

      // Add payslip period
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ]
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 60, { align: "center" })
      doc.text(`Period: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`, 105, 70, { align: "center" })

      // Add employee details section with better formatting
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text("Employee Details", 20, 90)
      doc.setFont(undefined, 'normal')
      doc.setDrawColor(0, 32, 96) // IIITA blue color
      doc.setLineWidth(0.5)
      doc.line(20, 95, 190, 95)

      // Employee information with cleaner layout
      doc.text(`Name: ${selectedEmployee?.First_Name || ""} ${selectedEmployee?.Last_Name || ""}`, 20, 105)
      doc.text(`Employee ID: ${selectedEmployee?.Employee_ID || ""}`, 20, 115)
      doc.text(`Department: ${selectedEmployee?.Department_ID || ""}`, 20, 125)
      doc.text(`Bank Account: ${selectedEmployee?.Bank_Account_Number || "N/A"}`, 120, 105)
      doc.text(`IFSC Code: ${selectedEmployee?.IFSC_Code || "N/A"}`, 120, 115)
      doc.text(`Pay Date: ${new Date().toLocaleDateString()}`, 120, 125)

      // Calculate totals
      const overtimePay = overtimeHoursNum * overtimeRateNum
      const totalEarnings = basicSalaryNum + overtimePay + allowancesNum + bonusNum
      const totalDeductions = taxNum + insuranceNum + leaveDeductionsNum

      // Add earnings table with improved formatting
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text("Earnings", 20, 145)
      doc.setFont(undefined, 'normal')
      doc.line(20, 150, 190, 150)

      // Earnings table with better formatting
      autoTable(doc, {
        startY: 155,
        head: [["Component", "Amount"]],
        body: [
          ["Basic Salary", `$${basicSalaryNum.toFixed(2)}`],
          ["Overtime Pay", `$${overtimePay.toFixed(2)}`],
          ["Allowances", `$${allowancesNum.toFixed(2)}`],
          ["Bonus", `$${bonusNum.toFixed(2)}`],
          ["Total Earnings", `$${totalEarnings.toFixed(2)}`],
        ],
        theme: "grid",
        headStyles: { 
          fillColor: [0, 32, 96], // IIITA blue color
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: "center",
          fontStyle: "bold",
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: "left" },
          1: { halign: "right" }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        tableWidth: 85,
        margin: { left: 20, right: 105 },
      })

      // Add deductions table with improved formatting
      const earningsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 155
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text("Deductions", 20, earningsY)
      doc.setFont(undefined, 'normal')
      doc.line(20, earningsY + 5, 190, earningsY + 5)

      // Deductions table with better formatting
      autoTable(doc, {
        startY: earningsY + 10,
        head: [["Component", "Amount"]],
        body: [
          ["Tax", `$${taxNum.toFixed(2)}`],
          ["Insurance", `$${insuranceNum.toFixed(2)}`],
          ["Leave Deductions", `$${leaveDeductionsNum.toFixed(2)}`],
          ["Total Deductions", `$${totalDeductions.toFixed(2)}`],
        ],
        theme: "grid",
        headStyles: { 
          fillColor: [0, 32, 96], // IIITA blue color
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: "center",
          fontStyle: "bold",
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: "left" },
          1: { halign: "right" }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        tableWidth: 85,
        margin: { left: 20, right: 105 },
      })

      // Add net salary summary with improved formatting
      const deductionsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : earningsY + 10
      
      // Add summary table for net salary
      autoTable(doc, {
        startY: deductionsY,
        head: [["Summary", "Amount"]],
        body: [
          ["Total Earnings", `$${totalEarnings.toFixed(2)}`],
          ["Total Deductions", `$${totalDeductions.toFixed(2)}`],
          ["Net Salary", `$${netSalaryNum.toFixed(2)}`],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [0, 32, 96], // IIITA blue color
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: "center",
          fontStyle: "bold",
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: "left" },
          1: { halign: "right" }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        tableWidth: 85,
        margin: { left: 105, right: 20 },
      })

      // Add Notes section with cleaner formatting
      const summaryFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : deductionsY + 15
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold');
      doc.text("Notes:", 20, summaryFinalY)
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9)
      doc.text("1. Basic Salary: The fixed amount paid to employee excluding allowances and bonuses.", 20, summaryFinalY + 8)
      doc.text("2. Overtime Pay: Additional compensation for hours worked beyond regular schedule.", 20, summaryFinalY + 15)
      doc.text("3. Allowances: Additional amounts for housing, transportation, etc.", 20, summaryFinalY + 22)
      doc.text("4. Tax: Statutory deductions as per prevailing tax rates.", 20, summaryFinalY + 29)
      doc.text("5. All salary figures are in USD.", 20, summaryFinalY + 36)

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text("Generated automatically by IIITA Employee Management System.", 105, doc.internal.pageSize.height - 10, { align: "center" })
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
      }

      // Save PDF with IIITA branding in filename
      doc.save(`IIITA_payslip_${selectedEmployee?.Employee_ID || "unknown"}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.pdf`);

      setTimeout(() => {
        setGenerating(false)
      }, 1000)
    } catch (err) {
      setError("Failed to generate payslip")
      console.error(err)
      setGenerating(false)
    }
  }

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.First_Name} ${employee.Last_Name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) || employee.Email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-6"
      >
        <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Salary Management</h1>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6"
        >
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Select Employee
          </motion.h2>

          <motion.div variants={item} className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>

          <motion.div variants={item} className="overflow-y-auto max-h-96 pr-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <motion.li
                    key={employee.Employee_ID}
                    className="py-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <button
                      onClick={() => handleEmployeeSelect(employee.Employee_ID)}
                      className={`w-full text-left px-4 py-3 rounded-lg ${
                        selectedEmployee?.Employee_ID === employee.Employee_ID
                          ? "bg-purple-50 border border-purple-200"
                          : "hover:bg-gray-50"
                      } transition-colors duration-200`}
                    >
                      <div className="font-medium text-gray-900">
                        {employee.First_Name} {employee.Last_Name}
                      </div>
                      <div className="text-sm text-gray-500">{employee.Department_ID}</div>
                    </button>
                  </motion.li>
                ))}
                {filteredEmployees.length === 0 && (
                  <li className="py-8 text-center text-gray-500">No employees found</li>
                )}
              </ul>
            )}
          </motion.div>
        </motion.div>

        {/* Salary Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-purple-600" />
            Salary Calculator
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : selectedEmployee ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg mb-6 border border-purple-200 shadow-sm"
              >
                <h3 className="font-medium text-purple-800">
                  {selectedEmployee.First_Name} {selectedEmployee.Last_Name} - {selectedEmployee.Department_ID}
                </h3>
                <p className="text-sm text-purple-600">
                  Annual Salary: ${(salaryDetails.basicSalary || 0).toLocaleString()}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Earnings
                  </h4>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-purple-50 p-4 rounded-lg border border-green-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="basicSalary"
                          value={salaryDetails.basicSalary}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-purple-50 p-4 rounded-lg border border-blue-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Allowances</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="allowances"
                          value={salaryDetails.allowances}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-purple-50 p-4 rounded-lg border border-purple-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Overtime Hours</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="overtimeHours"
                          value={salaryDetails.overtimeHours}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-purple-50 p-4 rounded-lg border border-purple-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Bonus</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="bonus"
                          value={salaryDetails.bonus}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-red-600 transform rotate-180" />
                    Deductions
                  </h4>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-purple-50 p-4 rounded-lg border border-red-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Tax</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="tax"
                          value={salaryDetails.tax}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-purple-50 p-4 rounded-lg border border-orange-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Insurance</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="insurance"
                          value={salaryDetails.insurance}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-purple-50 p-4 rounded-lg border border-amber-100 transition-all duration-200 hover:shadow-md"
                    >
                      <label className="block text-sm font-medium text-gray-700">Leave Deductions</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="leaveDeductions"
                          value={salaryDetails.leaveDeductions}
                          readOnly
                          className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 rounded-xl shadow-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-700">Net Salary</h4>
                    <p className="text-sm text-gray-500">Total after deductions</p>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">${(Number(salaryDetails.netSalary) || 0).toFixed(2)}</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex justify-end space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 flex items-center"
                  onClick={calculateSalary}
                  disabled={calculating}
                >
                  {calculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      <span>Calculate Salary</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 flex items-center"
                  onClick={generatePayslip}
                  disabled={!salaryDetails.netSalary || generating}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Generate Payslip</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <DollarSign className="w-16 h-16 text-purple-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Selected</h3>
              <p className="text-gray-500 max-w-sm">
                Please select an employee from the list to calculate and manage their salary.
              </p>
              <div className="mt-4 flex items-center text-purple-600 text-sm">
                <ArrowRight className="w-4 h-4 mr-1" />
                Select from the list on the left
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Salary

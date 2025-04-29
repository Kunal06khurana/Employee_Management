"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { DollarSign, Calendar, Download, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import EmployeeSidebar from "../components/EmployeeSidebar"
import EmployeeNavbar from "../components/EmployeeNavbar"
import logoImage from "../assets/images/logo.png" // Import the IIITA logo

// Replace the entire component with this enhanced version
const EmployeePayslip = () => {
  const [salaryDetails, setSalaryDetails] = useState({
    basicSalary: 0,
    overtimeHours: 0,
    overtimeRate: 200,
    bonus: 0,
    tax: 0,
    insurance: 0,
    leaveDeductions: 0,
    netSalary: 0,
    allowances: 0,
  })
  
  const [employeeDetails, setEmployeeDetails] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    departmentId: "",
    departmentName: "",
    position: "Employee"
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchPayslipDetails()
  }, [selectedMonth, selectedYear])

  const fetchPayslipDetails = async () => {
    try {
      const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "{}")
      const employeeId = employeeUser.id
      const employeeToken = localStorage.getItem("employeeToken")

      if (!employeeId || !employeeToken) {
        setError("Employee ID not found. Please log in again.")
        setLoading(false)
        return
      }

      // First, get employee details from the employee profile API
      try {
        const profileResponse = await axios.get(
          `http://localhost:5000/api/employee/profile`,
          {
            headers: { Authorization: `Bearer ${employeeToken}` },
          }
        )
        
        const profileData = profileResponse.data
        
        setEmployeeDetails({
          firstName: profileData.First_Name || "",
          lastName: profileData.Last_Name || "",
          employeeId: profileData.Employee_ID || employeeId,
          departmentId: profileData.Department_ID || "",
          departmentName: profileData.Department_Name || profileData.Department_ID || "",
          position: profileData.Position || "Employee"
        })
      } catch (profileErr) {
        console.error("Error fetching profile data:", profileErr)
        // If profile fetch fails, use data from localStorage as fallback
        setEmployeeDetails({
          firstName: employeeUser.First_Name || "",
          lastName: employeeUser.Last_Name || "",
          employeeId: employeeUser.id || "",
          departmentId: employeeUser.Department_ID || "",
          departmentName: employeeUser.Department_Name || employeeUser.Department_ID || "",
          position: employeeUser.Position || "Employee"
        })
      }

      // Get payslip data
      const response = await axios.get(
        `http://localhost:5000/api/employee/payroll/payslip/${selectedMonth}/${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${employeeToken}` },
        }
      )

      const payslipData = response.data
      
      // Store employee details from payslip if available
      if (payslipData.First_Name && payslipData.Last_Name) {
        setEmployeeDetails(prev => ({
          ...prev,
          firstName: payslipData.First_Name,
          lastName: payslipData.Last_Name,
          employeeId: payslipData.Employee_ID || prev.employeeId,
          departmentId: payslipData.Department_ID || prev.departmentId,
          departmentName: payslipData.Department_Name || payslipData.Department_ID || prev.departmentName
        }))
      }
      
      setSalaryDetails({
        basicSalary: Number(payslipData.Basic_Salary) || 0,
        overtimeHours: Number(payslipData.Overtime_Hours) || 0,
        overtimeRate: 1,
        bonus: Number(payslipData.Bonus) || 0,
        tax: Number(payslipData.Tax) || 0,
        insurance: Number(payslipData.Insurance) || 0,
        leaveDeductions: Number(payslipData.Leave_Deductions) || 0,
        netSalary: Number(payslipData.Net_Salary) || 0,
        allowances: Number(payslipData.Allowances) || 0,
      })

      setLoading(false)
    } catch (err) {
      setError("Failed to fetch payslip details")
      console.error(err)
      setLoading(false)
    }
  }

  const generatePayslip = () => {
    try {
      setIsGenerating(true)
      const doc = new jsPDF()
      doc.autoTable = autoTable
      
      // Add IIITA logo
      try {
        doc.addImage(logoImage, 'PNG', 85, 10, 40, 20) // Logo centered at top
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
      doc.text(`Period: ${monthNames[selectedMonth - 1]} ${selectedYear}`, 105, 70, { align: "center" })

      // Add employee details section with better formatting
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text("Employee Details", 20, 90)
      doc.setFont(undefined, 'normal')
      doc.setDrawColor(0, 32, 96) // IIITA blue color
      doc.setLineWidth(0.5)
      doc.line(20, 95, 190, 95)

      // Employee information with cleaner layout - using updated employeeDetails state
      doc.text(`Name: ${employeeDetails.firstName} ${employeeDetails.lastName}`, 20, 105)
      doc.text(`Employee ID: ${employeeDetails.employeeId}`, 20, 115)
      doc.text(`Department: ${employeeDetails.departmentName}`, 20, 125)
      doc.text(`Position: ${employeeDetails.position}`, 120, 105)
      doc.text(`Pay Date: ${new Date().toLocaleDateString()}`, 120, 115)
      
      // Calculate totals
      const overtimePay = salaryDetails.overtimeHours * salaryDetails.overtimeRate
      const totalEarnings = salaryDetails.basicSalary + overtimePay + salaryDetails.allowances + salaryDetails.bonus
      const totalDeductions = salaryDetails.tax + salaryDetails.insurance + salaryDetails.leaveDeductions
      const netSalary = salaryDetails.netSalary

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
          ["Basic Salary", `$${salaryDetails.basicSalary.toFixed(2)}`],
          ["Overtime Pay", `$${overtimePay.toFixed(2)}`],
          ["Allowances", `$${salaryDetails.allowances.toFixed(2)}`],
          ["Bonus", `$${salaryDetails.bonus.toFixed(2)}`],
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
          ["Tax", `$${salaryDetails.tax.toFixed(2)}`],
          ["Insurance", `$${salaryDetails.insurance.toFixed(2)}`],
          ["Leave Deductions", `$${salaryDetails.leaveDeductions.toFixed(2)}`],
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
          ["Net Salary", `$${netSalary.toFixed(2)}`],
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

      // Save PDF
      doc.save(`IIITA_payslip_${employeeDetails.employeeId}_${selectedYear}_${selectedMonth}.pdf`)
      setTimeout(() => setIsGenerating(false), 1000)
    } catch (err) {
      setError("Failed to generate payslip")
      console.error(err)
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 shadow-sm"
            >
              {error}
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <EmployeeSidebar />
      <div className="flex-1 ml-64">
        <EmployeeNavbar />
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">My Payslip</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-purple-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generatePayslip}
                disabled={isGenerating}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2 shadow-md transition-all duration-300 disabled:bg-purple-400"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  Earnings
                </h3>
                <div className="space-y-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.basicSalary}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Pay</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={(salaryDetails.overtimeHours * salaryDetails.overtimeRate).toFixed(2)}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.allowances}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.bonus}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Deductions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-red-500 mr-2 transform rotate-180" />
                  Deductions
                </h3>
                <div className="space-y-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.tax}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.insurance}
                        readOnly
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white bg-opacity-50"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Deductions</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 p-6 bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 rounded-xl shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-700">Net Salary</h4>
                  <p className="text-sm text-gray-500">Total after deductions</p>
                </div>
                <div className="text-3xl font-bold text-purple-600">${salaryDetails.netSalary.toFixed(2)}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EmployeePayslip

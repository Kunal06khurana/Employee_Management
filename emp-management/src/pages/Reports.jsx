"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Users, Building, DollarSign, Download, RefreshCw, AlertCircle } from "lucide-react"
import logoImage from "../assets/images/logo.png" // Import the logo image

const Reports = () => {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [payrollData, setPayrollData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedReport, setSelectedReport] = useState("employee")
  const [dataLoaded, setDataLoaded] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/employees", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/departments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ])

      // Get payroll data for each employee
      const payrollPromises = employeesRes.data.map(
        (emp) =>
          axios
            .get(`http://localhost:5000/api/employees/${emp.Employee_ID}/payroll`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .catch(() => ({ data: null })), // Handle case where employee has no payroll
      )

      const payrollResponses = await Promise.all(payrollPromises)
      const payrollData = payrollResponses.map((response) => response.data).filter((data) => data !== null)

      setEmployees(employeesRes.data)
      setDepartments(departmentsRes.data)
      setPayrollData(payrollData)
      setDataLoaded(true)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = () => {
    if (!dataLoaded) {
      alert("Data is still loading. Please wait...")
      return
    }

    setGenerating(true)

    switch (selectedReport) {
      case "employee":
        generateEmployeeReport()
        break
      case "department":
        generateDepartmentReport()
        break
      case "salary":
        generateSalaryReport()
        break
      default:
        break
    }

    setTimeout(() => {
      setGenerating(false)
    }, 1500)
  }

  const generateEmployeeReport = () => {
    const doc = new jsPDF()
    doc.autoTable = autoTable

    // Add IIITA logo
    try {
      doc.addImage(logoImage, 'PNG', 85, 10, 40, 20) // Adjust x, y, width, height as needed
    } catch (error) {
      console.error("Error adding logo:", error)
      doc.setFontSize(12)
      doc.text("[IIITA Logo Here]", 105, 15, { align: "center" })
    }

    // Add report header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text("IIITA Employee Salary Report", 105, 40, { align: "center" })
    
    // Add report type
    doc.setFontSize(14)
    doc.text("Employee Details Report", 105, 50, { align: "center" })

    // Add report date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 60, { align: "center" })

    // Prepare employee data with only the requested fields
    const employeeData = employees.map((emp) => [
      emp.Employee_ID,
      emp.First_Name,
      emp.Last_Name,
      emp.DOB ? new Date(emp.DOB).toLocaleDateString() : "N/A",
      emp.Email,
      emp.Department_ID,
      emp.Basic_Salary ? `$${Number(emp.Basic_Salary).toFixed(2)}` : "N/A",
    ])

    // Add employee table with proper column widths and formatting
    autoTable(doc, {
      startY: 70,
      head: [["Emp ID", "First Name", "Last Name", "Date of Birth", "Email", "Dept ID", "Basic Salary"]],
      body: employeeData,
      theme: "grid",
      headStyles: {
        fillColor: [0, 32, 96], // IIITA blue color
        textColor: [255, 255, 255],
        fontSize: 11,
        halign: "center",
        fontStyle: "bold",
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" }, // Emp ID
        1: { cellWidth: 25 }, // First Name
        2: { cellWidth: 25 }, // Last Name
        3: { cellWidth: 25, halign: "center" }, // DOB
        4: { cellWidth: 45 }, // Email
        5: { cellWidth: 20, halign: "center" }, // Dept ID
        6: { cellWidth: 25, halign: "right" }, // Basic Salary
      },
    })

    // Add summary table
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 60
    
    // Calculate summary data
    const totalSalary = employees.reduce((sum, emp) => sum + (Number(emp.Basic_Salary) || 0), 0)
    const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0
    const highestSalary = employees.length > 0 ? Math.max(...employees.map(emp => Number(emp.Basic_Salary) || 0)) : 0
    const lowestSalary = employees.length > 0 ? Math.min(...employees.filter(emp => Number(emp.Basic_Salary) > 0).map(emp => Number(emp.Basic_Salary))) : 0
    
    // Add summary table
    autoTable(doc, {
      startY: finalY,
      head: [["Summary"]],
      body: [
        ["Total Employees", employees.length],
        ["Total Basic Salary", `$${totalSalary.toFixed(2)}`],
        ["Average Salary", `$${avgSalary.toFixed(2)}`],
        ["Highest Salary", `$${highestSalary.toFixed(2)}`],
        ["Lowest Salary", `$${lowestSalary.toFixed(2)}`]
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 32, 96], // IIITA blue color
        textColor: [255, 255, 255],
        fontSize: 11,
        halign: "center",
        fontStyle: "bold"
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: 60, right: 60 },
    })

    // Add Notes section
    const summaryFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : finalY + 20
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold');
    doc.text("Notes:", 20, summaryFinalY)
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10)
    doc.text("1. Basic Salary: The fixed amount paid to employees excluding allowances and bonuses.", 20, summaryFinalY + 10)
    doc.text("2. Dept ID: Department identifier where the employee is currently assigned.", 20, summaryFinalY + 18)
    doc.text("3. All salary figures are in USD.", 20, summaryFinalY + 26)

    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Generated automatically by IIITA Employee Management System.", 105, doc.internal.pageSize.height - 10, { align: "center" })
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
    }

    // Save PDF
    doc.save(`IIITA_employee_report_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const generateDepartmentReport = () => {
    const doc = new jsPDF()
    doc.autoTable = autoTable

    // Add IIITA logo
    try {
      doc.addImage(logoImage, 'PNG', 85, 10, 40, 20) // Adjust x, y, width, height as needed
    } catch (error) {
      console.error("Error adding logo:", error)
      doc.setFontSize(12)
      doc.text("[IIITA Logo Here]", 105, 15, { align: "center" })
    }

    // Add report header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text("IIITA Employee Salary Report", 105, 40, { align: "center" })
    
    // Add report type
    doc.setFontSize(14)
    doc.text("Department Statistics Report", 105, 50, { align: "center" })

    // Add report date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 60, { align: "center" })

    // Prepare department data
    const departmentData = departments.map((dept) => {
      const deptEmployees = employees.filter((emp) => emp.Department_ID === dept.Department_ID)
      const deptPayrolls = payrollData.filter((payroll) =>
        deptEmployees.some((emp) => emp.Employee_ID === payroll.Employee_ID),
      )

      const totalSalary = deptPayrolls.reduce((sum, payroll) => {
        const salary = Number(payroll.Basic_Salary) || 0
        return sum + salary
      }, 0)

      const avgSalary = deptPayrolls.length > 0 ? totalSalary / deptPayrolls.length : 0

      return [dept.Department_ID, dept.Department_Name, dept.Location, deptEmployees.length, `$${avgSalary.toFixed(2)}`]
    })

    // Add department table
    autoTable(doc, {
      startY: 60,
      head: [["ID", "Department Name", "Location", "Employee Count", "Average Salary"]],
      body: departmentData,
      theme: "grid",
      headStyles: { 
        fillColor: [0, 32, 96], // IIITA blue color
        textColor: [255, 255, 255],
        fontSize: 11,
        halign: "center",
        fontStyle: "bold"
      },
      bodyStyles: {
        fontSize: 10,
      },
      margin: { left: 20, right: 20 },
    })

    // Add summary table
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 60
    
    // Calculate summary data
    const totalEmployees = departmentData.reduce((sum, dept) => sum + dept[3], 0)
    const deptsWithEmployees = departmentData.filter(dept => dept[3] > 0).length
    const highestAvgSalaryDept = departmentData.reduce((prev, curr) => 
      parseFloat(curr[4].replace('$', '')) > parseFloat(prev[4].replace('$', '')) ? curr : prev
    )
    
    // Add summary table
    autoTable(doc, {
      startY: finalY,
      head: [["Summary"]],
      body: [
        ["Total Departments", departments.length],
        ["Departments with Employees", deptsWithEmployees],
        ["Total Employees", totalEmployees],
        ["Department with Highest Avg. Salary", `${highestAvgSalaryDept[1]} (${highestAvgSalaryDept[4]})`],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 32, 96], // IIITA blue color
        textColor: [255, 255, 255],
        fontSize: 11,
        halign: "center",
        fontStyle: "bold"
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: 60, right: 60 },
    })

    // Add Notes section
    const summaryFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : finalY + 20
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold');
    doc.text("Notes:", 20, summaryFinalY)
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10)
    doc.text("1. Average Salary: Calculated based on all employees in the department.", 20, summaryFinalY + 10)
    doc.text("2. Location: Physical location of the department office.", 20, summaryFinalY + 18)
    doc.text("3. All salary figures are in USD.", 20, summaryFinalY + 26)

    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Generated automatically by IIITA Employee Management System.", 105, doc.internal.pageSize.height - 10, { align: "center" })
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
    }

    // Save PDF
    doc.save(`IIITA_department_report_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const generateSalaryReport = () => {
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
    doc.text("Detailed Salary Report", 105, 50, { align: "center" })

    // Add report date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 60, { align: "center" })

    // Prepare salary data with proper formatting
    const salaryData = payrollData.map((payroll) => {
      const employee = employees.find((emp) => emp.Employee_ID === payroll.Employee_ID)

      // Ensure all values are numbers and handle missing values
      const basicSalary = Number(payroll.Basic_Salary || 0);
      const bonus = Number(payroll.Bonus || 0);
      
      // Calculate allowances and tax based on basic salary
      const allowances = basicSalary * 0.05; // 5% of basic salary
      const tax = basicSalary * 0.1; // 10% of basic salary
      
      const insurance = Number(payroll.insurance || payroll.Insurance || 0);
      const netSalary = basicSalary + bonus + allowances - tax - insurance;

      return [
        payroll.Employee_ID,
        employee ? `${employee.First_Name} ${employee.Last_Name}` : "Unknown",
        employee ? employee.Department_ID : "N/A",
        `$${basicSalary.toFixed(2)}`,
        `$${bonus.toFixed(2)}`,
        `$${allowances.toFixed(2)}`,
        `$${tax.toFixed(2)}`,
        `$${insurance.toFixed(2)}`,
        `$${netSalary.toFixed(2)}`,
      ]
    })

    // Add salary table with clean, professional formatting
    autoTable(doc, {
      startY: 70,
      head: [["ID", "Name", "Dept", "Basic Salary", "Bonus", "Allowances", "Tax", "Insurance", "Net Salary"]],
      body: salaryData,
      theme: "grid",
      headStyles: { 
        fillColor: [0, 32, 96], // IIITA blue color
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
        fontStyle: "bold",
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 }, // ID
        1: { cellWidth: 30 }, // Name
        2: { halign: "center", cellWidth: 12 }, // Dept
        3: { halign: "right", cellWidth: 21 }, // Basic Salary
        4: { halign: "right", cellWidth: 18 }, // Bonus
        5: { halign: "right", cellWidth: 21 }, // Allowances
        6: { halign: "right", cellWidth: 18 }, // Tax
        7: { halign: "right", cellWidth: 18 }, // Insurance
        8: { halign: "right", cellWidth: 21 }, // Net Salary
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 },
    })

    // Calculate totals
    const totals = payrollData.reduce(
      (acc, curr) => {
        const basicSalary = Number(curr.Basic_Salary || 0);
        const bonus = Number(curr.Bonus || 0);
        // Calculate allowances and tax based on basic salary
        const allowances = basicSalary * 0.05; // 5% of basic salary
        const tax = basicSalary * 0.1; // 10% of basic salary
        const insurance = Number(curr.insurance || curr.Insurance || 0);
        const netSalary = basicSalary + bonus + allowances - tax - insurance;
        
        return {
          basicSalary: acc.basicSalary + basicSalary,
          bonus: acc.bonus + bonus,
          allowances: acc.allowances + allowances,
          tax: acc.tax + tax,
          insurance: acc.insurance + insurance,
          netSalary: acc.netSalary + netSalary,
        };
      },
      { basicSalary: 0, bonus: 0, allowances: 0, tax: 0, insurance: 0, netSalary: 0 }
    )

    // Add summary table with improved formatting
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 70
    
    // Add summary table - centered with clean layout
    autoTable(doc, {
      startY: finalY,
      head: [["Summary", "Amount"]],
      body: [
        ["Total Basic Salary", `$${totals.basicSalary.toFixed(2)}`],
        ["Total Bonus", `$${totals.bonus.toFixed(2)}`],
        ["Total Allowances", `$${totals.allowances.toFixed(2)}`],
        ["Total Tax", `$${totals.tax.toFixed(2)}`],
        ["Total Insurance", `$${totals.insurance.toFixed(2)}`],
        ["Total Net Salary", `$${totals.netSalary.toFixed(2)}`],
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
      tableWidth: 100,
      margin: { left: 55, right: 55 },
    })

    // Add Notes section with cleaner formatting
    const summaryFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : finalY + 15
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold');
    doc.text("Notes:", 20, summaryFinalY)
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9)
    doc.text("1. Basic Salary: The fixed amount paid to employees excluding allowances and bonuses.", 20, summaryFinalY + 8)
    doc.text("2. Allowances: Additional amounts for housing, transportation, etc. (5% of basic salary)", 20, summaryFinalY + 15)
    doc.text("3. Tax: Statutory deductions as per prevailing tax rates. (10% of basic salary)", 20, summaryFinalY + 22)
    doc.text("4. Net Salary: Total amount payable after all deductions.", 20, summaryFinalY + 29)
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
    doc.save(`IIITA_salary_report_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 relative">
        Reports
        <span className="absolute bottom-0 left-0 w-20 h-1 bg-purple-600 rounded-full"></span>
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl border-t-4 border-purple-600">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Report Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedReport("employee")}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedReport === "employee"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <Users
                className={`w-6 h-6 mr-2 ${selectedReport === "employee" ? "text-purple-600" : "text-gray-500"}`}
              />
              <span className={selectedReport === "employee" ? "font-medium text-purple-700" : "text-gray-700"}>
                Employee Report
              </span>
            </button>
            <button
              onClick={() => setSelectedReport("department")}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedReport === "department"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <Building
                className={`w-6 h-6 mr-2 ${selectedReport === "department" ? "text-purple-600" : "text-gray-500"}`}
              />
              <span className={selectedReport === "department" ? "font-medium text-purple-700" : "text-gray-700"}>
                Department Report
              </span>
            </button>
            <button
              onClick={() => setSelectedReport("salary")}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedReport === "salary"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <DollarSign
                className={`w-6 h-6 mr-2 ${selectedReport === "salary" ? "text-purple-600" : "text-gray-500"}`}
              />
              <span className={selectedReport === "salary" ? "font-medium text-purple-700" : "text-gray-700"}>
                Salary Report
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Report Preview</h3>
            <p className="text-purple-700">
              {selectedReport === "employee" &&
                "This report will include all employee details including personal information and salary data."}
              {selectedReport === "department" &&
                "This report will include department statistics, employee counts, and average salaries."}
              {selectedReport === "salary" &&
                "This report will include detailed salary information, bonuses, deductions, and net pay."}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              className={`bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center transition-all duration-300 transform hover:scale-105 ${
                loading || !dataLoaded ? "opacity-50 cursor-not-allowed" : ""
              } ${generating ? "animate-pulse" : ""}`}
              disabled={loading || !dataLoaded || generating}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Loading Data...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center animate-fadeIn">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!dataLoaded && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 flex items-center animate-fadeIn">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Data is not loaded. Please try again.</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Reports

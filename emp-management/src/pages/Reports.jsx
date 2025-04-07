import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Users, Building, DollarSign, Download } from 'lucide-react';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState('employee');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/departments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      // Get payroll data for each employee
      const payrollPromises = employeesRes.data.map(emp => 
        axios.get(`http://localhost:5000/api/employees/${emp.Employee_ID}/payroll`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: null })) // Handle case where employee has no payroll
      );

      const payrollResponses = await Promise.all(payrollPromises);
      const payrollData = payrollResponses
        .map(response => response.data)
        .filter(data => data !== null);
      
      // Debug: Log the raw response data
      console.log('Raw Employees Data:', employeesRes.data);
      console.log('Raw Departments Data:', departmentsRes.data);
      console.log('Raw Payroll Data:', payrollData);
      
      setEmployees(employeesRes.data);
      setDepartments(departmentsRes.data);
      setPayrollData(payrollData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!dataLoaded) {
      alert('Data is still loading. Please wait...');
      return;
    }

    console.log('Current state:', {
      employees,
      departments,
      payrollData,
      selectedReport
    });

    switch (selectedReport) {
      case 'employee':
        generateEmployeeReport();
        break;
      case 'department':
        generateDepartmentReport();
        break;
      case 'salary':
        generateSalaryReport();
        break;
      default:
        break;
    }
  };

  const generateEmployeeReport = () => {
    console.log('=== Generating Employee Report ===');
    console.log('Employees data:', employees);
    
    const doc = new jsPDF();
    doc.autoTable = autoTable;

    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('COMPANY NAME', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Employee Report', 105, 30, { align: 'center' });

    // Add report date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });

    // Prepare employee data with only the requested fields
    const employeeData = employees.map(emp => [
      emp.Employee_ID,
      emp.First_Name,
      emp.Last_Name,
      emp.DOB ? new Date(emp.DOB).toLocaleDateString() : 'N/A',
      emp.Email,
      emp.Department_ID,
      emp.Basic_Salary ? `$${Number(emp.Basic_Salary).toFixed(2)}` : 'N/A'
    ]);

    // Add employee table with proper column widths and formatting
    autoTable(doc, {
      startY: 50,
      head: [['Emp ID', 'First Name', 'Last Name', 'Date of Birth', 'Email', 'Dept ID', 'Basic Salary']],
      body: employeeData,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 66, 66],
        fontSize: 11,
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4
      },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },     // Emp ID
        1: { cellWidth: 25 },                       // First Name
        2: { cellWidth: 25 },                       // Last Name
        3: { cellWidth: 25, halign: 'center' },     // DOB
        4: { cellWidth: 45 },                       // Email
        5: { cellWidth: 20, halign: 'center' },     // Dept ID
        6: { cellWidth: 25, halign: 'right' }       // Basic Salary
      }
    });

    // Add summary
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
    doc.setFontSize(12);
    doc.text(`Total Employees: ${employees.length}`, 20, finalY + 20);

    // Save PDF
    doc.save(`employee_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateDepartmentReport = () => {
    console.log('=== Generating Department Report ===');
    console.log('Departments data:', departments);
    console.log('Employees data:', employees);
    console.log('Payroll data:', payrollData);
    
    const doc = new jsPDF();
    doc.autoTable = autoTable;

    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('COMPANY NAME', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Department Report', 105, 30, { align: 'center' });

    // Add report date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });

    // Prepare department data with average salary
    const departmentData = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.Department_ID === dept.Department_ID);
      console.log(`Department ${dept.Department_ID} employees:`, deptEmployees);
      
      // Get payroll data for department employees
      const deptPayrolls = payrollData.filter(payroll => 
        deptEmployees.some(emp => emp.Employee_ID === payroll.Employee_ID)
      );
      
      const totalSalary = deptPayrolls.reduce((sum, payroll) => {
        const salary = Number(payroll.Basic_Salary) || 0;
        console.log(`Employee ${payroll.Employee_ID} salary:`, salary);
        return sum + salary;
      }, 0);
      
      const avgSalary = deptPayrolls.length > 0 ? totalSalary / deptPayrolls.length : 0;
      console.log(`Department ${dept.Department_ID} total salary:`, totalSalary);
      console.log(`Department ${dept.Department_ID} average salary:`, avgSalary);

      return [
        dept.Department_ID,
        dept.Department_Name,
        dept.Location,
        deptEmployees.length,
        `$${avgSalary.toFixed(2)}`
      ];
    });

    console.log('Final department data for PDF:', departmentData);

    // Add department table
    autoTable(doc, {
      startY: 50,
      head: [['ID', 'Department Name', 'Location', 'Employee Count', 'Average Salary']],
      body: departmentData,
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 20 }
    });

    // Add summary
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
    doc.setFontSize(12);
    doc.text(`Total Departments: ${departments.length}`, 20, finalY + 20);

    // Save PDF
    doc.save(`department_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSalaryReport = () => {
    console.log('=== Generating Salary Report ===');
    console.log('Payroll data:', payrollData);
    
    const doc = new jsPDF();
    doc.autoTable = autoTable;

    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('COMPANY NAME', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Salary Report', 105, 30, { align: 'center' });

    // Add report date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });

    // Prepare salary data with proper formatting
    const salaryData = payrollData.map(payroll => {
      const employee = employees.find(emp => emp.Employee_ID === payroll.Employee_ID);
      
      return [
        payroll.Employee_ID,
        employee ? `${employee.First_Name} ${employee.Last_Name}` : 'Unknown',
        employee ? employee.Department_ID : 'N/A',
        `$${Number(payroll.Basic_Salary).toFixed(2)}`,
        `$${Number(payroll.Bonus).toFixed(2)}`,
        `$${Number(payroll.Allowances || 0).toFixed(2)}`,
        `$${Number(payroll.Tax || 0).toFixed(2)}`,
        `$${Number(payroll.Insurance).toFixed(2)}`,
        `$${Number(payroll.Net_Salary).toFixed(2)}`
      ];
    });

    // Add salary table
    autoTable(doc, {
      startY: 50,
      head: [['ID', 'Name', 'Department', 'Basic Salary', 'Bonus', 'Allowances', 'Tax', 'Insurance', 'Net Salary']],
      body: salaryData,
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 20 }
    });

    // Calculate totals
    const totals = payrollData.reduce((acc, curr) => ({
      basicSalary: acc.basicSalary + Number(curr.Basic_Salary || 0),
      bonus: acc.bonus + Number(curr.Bonus || 0),
      allowances: acc.allowances + Number(curr.Allowances || 0),
      tax: acc.tax + Number(curr.Tax || 0),
      insurance: acc.insurance + Number(curr.Insurance || 0),
      netSalary: acc.netSalary + Number(curr.Net_Salary || 0)
    }), {
      basicSalary: 0,
      bonus: 0,
      allowances: 0,
      tax: 0,
      insurance: 0,
      netSalary: 0
    });

    // Add summary
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
    doc.setFontSize(12);
    doc.text(`Total Basic Salary: $${totals.basicSalary.toFixed(2)}`, 20, finalY + 20);
    doc.text(`Total Bonus: $${totals.bonus.toFixed(2)}`, 20, finalY + 30);
    doc.text(`Total Allowances: $${totals.allowances.toFixed(2)}`, 20, finalY + 40);
    doc.text(`Total Tax: $${totals.tax.toFixed(2)}`, 20, finalY + 50);
    doc.text(`Total Insurance: $${totals.insurance.toFixed(2)}`, 20, finalY + 60);
    doc.text(`Total Net Salary: $${totals.netSalary.toFixed(2)}`, 20, finalY + 70);

    // Save PDF
    doc.save(`salary_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Report Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedReport('employee')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                selectedReport === 'employee'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <Users className="w-6 h-6 mr-2 text-indigo-600" />
              <span>Employee Report</span>
            </button>
            <button
              onClick={() => setSelectedReport('department')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                selectedReport === 'department'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <Building className="w-6 h-6 mr-2 text-indigo-600" />
              <span>Department Report</span>
            </button>
              <button
              onClick={() => setSelectedReport('salary')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                selectedReport === 'salary'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <DollarSign className="w-6 h-6 mr-2 text-indigo-600" />
              <span>Salary Report</span>
              </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
            disabled={loading || !dataLoaded}
          >
            <Download className="w-5 h-5 mr-2" />
            {loading ? 'Loading Data...' : 'Generate Report'}
                </button>
          </div>
          
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
                </div>
              )}
              
        {!dataLoaded && !loading && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
            Data is not loaded. Please try again.
            </div>
          )}
      </div>
    </div>
  );
};

export default Reports;

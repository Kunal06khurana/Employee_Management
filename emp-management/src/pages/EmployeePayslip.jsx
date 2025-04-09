import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DollarSign, FileText, Calendar } from 'lucide-react';
import EmployeeSidebar from '../components/EmployeeSidebar';
import EmployeeNavbar from '../components/EmployeeNavbar';

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
    allowances: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayslipDetails();
  }, [selectedMonth, selectedYear]);

  const fetchPayslipDetails = async () => {
    try {
      const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
      const employeeId = employeeUser.id;

      if (!employeeId) {
        setError('Employee ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/employee/payroll/payslip/${selectedMonth}/${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('employeeToken')}` }
        }
      );

      const payslipData = response.data;
      setSalaryDetails({
        basicSalary: Number(payslipData.Basic_Salary) || 0,
        overtimeHours: Number(payslipData.Overtime_Hours) || 0,
        overtimeRate: 1,
        bonus: Number(payslipData.Bonus) || 0,
        tax: Number(payslipData.Tax) || 0,
        insurance: Number(payslipData.Insurance) || 0,
        leaveDeductions: Number(payslipData.Leave_Deductions) || 0,
        netSalary: Number(payslipData.Net_Salary) || 0,
        allowances: Number(payslipData.Allowances) || 0
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch payslip details');
      console.error(err);
      setLoading(false);
    }
  };

  const generatePayslip = () => {
    try {
      const doc = new jsPDF();
      doc.autoTable = autoTable;

      const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
      const currentDate = new Date();

      // Add company header
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text('COMPANY NAME', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Employee Payslip', 105, 30, { align: 'center' });

      // Add payslip period
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      doc.setFontSize(12);
      doc.text(`Period: ${monthNames[selectedMonth - 1]} ${selectedYear}`, 105, 40, { align: 'center' });

      // Add employee details section
      doc.setFontSize(12);
      doc.text('Employee Details', 20, 60);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 65, 190, 65);

      // Employee information
      doc.text(`Employee Name: ${employeeUser.First_Name || ''} ${employeeUser.Last_Name || ''}`, 20, 75);
      doc.text(`Employee ID: ${employeeUser.id || ''}`, 20, 85);
      doc.text(`Department: ${employeeUser.Department_ID || ''}`, 20, 95);

      // Add salary breakdown section
      doc.text('Salary Breakdown', 20, 115);
      doc.line(20, 120, 190, 120);

      // Calculate totals
      const overtimePay = salaryDetails.overtimeHours * salaryDetails.overtimeRate;
      const totalEarnings = salaryDetails.basicSalary + overtimePay + salaryDetails.allowances + salaryDetails.bonus;
      const totalDeductions = salaryDetails.tax + salaryDetails.insurance + salaryDetails.leaveDeductions;

      // Earnings table data
      const earningsData = [
        ['Component', 'Amount'],
        ['Basic Salary', `$${salaryDetails.basicSalary.toFixed(2)}`],
        ['Overtime Pay', `$${overtimePay.toFixed(2)}`],
        ['Allowances', `$${salaryDetails.allowances.toFixed(2)}`],
        ['Bonus', `$${salaryDetails.bonus.toFixed(2)}`],
        ['Total Earnings', `$${totalEarnings.toFixed(2)}`]
      ];

      // Add earnings table
      autoTable(doc, {
        startY: 125,
        head: [earningsData[0]],
        body: earningsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: 20 }
      });

      // Deductions table data
      const deductionsData = [
        ['Component', 'Amount'],
        ['Tax', `$${salaryDetails.tax.toFixed(2)}`],
        ['Insurance', `$${salaryDetails.insurance.toFixed(2)}`],
        ['Leave Deductions', `$${salaryDetails.leaveDeductions.toFixed(2)}`],
        ['Total Deductions', `$${totalDeductions.toFixed(2)}`]
      ];

      // Add deductions table
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 125;
      autoTable(doc, {
        startY: finalY + 10,
        head: [deductionsData[0]],
        body: deductionsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: 20 }
      });

      // Net Salary section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const lastTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY : finalY;
      doc.text(`Net Salary: $${salaryDetails.netSalary.toFixed(2)}`, 20, lastTableY + 20);

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated document and does not require a signature.', 105, 280, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

      // Save PDF
      doc.save(`payslip_${employeeUser.id}_${selectedYear}_${selectedMonth}.pdf`);
    } catch (err) {
      setError('Failed to generate payslip');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar />
      <div className="flex-1 ml-64">
        <EmployeeNavbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Payslip</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border rounded-md px-2 py-1"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded-md px-2 py-1"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generatePayslip}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.basicSalary}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Overtime Pay</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={(salaryDetails.overtimeHours * salaryDetails.overtimeRate).toFixed(2)}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allowances</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.allowances}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bonus</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.bonus}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Deductions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.tax}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.insurance}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Leave Deductions</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={salaryDetails.leaveDeductions}
                        readOnly
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-700">Net Salary</h4>
                  <p className="text-sm text-gray-500">Total after deductions</p>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  ${salaryDetails.netSalary.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslip; 
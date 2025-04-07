import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DollarSign, Calculator, FileText, ArrowRight, Search, Users } from 'lucide-react';

const Salary = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    allowances: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    }
  };

  const handleEmployeeSelect = async (employeeId) => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Calculate salary using the backend endpoint
      const salaryResponse = await axios.post(
        `http://localhost:5000/api/employees/${employeeId}/payroll/calculate`,
        {
          month: currentMonth,
          year: currentYear
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      const selectedEmp = employees.find(emp => emp.Employee_ID === employeeId);
      setSelectedEmployee(selectedEmp);

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
        allowances: salaryResponse.data.allowances || 0
      });

    } catch (err) {
      setError('Failed to fetch employee details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSalary = () => {
    const {
      basicSalary,
      overtimeHours,
      bonus,
      tax,
      insurance,
      leaveDeductions,
      allowances
    } = salaryDetails;

    // Calculate net salary using the same formula as backend
    const netSalary = (
      basicSalary - 
      tax + 
      allowances - 
      insurance + 
      overtimeHours - 
      leaveDeductions + 
      bonus
    );

    setSalaryDetails(prev => ({
      ...prev,
      netSalary
    }));
  };

  const generatePayslip = () => {
    const doc = new jsPDF();
    const {
      basicSalary,
      overtimeHours,
      overtimeRate,
      bonus,
      tax,
      insurance,
      leaveDeductions,
      allowances,
      netSalary
    } = salaryDetails;

    // Add company header
    doc.setFontSize(20);
    doc.text('Employee Payslip', 80, 20);
    doc.setFontSize(12);

    // Add employee details
    doc.text(`Employee Name: ${selectedEmployee?.First_Name} ${selectedEmployee?.Last_Name}`, 20, 40);
    doc.text(`Employee ID: ${selectedEmployee?.Employee_ID}`, 20, 50);
    doc.text(`Department: ${selectedEmployee?.Department_ID}`, 20, 60);

    // Add salary breakdown
    const data = [
      ['Component', 'Amount'],
      ['Basic Salary', basicSalary.toFixed(2)],
      ['Overtime Pay', (overtimeHours * overtimeRate).toFixed(2)],
      ['Allowances', allowances.toFixed(2)],
      ['Bonus', bonus.toFixed(2)],
      ['Tax Deduction', (basicSalary * tax).toFixed(2)],
      ['Insurance', insurance.toFixed(2)],
      ['Leave Deductions', leaveDeductions.toFixed(2)],
      ['Net Salary', netSalary.toFixed(2)]
    ];

    doc.autoTable({
      startY: 70,
      head: [data[0]],
      body: data.slice(1),
      theme: 'grid'
    });

    // Save PDF
    doc.save(`payslip_${selectedEmployee?.Employee_ID}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Salary Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Select Employee
          </h2>

          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search employees"
              value={employees.map(emp => emp.First_Name).join(', ')}
              readOnly
            />
          </div>

          <div className="overflow-y-auto max-h-96">
            <ul className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <li key={employee.Employee_ID} className="py-3">
                  <button
                    onClick={() => handleEmployeeSelect(employee.Employee_ID)}
                    className={`w-full text-left px-3 py-2 rounded-md ${selectedEmployee?.Employee_ID === employee.Employee_ID ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className="font-medium text-gray-900">{employee.First_Name} {employee.Last_Name}</div>
                    <div className="text-sm text-gray-500">{employee.Department_ID}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Salary Calculator */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
            Salary Calculator
          </h2>

          {loading ? (
            <div>Loading...</div>
          ) : selectedEmployee ? (
            <div>
              <div className="bg-indigo-50 p-4 rounded-md mb-6">
                <h3 className="font-medium text-indigo-800">
                  {selectedEmployee.First_Name} {selectedEmployee.Last_Name} - {selectedEmployee.Department_ID}
                </h3>
                <p className="text-sm text-indigo-600">
                  Annual Salary: ${(salaryDetails.basicSalary || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Earnings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="basicSalary"
                          value={salaryDetails.basicSalary}
                          onChange={(e) => setSalaryDetails(prev => ({
                            ...prev,
                            basicSalary: Number(e.target.value)
                          }))}
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
                          name="allowances"
                          value={salaryDetails.allowances}
                          onChange={(e) => setSalaryDetails(prev => ({
                            ...prev,
                            allowances: Number(e.target.value)
                          }))}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Overtime Hours</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">Hours</span>
                        </div>
                        <input
                          type="number"
                          name="overtimeHours"
                          value={salaryDetails.overtimeHours}
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
                          name="bonus"
                          value={salaryDetails.bonus}
                          onChange={(e) => setSalaryDetails(prev => ({
                            ...prev,
                            bonus: Number(e.target.value)
                          }))}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Deductions</h4>
                  <div className="space-y-4">
                    <div>
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
                          name="insurance"
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
                          name="leaveDeductions"
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
                    ${(salaryDetails.netSalary || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  onClick={calculateSalary}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Salary
                </button>
                <button
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  onClick={generatePayslip}
                  disabled={!salaryDetails.netSalary}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Payslip
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="w-16 h-16 text-indigo-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Selected</h3>
              <p className="text-gray-500 max-w-sm">
                Please select an employee from the list to calculate and manage their salary.
              </p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm">
                <ArrowRight className="w-4 h-4 mr-1" />
                Select from the list on the left
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salary;

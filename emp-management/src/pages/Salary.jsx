import React, { useState } from 'react';
import { DollarSign, Calculator, FileText, ArrowRight, Search, Users } from 'lucide-react';

const Salary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState({
    basicSalary: 0,
    allowances: 0,
    overtime: 0,
    bonus: 0,
    tax: 0,
    insurance: 0,
    otherDeductions: 0
  });

  // Sample employee data
  const employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', position: 'Software Engineer', department: 'Engineering', salary: 85000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', position: 'HR Manager', department: 'Human Resources', salary: 75000 },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', position: 'Marketing Specialist', department: 'Marketing', salary: 65000 },
    { id: 4, name: 'Sarah Johnson', email: 'sarah@example.com', position: 'Financial Analyst', department: 'Finance', salary: 70000 },
    { id: 5, name: 'Robert Wilson', email: 'robert@example.com', position: 'Product Manager', department: 'Product', salary: 90000 },
  ];

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Initialize salary details based on employee's base salary
    const monthlySalary = employee.salary / 12;
    setSalaryDetails({
      basicSalary: monthlySalary.toFixed(2),
      allowances: (monthlySalary * 0.1).toFixed(2),
      overtime: 0,
      bonus: 0,
      tax: (monthlySalary * 0.2).toFixed(2),
      insurance: (monthlySalary * 0.05).toFixed(2),
      otherDeductions: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryDetails({
      ...salaryDetails,
      [name]: parseFloat(value) || 0
    });
  };

  const calculateNetSalary = () => {
    const { basicSalary, allowances, overtime, bonus, tax, insurance, otherDeductions } = salaryDetails;
    const totalEarnings = parseFloat(basicSalary) + parseFloat(allowances) + parseFloat(overtime) + parseFloat(bonus);
    const totalDeductions = parseFloat(tax) + parseFloat(insurance) + parseFloat(otherDeductions);
    return (totalEarnings - totalDeductions).toFixed(2);
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto max-h-96">
            <ul className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <li key={employee.id} className="py-3">
                  <button
                    onClick={() => handleEmployeeSelect(employee)}
                    className={`w-full text-left px-3 py-2 rounded-md ${selectedEmployee?.id === employee.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                    <div className="text-sm text-gray-500">{employee.department}</div>
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
          
          {selectedEmployee ? (
            <div>
              <div className="bg-indigo-50 p-4 rounded-md mb-6">
                <h3 className="font-medium text-indigo-800">
                  {selectedEmployee.name} - {selectedEmployee.position}
                </h3>
                <p className="text-sm text-indigo-600">
                  Annual Salary: ${selectedEmployee.salary.toLocaleString()}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Overtime</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="overtime"
                          value={salaryDetails.overtime}
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Other Deductions</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="otherDeductions"
                          value={salaryDetails.otherDeductions}
                          onChange={handleInputChange}
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
                  <div className="text-2xl font-bold text-indigo-600">${calculateNetSalary()}</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Reset
                </button>
                <button className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center">
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

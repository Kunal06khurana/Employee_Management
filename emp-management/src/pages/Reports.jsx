import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer, ChevronDown } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('payroll');
  const [dateRange, setDateRange] = useState('current-month');
  const [department, setDepartment] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  const reportTypes = [
    { id: 'payroll', name: 'Payroll Summary', description: 'Overview of all employee salaries and deductions' },
    { id: 'tax', name: 'Tax Report', description: 'Summary of tax deductions for all employees' },
    { id: 'department', name: 'Department Expense', description: 'Salary expenses broken down by department' },
    { id: 'individual', name: 'Individual Salary', description: 'Detailed salary report for individual employees' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payroll Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-indigo-600" />
            Report Options
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <div key={type.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`report-type-${type.id}`}
                        name="report-type"
                        type="radio"
                        checked={reportType === type.id}
                        onChange={() => setReportType(type.id)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`report-type-${type.id}`} className="font-medium text-gray-700">
                        {type.name}
                      </label>
                      <p className="text-gray-500">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                id="date-range"
                name="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="current-month">Current Month</option>
                <option value="previous-month">Previous Month</option>
                <option value="current-quarter">Current Quarter</option>
                <option value="year-to-date">Year to Date</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    name="start-date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    name="end-date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="hr">Human Resources</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance</option>
                <option value="product">Product</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Report Preview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Report Preview
            </h2>
            
            {reportGenerated && (
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            )}
          </div>
          
          {reportGenerated ? (
            <div>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {reportTypes.find(r => r.id === reportType)?.name} Report
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {dateRange === 'current-month' ? 'May 2023' : 'Custom Date Range'}
                  {department !== 'all' && ` • ${department.charAt(0).toUpperCase() + department.slice(1)} Department`}
                </div>
              </div>
              
              {reportType === 'payroll' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross Salary
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deductions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Salary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { name: 'John Doe', department: 'Engineering', gross: 7083.33, deductions: 1770.83, net: 5312.50 },
                        { name: 'Jane Smith', department: 'Human Resources', gross: 6250.00, deductions: 1562.50, net: 4687.50 },
                        { name: 'Michael Brown', department: 'Marketing', gross: 5416.67, deductions: 1354.17, net: 4062.50 },
                        { name: 'Sarah Johnson', department: 'Finance', gross: 5833.33, deductions: 1458.33, net: 4375.00 },
                        { name: 'Robert Wilson', department: 'Product', gross: 7500.00, deductions: 1875.00, net: 5625.00 },
                      ].map((employee, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${employee.gross.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${employee.deductions.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${employee.net.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <th scope="row" colSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                          $32,083.33
                        </td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                          $8,020.83
                        </td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                          $24,062.50
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              {reportType === 'department' && (
                <div>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Department Salary Distribution</h4>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Department salary chart will appear here</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Salary
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Salary
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          { name: 'Engineering', employees: 15, total: 112500, avg: 7500 },
                          { name: 'Human Resources', employees: 8, total: 48000, avg: 6000 },
                          { name: 'Marketing', employees: 12, total: 72000, avg: 6000 },
                          { name: 'Finance', employees: 10, total: 65000, avg: 6500 },
                          { name: 'Product', employees: 7, total: 59500, avg: 8500 },
                          { name: 'Sales', employees: 14, total: 98000, avg: 7000 },
                        ].map((dept, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {dept.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dept.employees}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${dept.total.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${dept.avg.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                            66
                          </td>
                          <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                            $455,000
                          </td>
                          <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                            $6,894
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-indigo-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Generated</h3>
              <p className="text-gray-500 max-w-sm">
                Configure your report options and click "Generate Report" to view and download payroll reports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

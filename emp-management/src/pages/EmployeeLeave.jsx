import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react';
import EmployeeNavbar from '../components/EmployeeNavbar';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    Leave_Type: 'Sick',
    Start_Date: '',
    End_Date: '',
    Remarks: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
        const employeeId = employeeUser.id;

        if (!token || !employeeId) {
          setError('Employee session not found. Please login again.');
          setLoading(false);
          return;
        }

        // Fetch employee data to get leave balance
        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch leave requests
        const leaveResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}/leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeResponse.data) {
          // Set leave balance from employee data
          setLeaveBalance(employeeResponse.data.Leave_Balance || 0);
        }
        
        if (leaveResponse.data) {
          setLeaveRequests(leaveResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchLeaveData:', err);
        setError('Failed to fetch leave data. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.Start_Date) {
      errors.Start_Date = 'Start date is required';
    }
    
    if (!formData.End_Date) {
      errors.End_Date = 'End date is required';
    }
    
    if (formData.Start_Date && formData.End_Date) {
      const start = new Date(formData.Start_Date);
      const end = new Date(formData.End_Date);
      
      if (end < start) {
        errors.End_Date = 'End date must be after start date';
      }
      
      // Check if leave duration exceeds balance
      const duration = calculateDuration(formData.Start_Date, formData.End_Date);
      if (duration > leaveBalance) {
        errors.End_Date = `Leave duration (${duration} days) exceeds your balance (${leaveBalance} days)`;
      }
    }
    
    if (!formData.Remarks.trim()) {
      errors.Remarks = 'Reason is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('employeeToken');
      const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
      const employeeId = employeeUser.id;
      
      // Calculate leave duration
      const duration = calculateDuration(formData.Start_Date, formData.End_Date);
      
      // Prepare leave request data according to the database schema
      const leaveRequestData = {
        Employee_ID: employeeId,
        Leave_Type: formData.Leave_Type,
        Start_Date: formData.Start_Date,
        End_Date: formData.End_Date,
        Status: 'Pending',
        Leave_Balance: leaveBalance - duration, // Calculate new leave balance
        Remarks: formData.Remarks
      };
      
      // Submit leave request
      const response = await axios.post(
        `http://localhost:5000/api/employees/${employeeId}/leaves`,
        leaveRequestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          Leave_Type: 'Sick',
          Start_Date: '',
          End_Date: '',
          Remarks: ''
        });
        
        // Refresh leave data
        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const leaveResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}/leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeResponse.data) {
          setLeaveBalance(employeeResponse.data.Leave_Balance || 0);
        }
        
        if (leaveResponse.data) {
          setLeaveRequests(leaveResponse.data);
        }
      }
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setSubmitError('Failed to submit leave request. Please try again later.');
    }
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
              <div className="text-gray-600">Loading...</div>
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
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">{error}</div>
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
            <p className="text-gray-600 mt-2">
              Apply for leave and track your leave requests
            </p>
          </div>

          {/* Leave Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Leave Balance</h2>
                <p className="text-gray-600 mt-1">Your available leave days</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-full">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-indigo-600">{leaveBalance}</p>
              <p className="text-gray-600">days remaining</p>
            </div>
          </div>

          {/* Leave Application Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Apply for Leave</h2>
            
            {submitSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">Leave request submitted successfully!</p>
                </div>
              </div>
            )}
            
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="Leave_Type" className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type
                  </label>
                  <select
                    id="Leave_Type"
                    name="Leave_Type"
                    value={formData.Leave_Type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Sick">Sick Leave</option>
                    <option value="Vacation">Vacation Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="Start_Date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="Start_Date"
                    name="Start_Date"
                    value={formData.Start_Date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.Start_Date ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.Start_Date && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.Start_Date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="End_Date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="End_Date"
                    name="End_Date"
                    value={formData.End_Date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.End_Date ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.End_Date && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.End_Date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="Remarks" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    id="Remarks"
                    name="Remarks"
                    rows="3"
                    value={formData.Remarks}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.Remarks ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Please provide a reason for your leave request"
                  ></textarea>
                  {formErrors.Remarks && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.Remarks}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>

          {/* Leave History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave History</h2>
            
            {leaveRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveRequests.map((leave) => (
                      <tr key={leave.Leave_ID}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{leave.Leave_Type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(leave.Start_Date)} - {formatDate(leave.End_Date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {calculateDuration(leave.Start_Date, leave.End_Date)} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(leave.Status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(leave.Updated_At)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No leave requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeave; 
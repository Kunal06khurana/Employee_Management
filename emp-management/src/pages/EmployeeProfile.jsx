import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeNavbar from '../components/EmployeeNavbar';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeProfile = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
        const employeeId = employeeUser.id;

        if (!token || !employeeId) {
          setError('Employee session not found. Please login again.');
          setLoading(false);
          return;
        }

        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeResponse.data) {
          const data = employeeResponse.data;
          setEmployeeData({
            ...data,
            Basic_Salary: parseFloat(data.Basic_Salary) || 0,
            Performance_Rating: parseFloat(data.Performance_Rating) || 0,
            Leave_Balance: parseInt(data.Leave_Balance) || 0
          });
        } else {
          setError('Employee data not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchEmployeeData:', err);
        setError('Failed to fetch employee data. Please try again later.');
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹0.00';
    return `₹${amount.toFixed(2)}`;
  };

  // Format rating
  const formatRating = (rating) => {
    if (typeof rating !== 'number') return 'N/A';
    return rating.toFixed(2);
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
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Employee Profile</h1>
            <p className="text-gray-600 mt-2">
              View and manage your personal and professional information
            </p>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-gray-800">{employeeData?.First_Name} {employeeData?.Last_Name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-800">{employeeData?.Email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-800">{employeeData?.Contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                <p className="text-gray-800">{formatDate(employeeData?.DOB)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-800">{employeeData?.Address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Job Title</p>
                <p className="text-gray-800">{employeeData?.Job_Title || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Employment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Department ID</p>
                <p className="text-gray-800">{employeeData?.Department_ID || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date Joined</p>
                <p className="text-gray-800">{formatDate(employeeData?.Date_Joined)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Rating</p>
                <p className="text-gray-800">{formatRating(employeeData?.Performance_Rating)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                <p className="text-gray-800">{employeeData?.Leave_Balance || 0} days</p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bank Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Bank Account Number</p>
                <p className="text-gray-800">{employeeData?.Bank_Account_Number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">IFSC Code</p>
                <p className="text-gray-800">{employeeData?.IFSC_Code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Basic Salary</p>
                <p className="text-gray-800">{formatCurrency(employeeData?.Basic_Salary)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, TrendingUp, AlertCircle, Users, Calendar, Building, Award, CreditCard } from 'lucide-react';
import EmployeeNavbar from '../components/EmployeeNavbar';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeDashboard = () => {
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

        // Fetch employee data
        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeResponse.data) {
          // Convert string values to numbers
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

  // Calculate years of service
  const calculateYearsOfService = () => {
    if (!employeeData?.Date_Joined) return 0;
    const joinDate = new Date(employeeData.Date_Joined);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {employeeData?.First_Name || 'Employee'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's an overview of your employee information and status.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Basic Salary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Basic Salary</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(employeeData?.Basic_Salary)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Leave Balance Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                  <p className="text-2xl font-bold text-gray-800">{employeeData?.Leave_Balance || 0} days</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Performance Rating Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{formatRating(employeeData?.Performance_Rating)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Years of Service Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Years of Service</p>
                  <p className="text-2xl font-bold text-gray-800">{calculateYearsOfService()}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                  View Payslip
                </button>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                  Apply for Leave
                </button>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">
                  Mark Attendance
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <p className="text-gray-600">Last login: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <p className="text-gray-600">Salary credited: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <p className="text-gray-600">Leave request pending</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                  <p className="text-gray-600">Performance Review: Next Month</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-gray-600">Team Meeting: Tomorrow</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                  <p className="text-gray-600">Training Session: Next Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 
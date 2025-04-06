import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    pendingLeaves: [],
    recentActivity: [],
    departmentStats: []
  });
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('Fetching dashboard data with token:', token);

      const [summaryRes, leavesRes, activityRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/summary', { headers }),
        axios.get('http://localhost:5000/api/leave/pending', { headers }),
        axios.get('http://localhost:5000/api/dashboard/recent-activity', { headers })
      ]);

      console.log('Summary Response:', summaryRes.data);
      console.log('Leaves Response:', leavesRes.data);
      console.log('Activity Response:', activityRes.data);

      setDashboardData({
        totalEmployees: summaryRes.data.totalEmployees || 0,
        pendingLeaves: leavesRes.data || [],
        recentActivity: activityRes.data || [],
        departmentStats: summaryRes.data.departmentStats || []
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error.response || error);
      setError(error.response?.data?.message || 'Error fetching dashboard data. Please try again.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleLeaveAction = async (leaveId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/leave/${leaveId}/status`,
        { status: action === 'approve' ? 'Approved' : 'Rejected' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh dashboard data after action
      fetchDashboardData();
    } catch (error) {
      console.error('Error handling leave action:', error.response || error);
      setError(error.response?.data?.message || 'Error updating leave request. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Summary Card */}
      <div className="summary-card">
        <div className="card">
          <h3>Total Employees</h3>
          <p className="number">{dashboardData.totalEmployees}</p>
        </div>
      </div>

      {/* Pending Leave Requests */}
      <div className="section">
        <h2>Pending Leave Requests</h2>
        <div className="leave-requests">
          {dashboardData.pendingLeaves.map((leave) => (
            <div key={leave.Leave_ID} className="leave-card">
              <div className="leave-info">
                <h4>{leave.First_Name} {leave.Last_Name}</h4>
                <p>{leave.Leave_Type} Leave: {new Date(leave.Start_Date).toLocaleDateString()} - {new Date(leave.End_Date).toLocaleDateString()}</p>
              </div>
              <div className="leave-actions">
                <button 
                  className="btn approve"
                  onClick={() => handleLeaveAction(leave.Leave_ID, 'approve')}
                >
                  Approve
                </button>
                <button 
                  className="btn reject"
                  onClick={() => handleLeaveAction(leave.Leave_ID, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {dashboardData.pendingLeaves.length === 0 && (
            <p className="no-data">No pending leave requests</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section">
        <h2>Recent Activity</h2>
        <div className="activity-feed">
          {dashboardData.recentActivity.map((activity, index) => (
            <div key={index} className="activity-card">
              <p>{activity.description}</p>
              <small>{new Date(activity.timestamp).toLocaleString()}</small>
            </div>
          ))}
          {dashboardData.recentActivity.length === 0 && (
            <p className="no-data">No recent activity</p>
          )}
        </div>
      </div>

      {/* Department Statistics */}
      <div className="section">
        <h2>Department Statistics</h2>
        <div className="department-grid">
          {dashboardData.departmentStats.map((dept) => (
            <div key={dept.Department_ID} className="department-card">
              <h3>{dept.Department_Name}</h3>
              <p>Employees: {dept.EmployeeCount}</p>
              <p>Average Salary: ${(dept.AverageSalary || 0).toFixed(2)}</p>
            </div>
          ))}
          {dashboardData.departmentStats.length === 0 && (
            <p className="no-data">No department data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
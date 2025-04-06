import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, AlertCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error('Leave fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/leave/${leaveId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh leaves after action
      fetchLeaves();
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} leave request`);
      console.error('Leave action error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.Leave_ID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${leave.First_Name} ${leave.Last_Name}`}
                    </div>
                    <div className="text-sm text-gray-500">{leave.Email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.Department_Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.Leave_Type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(leave.Start_Date).toLocaleDateString()}</div>
                    <div>to</div>
                    <div>{new Date(leave.End_Date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      leave.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      leave.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {leave.Status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLeaveAction(leave.Leave_ID, 'Approved')}
                          className="text-green-600 hover:text-green-900 bg-green-100 p-2 rounded-full"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.Leave_ID, 'Rejected')}
                          className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement; 
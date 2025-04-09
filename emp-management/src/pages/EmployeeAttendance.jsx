import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import EmployeeSidebar from '../components/EmployeeSidebar';
import EmployeeNavbar from '../components/EmployeeNavbar';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    present_days: 0,
    absent_days: 0,
    half_days: 0,
    leave_days: 0,
    total_hours: 0
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Get employee data from localStorage
        const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
        const employeeId = employeeUser.id;
        
        if (!employeeId) {
          setError('Employee ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Get token from localStorage
        const token = localStorage.getItem('employeeToken');
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log(`Fetching attendance for employee ${employeeId}, month ${month}, year ${year}`);
        
        const response = await axios.get(`http://localhost:5000/api/attendance/employee/${employeeId}?month=${month}&year=${year}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Attendance data received:', response.data);
        setAttendance(response.data);
        
        // Calculate summary
        const summaryData = response.data.reduce((acc, record) => {
          // Count status days
          const statusKey = record.Status.toLowerCase().replace('-', '_');
          if (acc[`${statusKey}_days`] !== undefined) {
            acc[`${statusKey}_days`]++;
          }
          
          // Sum up hours worked
          if (record.Hours_Worked) {
            acc.total_hours += parseFloat(record.Hours_Worked);
          }
          
          return acc;
        }, {
          present_days: 0,
          absent_days: 0,
          half_day_days: 0,
          leave_days: 0,
          total_hours: 0
        });

        // Round total hours to 2 decimal places
        summaryData.total_hours = Math.round(summaryData.total_hours * 100) / 100;
        
        console.log('Calculated summary:', summaryData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.response?.data?.message || 'Failed to fetch attendance data');
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

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
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Present Days</p>
                  <p className="text-2xl font-bold text-emerald-700">{summary.present_days}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Absent Days</p>
                  <p className="text-2xl font-bold text-red-700">{summary.absent_days}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Half Days</p>
                  <p className="text-2xl font-bold text-amber-700">{summary.half_day_days}</p>
                </div>
                <Activity className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-700">{summary.total_hours}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Hours</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.Attendance_ID} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {new Date(record.Date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${record.Status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 
                            record.Status === 'Absent' ? 'bg-red-100 text-red-800' :
                            record.Status === 'Half-Day' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {record.Status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.Hours_Worked || 0} hrs</td>
                      <td className="py-3 px-4 text-gray-600">{record.Shift_Details || '-'}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">
                        No attendance records for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance; 
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Calendar, Activity, Building2, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    pendingLeaves: [],
    recentActivity: [],
    departmentStats: [],
    todayAttendance: {
      attendance: [],
      summary: {
        present_count: 0,
        absent_count: 0,
        half_day_count: 0,
        leave_count: 0,
      },
    },
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found. Please login again.")
        setLoading(false)
        setRefreshing(false)
        navigate("/login")
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // First try to fetch attendance data
      let attendanceData = { attendance: [], summary: {} }
      try {
        const attendanceRes = await axios.get("http://localhost:5000/api/attendance/today", { headers })
        attendanceData = attendanceRes.data
      } catch (error) {
        console.error("Error fetching attendance:", error)
        // Don't set error here, just continue with empty attendance data
      }

      // Then fetch other dashboard data
      const [summaryRes, leavesRes, activityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard/summary", { headers }),
        axios.get("http://localhost:5000/api/leave/pending", { headers }),
        axios.get("http://localhost:5000/api/dashboard/recent-activity", { headers }),
      ])

      setDashboardData({
        totalEmployees: summaryRes.data.totalEmployees || 0,
        pendingLeaves: leavesRes.data || [],
        recentActivity: activityRes.data || [],
        departmentStats: summaryRes.data.departmentStats || [],
        todayAttendance: attendanceData,
      })
      setError(null)
    } catch (error) {
      console.error("Error fetching dashboard data:", error.response || error)
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        setError(error.response?.data?.message || "Error fetching dashboard data. Please try again.")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    fetchDashboardData()
    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000)
    return () => clearInterval(interval)
  }, [navigate])

  const handleLeaveAction = async (leaveId, action, employeeId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:5000/api/employees/${employeeId}/leaves/${leaveId}`,
        { status: action === "approve" ? "Approved" : "Rejected" },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      // Refresh dashboard data after action
      fetchDashboardData()
    } catch (error) {
      console.error("Error handling leave action:", error.response || error)
      setError(error.response?.data?.message || "Error updating leave request. Please try again.")
    }
  }

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getRandomColor = (index) => {
    const colors = [
      "bg-gradient-to-br from-purple-500 to-indigo-600",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-pink-500 to-rose-600",
      "bg-gradient-to-br from-amber-500 to-orange-600",
      "bg-gradient-to-br from-cyan-500 to-sky-600",
    ]
    return colors[index % colors.length]
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-md"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">HR Dashboard</h1>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4 transition-all duration-300"
        >
          <div className="bg-purple-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalEmployees}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4 transition-all duration-300"
        >
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.pendingLeaves.length}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4 transition-all duration-300"
        >
          <div className="bg-amber-100 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recent Activities</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.recentActivity.length}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center gap-4 transition-all duration-300"
        >
          <div className="bg-pink-100 p-3 rounded-lg">
            <Building2 className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.departmentStats.length}</h3>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Statistics with Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Department Statistics
          </h2>

          {dashboardData.departmentStats.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.departmentStats.map((dept) => ({
                    name: dept.Department_Name,
                    employees: dept.EmployeeCount,
                    salary: dept.AverageSalary || 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "salary") return [`$${value.toFixed(2)}`, "Avg. Salary"]
                      return [value, "Employees"]
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="employees" fill="#8884d8" name="Employees" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salary" fill="#82ca9d" name="Avg. Salary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Activity
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {dashboardData.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <p className="text-gray-700">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(activity.timestamp).toLocaleString()}</p>
              </motion.div>
            ))}
            {dashboardData.recentActivity.length === 0 && (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Today's Attendance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Today's Attendance
        </h2>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Present</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {dashboardData.todayAttendance.summary.present_count || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">
                  {dashboardData.todayAttendance.summary.absent_count || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Half Day</p>
                <p className="text-2xl font-bold text-amber-700">
                  {dashboardData.todayAttendance.summary.half_day_count || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Activity className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">On Leave</p>
                <p className="text-2xl font-bold text-blue-700">
                  {dashboardData.todayAttendance.summary.leave_count || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-purple-50 border-b border-purple-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Employee</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Hours</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Shift</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.todayAttendance.attendance.map((record, index) => (
                <motion.tr
                  key={record.Attendance_ID}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-purple-50 transition-colors duration-150`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {record.First_Name} {record.Last_Name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        record.Status === "Present"
                          ? "bg-emerald-100 text-emerald-800"
                          : record.Status === "Absent"
                            ? "bg-red-100 text-red-800"
                            : record.Status === "Half-Day"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.Status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{record.Hours_Worked || 0} hrs</td>
                  <td className="py-3 px-4 text-gray-600">{record.Shift_Details || "-"}</td>
                </motion.tr>
              ))}
              {dashboardData.todayAttendance.attendance.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No attendance records for today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pending Leave Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Pending Leave Requests
        </h2>

        <div className="overflow-x-auto">
          {dashboardData.pendingLeaves.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-50 border-b border-purple-100">
                  <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Employee</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Leave Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-purple-600">Duration</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-purple-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.pendingLeaves.map((leave, index) => (
                  <motion.tr
                    key={leave.Leave_ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {leave.First_Name} {leave.Last_Name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{leave.Leave_Type}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(leave.Start_Date)} - {formatDate(leave.End_Date)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLeaveAction(leave.Leave_ID, "approve", leave.Employee_ID)}
                          className="px-3 py-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLeaveAction(leave.Leave_ID, "reject", leave.Employee_ID)}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">No pending leave requests</div>
          )}
        </div>
      </motion.div>

      {/* Department Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {dashboardData.departmentStats.map((dept, index) => (
          <motion.div
            key={dept.Department_ID}
            whileHover={{ scale: 1.03 }}
            className={`rounded-xl shadow-md p-6 text-white ${getRandomColor(index)}`}
          >
            <h3 className="text-xl font-bold mb-2">{dept.Department_Name}</h3>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-white text-opacity-80 text-sm">Employees</p>
                <p className="text-2xl font-bold">{dept.EmployeeCount}</p>
              </div>
              <div>
                <p className="text-white text-opacity-80 text-sm">Avg. Salary</p>
                <p className="text-2xl font-bold">${(dept.AverageSalary || 0).toFixed(0)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Dashboard

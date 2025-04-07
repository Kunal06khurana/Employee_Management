"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Calendar, Activity, Building2, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    pendingLeaves: [],
    recentActivity: [],
    departmentStats: [],
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
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

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
      })
      setError(null)
    } catch (error) {
      console.error("Error fetching dashboard data:", error.response || error)
      setError(error.response?.data?.message || "Error fetching dashboard data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000)
    return () => clearInterval(interval)
  }, [])

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

  const getRandomTextColor = (index) => {
    const colors = ["text-purple-600", "text-emerald-600", "text-pink-600", "text-amber-600", "text-cyan-600"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">HR Dashboard</h1>
        <button
          onClick={() => fetchDashboardData()}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-600" : "text-gray-600"}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalEmployees}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.pendingLeaves.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recent Activities</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.recentActivity.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-pink-100 p-3 rounded-lg">
            <Building2 className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.departmentStats.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Statistics with Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
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
                  />
                  <Bar dataKey="employees" fill="#8884d8" name="Employees" />
                  <Bar dataKey="salary" fill="#82ca9d" name="Avg. Salary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Recent Activity
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <p className="text-gray-700">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {dashboardData.recentActivity.length === 0 && (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          Pending Leave Requests
        </h2>

        <div className="overflow-x-auto">
          {dashboardData.pendingLeaves.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Employee</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Leave Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Duration</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.pendingLeaves.map((leave, index) => (
                  <tr
                    key={leave.Leave_ID}
                    className={`${index !== dashboardData.pendingLeaves.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">
                        {leave.First_Name} {leave.Last_Name}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRandomTextColor(index)} bg-opacity-10 ${getRandomTextColor(index).replace("text-", "bg-")}`}
                      >
                        {leave.Leave_Type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(leave.Start_Date)} - {formatDate(leave.End_Date)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                          onClick={() => handleLeaveAction(leave.Leave_ID, "approve", leave.Employee_ID)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          onClick={() => handleLeaveAction(leave.Leave_ID, "reject", leave.Employee_ID)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No pending leave requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.departmentStats.map((dept, index) => (
          <div key={dept.Department_ID} className={`rounded-xl shadow-sm p-6 text-white ${getRandomColor(index)}`}>
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard


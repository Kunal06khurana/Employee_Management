"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Clock, CheckCircle, XCircle, Activity, CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"
import EmployeeSidebar from "../components/EmployeeSidebar"
import EmployeeNavbar from "../components/EmployeeNavbar"

// Replace the entire component with this enhanced version
const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    present_days: 0,
    absent_days: 0,
    half_days: 0,
    leave_days: 0,
    total_hours: 0,
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAttendance()
  }, [selectedMonth, selectedYear])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      // Get employee data from localStorage
      const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "{}")
      const employeeId = employeeUser.id

      if (!employeeId) {
        setError("Employee ID not found. Please log in again.")
        setLoading(false)
        return
      }

      // Get token from localStorage
      const token = localStorage.getItem("employeeToken")

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      console.log(`Fetching attendance for employee ${employeeId}, month ${selectedMonth}, year ${selectedYear}`)

      const response = await axios.get(
        `http://localhost:5000/api/attendance/employee/${employeeId}?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Attendance data received:", response.data)
      setAttendance(response.data)

      // Calculate summary
      const summaryData = response.data.reduce(
        (acc, record) => {
          // Count status days
          const statusKey = record.Status.toLowerCase().replace("-", "_")
          if (acc[`${statusKey}_days`] !== undefined) {
            acc[`${statusKey}_days`]++
          }

          // Sum up hours worked
          if (record.Hours_Worked) {
            acc.total_hours += Number.parseFloat(record.Hours_Worked)
          }

          return acc
        },
        {
          present_days: 0,
          absent_days: 0,
          half_day_days: 0,
          leave_days: 0,
          total_hours: 0,
        },
      )

      // Round total hours to 2 decimal places
      summaryData.total_hours = Math.round(summaryData.total_hours * 100) / 100

      console.log("Calculated summary:", summaryData)
      setSummary(summaryData)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching attendance:", err)
      setError(err.response?.data?.message || "Failed to fetch attendance data")
      setLoading(false)
    }
  }

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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 shadow-sm"
            >
              {error}
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <EmployeeSidebar />
      <div className="flex-1 ml-64">
        <EmployeeNavbar />
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            </div>
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Attendance Summary Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Present Days</p>
                  <p className="text-2xl font-bold text-emerald-700">{summary.present_days}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Absent Days</p>
                  <p className="text-2xl font-bold text-red-700">{summary.absent_days}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Half Days</p>
                  <p className="text-2xl font-bold text-amber-700">{summary.half_day_days}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Activity className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-700">{summary.total_hours}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Attendance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-100">
                    <th className="py-4 px-6 text-left text-sm font-medium text-purple-600">Date</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-purple-600">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-purple-600">Hours</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-purple-600">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <motion.tr
                      key={record.Attendance_ID}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-purple-50 transition-colors duration-150`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-medium">
                          {new Date(record.Date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
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
                          {record.Status === "Present" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {record.Status === "Absent" && <XCircle className="w-3 h-3 mr-1" />}
                          {record.Status === "Half-Day" && <Activity className="w-3 h-3 mr-1" />}
                          {record.Status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{record.Hours_Worked || 0} hrs</td>
                      <td className="py-4 px-6 text-gray-600">{record.Shift_Details || "-"}</td>
                    </motion.tr>
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
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeAttendance

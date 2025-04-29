"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Clock, TrendingUp, Users, Calendar, Award, Bell, FileText, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import EmployeeNavbar from "../components/EmployeeNavbar"
import EmployeeSidebar from "../components/EmployeeSidebar"
import { Link } from "react-router-dom"

// Replace the entire component with this enhanced version
const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Salary Credited", message: "Your salary has been credited to your account.", date: new Date() },
    {
      id: 2,
      title: "Leave Approved",
      message: "Your leave request has been approved.",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      title: "Performance Review",
      message: "Your performance review is scheduled next week.",
      date: new Date(Date.now() - 172800000),
    },
  ])

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("employeeToken")
        const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "{}")
        const employeeId = employeeUser.id

        if (!token || !employeeId) {
          setError("Employee session not found. Please login again.")
          setLoading(false)
          return
        }

        // Fetch employee data
        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (employeeResponse.data) {
          // Convert string values to numbers
          const data = employeeResponse.data
          setEmployeeData({
            ...data,
            Basic_Salary: Number.parseFloat(data.Basic_Salary) || 0,
            Performance_Rating: Number.parseFloat(data.Performance_Rating) || 0,
            Leave_Balance: Number.parseInt(data.Leave_Balance) || 0,
          })
        } else {
          setError("Employee data not found")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in fetchEmployeeData:", err)
        setError("Failed to fetch employee data. Please try again later.")
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "₹0.00"
    return `₹${amount.toFixed(2)}`
  }

  // Format rating
  const formatRating = (rating) => {
    if (typeof rating !== "number") return "N/A"
    return rating.toFixed(2)
  }

  // Calculate years of service
  const calculateYearsOfService = () => {
    if (!employeeData?.Date_Joined) return 0
    const joinDate = new Date(employeeData.Date_Joined)
    const today = new Date()
    const diffTime = Math.abs(today - joinDate)
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
    return diffYears
  }

  // Format date for notifications
  const formatNotificationDate = (date) => {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else {
      return `${diffDays} days ago`
    }
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {employeeData?.First_Name || "Employee"}!
            </h1>
            <p className="text-gray-600 mt-2">Here's an overview of your employee information and status.</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Basic Salary Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Basic Salary</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(employeeData?.Basic_Salary)}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            {/* Leave Balance Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Leave Balance</p>
                  <p className="text-2xl font-bold text-gray-800">{employeeData?.Leave_Balance || 0} days</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            {/* Performance Rating Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Performance Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800 mr-2">
                      {formatRating(employeeData?.Performance_Rating)}
                    </p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Award
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(employeeData?.Performance_Rating || 0)
                              ? "text-yellow-500"
                              : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            {/* Years of Service Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Years of Service</p>
                  <p className="text-2xl font-bold text-gray-800">{calculateYearsOfService()}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ChevronRight className="w-5 h-5 text-purple-600 mr-2" />
                Quick Actions
              </h3>
              <div>
                <Link to="/employee/payslip" className="block py-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    View Payslip
                  </motion.button>
                </Link>
                <Link to="/employee/leave" className="block py-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Apply for Leave
                  </motion.button>
                </Link>
                <Link to="/employee/attendance" className="block py-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Mark Attendance
                  </motion.button>
                </Link>
              </div>

            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Bell className="w-5 h-5 text-purple-600 mr-2" />
                Notifications
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">{formatNotificationDate(notification.date)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                Upcoming Events
              </h3>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <div className="bg-white p-2 rounded-md shadow-sm mr-4">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Performance Review</p>
                    <p className="text-sm text-gray-600">Next Month</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100"
                >
                  <div className="bg-white p-2 rounded-md shadow-sm mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Team Meeting</p>
                    <p className="text-sm text-gray-600">Tomorrow</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="bg-white p-2 rounded-md shadow-sm mr-4">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Training Session</p>
                    <p className="text-sm text-gray-600">Next Week</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard

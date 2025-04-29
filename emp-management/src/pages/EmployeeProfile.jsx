"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { User, Mail, Phone, Briefcase, Award, CreditCard } from "lucide-react"
import { motion } from "framer-motion"
import EmployeeNavbar from "../components/EmployeeNavbar"
import EmployeeSidebar from "../components/EmployeeSidebar"

const EmployeeProfile = () => {
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("personal")

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

        const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (employeeResponse.data) {
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

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
            </div>
            <p className="text-gray-600 mt-2 ml-11">View and manage your personal and professional information</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-purple-100 rounded-full p-6 shadow-md">
                <User className="w-16 h-16 text-purple-600" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  {employeeData?.First_Name} {employeeData?.Last_Name}
                </h2>
                <p className="text-purple-600 font-medium">{employeeData?.Job_Title || "Employee"}</p>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="flex items-center justify-center md:justify-start">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">{employeeData?.Email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">{employeeData?.Contact || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-md">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === "personal" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab("employment")}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === "employment" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Employment Information
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === "bank" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Bank Information
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            {activeTab === "personal" && (
              <motion.div variants={container} initial="hidden" animate="show">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="w-5 h-5 text-purple-600 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-gray-800 font-medium">
                      {employeeData?.First_Name} {employeeData?.Last_Name}
                    </p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Email}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Contact || "N/A"}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                    <p className="text-gray-800 font-medium">{formatDate(employeeData?.DOB)}</p>
                  </motion.div>
                  <motion.div
                    variants={item}
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors md:col-span-2"
                  >
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Address || "N/A"}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "employment" && (
              <motion.div variants={container} initial="hidden" animate="show">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Briefcase className="w-5 h-5 text-purple-600 mr-2" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Job Title</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Job_Title || "N/A"}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Department ID</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Department_ID || "N/A"}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Date Joined</p>
                    <p className="text-gray-800 font-medium">{formatDate(employeeData?.Date_Joined)}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Performance Rating</p>
                    <div className="flex items-center">
                      <p className="text-gray-800 font-medium mr-2">{formatRating(employeeData?.Performance_Rating)}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Award
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(employeeData?.Performance_Rating || 0)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Leave_Balance || 0} days</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "bank" && (
              <motion.div variants={container} initial="hidden" animate="show">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Bank Account Number</p>
                    <p className="text-gray-800 font-medium">{employeeData?.Bank_Account_Number || "N/A"}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">IFSC Code</p>
                    <p className="text-gray-800 font-medium">{employeeData?.IFSC_Code || "N/A"}</p>
                  </motion.div>
                  <motion.div variants={item} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">Basic Salary</p>
                    <p className="text-gray-800 font-medium">{formatCurrency(employeeData?.Basic_Salary)}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeProfile

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Check, X, AlertCircle, Calendar, RefreshCw, Filter, Search } from "lucide-react"
import { motion } from "framer-motion"

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/leave/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLeaves(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch leave requests")
      console.error("Leave fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveAction = async (leaveId, status) => {
    try {
      setProcessing(leaveId)
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:5000/api/leave/${leaveId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Refresh leaves after action
      fetchLeaves()
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} leave request`)
      console.error("Leave action error:", err)
    } finally {
      setTimeout(() => {
        setProcessing(null)
      }, 500)
    }
  }

  // Filter leaves based on search term and filters
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      `${leave.First_Name} ${leave.Last_Name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.Leave_Type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || leave.Status === filterStatus
    const matchesType = filterType === "all" || leave.Leave_Type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Get unique leave types for filter
  const leaveTypes = [...new Set(leaves.map((leave) => leave.Leave_Type))]

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
          <p className="mt-4 text-lg font-medium text-gray-700">Loading leave requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-6"
      >
        <Calendar className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Leave Management</h1>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 shadow-sm"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by employee or leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-purple-50 border-b border-purple-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave, index) => (
                  <motion.tr
                    key={leave.Leave_ID}
                    variants={item}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-purple-50 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${leave.First_Name} ${leave.Last_Name}`}
                      </div>
                      <div className="text-sm text-gray-500">{leave.Email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.Department_Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.Leave_Type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(leave.Start_Date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">to</div>
                      <div>{new Date(leave.End_Date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.Status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : leave.Status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {leave.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.Status === "Pending" && (
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLeaveAction(leave.Leave_ID, "Approved")}
                            disabled={processing === leave.Leave_ID}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors"
                          >
                            {processing === leave.Leave_ID ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLeaveAction(leave.Leave_ID, "Rejected")}
                            disabled={processing === leave.Leave_ID}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors"
                          >
                            {processing === leave.Leave_ID ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No leave requests found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default LeaveManagement

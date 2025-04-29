"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { User, Phone, Calendar, Users, Heart } from "lucide-react"
import { motion } from "framer-motion"
import EmployeeNavbar from "../components/EmployeeNavbar"
import EmployeeSidebar from "../components/EmployeeSidebar"

// Replace the entire component with this enhanced version
const EmployeeDependents = () => {
  const [dependents, setDependents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDependents = async () => {
      try {
        const token = localStorage.getItem("employeeToken")
        const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "{}")
        const employeeId = employeeUser.id

        if (!token || !employeeId) {
          setError("Employee session not found. Please login again.")
          setLoading(false)
          return
        }

        const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}/dependents`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data) {
          setDependents(response.data)
        } else {
          setError("No dependents found")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in fetchDependents:", err)
        setError("Failed to fetch dependents data. Please try again later.")
        setLoading(false)
      }
    }

    fetchDependents()
  }, [])

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Get relationship icon
  const getRelationshipIcon = (relationship) => {
    if (!relationship) return <Users className="h-6 w-6 text-purple-600" />

    const rel = relationship.toLowerCase()
    if (rel.includes("spouse")) return <Heart className="h-6 w-6 text-pink-600" />
    if (rel.includes("child")) return <User className="h-6 w-6 text-blue-600" />
    if (rel.includes("parent")) return <Users className="h-6 w-6 text-green-600" />
    return <Users className="h-6 w-6 text-purple-600" />
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
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Dependents</h1>
            </div>
            <p className="text-gray-600 mt-2 ml-11">View and manage information about your dependents</p>
          </motion.div>

          {/* Dependents Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {dependents.length > 0 ? (
              dependents.map((dependent, index) => (
                <motion.div
                  key={dependent.id || index}
                  variants={item}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-full shadow-sm">
                      {getRelationshipIcon(dependent.Relationship)}
                    </div>
                    <span className="text-sm font-medium text-white bg-purple-600 px-3 py-1 rounded-full shadow-sm">
                      {dependent.Relationship || "Dependent"}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {dependent.First_Name || dependent.Name} {dependent.Last_Name || ""}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                        <p className="text-gray-800">{formatDate(dependent.DOB)}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <User className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gender</p>
                        <p className="text-gray-800">{dependent.Gender || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact</p>
                        <p className="text-gray-800">{dependent.Contact || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center"
                >
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No dependents found. Please add your dependents.</p>
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Contact HR to Add Dependents
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDependents

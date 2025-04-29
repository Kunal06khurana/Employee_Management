"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2, User, Users, Calendar, Mail, Phone, Briefcase, CreditCard, Building } from "lucide-react"
import { motion } from "framer-motion"

const AddEmployee = () => {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    First_Name: "", // varchar(50), NOT NULL
    Last_Name: "", // varchar(50), NOT NULL
    DOB: "", // date, NOT NULL
    Address: "", // text, NULL
    Contact: "", // varchar(20), NULL
    Email: "", // varchar(100), NOT NULL, UNIQUE
    Job_Title: "", // varchar(100), NOT NULL
    Department_ID: "", // int, NOT NULL
    Date_Joined: new Date().toISOString().split("T")[0], // date, NOT NULL
    Performance_Rating: "", // decimal(3,2), NULL
    Bank_Account_Number: "", // varchar(50), NULL
    IFSC_Code: "", // varchar(20), NULL
    Password: "", // varchar(255), NOT NULL
    Leave_Balance: 20, // int, DEFAULT 20
    Basic_Salary: "", // decimal(10,2), NOT NULL, DEFAULT 0.00
    dependents: [], // Array for dependent information
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDepartments(response.data)
      } catch (err) {
        console.error("Error fetching departments:", err)
      }
    }

    fetchDepartments()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDependentChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      dependents: prev.dependents.map((dependent, i) => (i === index ? { ...dependent, [field]: value } : dependent)),
    }))
  }

  const addDependent = () => {
    setFormData((prev) => ({
      ...prev,
      dependents: [
        ...prev.dependents,
        {
          Name: "", // varchar(100), NOT NULL
          Relationship: "", // varchar(50), NOT NULL
          DOB: "", // date, NULL
          Gender: "", // enum('M','F','Other'), NULL
          Contact: "", // varchar(20), NULL
        },
      ],
    }))
  }

  const removeDependent = (index) => {
    if (formData.dependents.length > 1) {
      setFormData((prev) => ({
        ...prev,
        dependents: prev.dependents.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/employees", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/employees")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add employee")
    } finally {
      setLoading(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-6"
      >
        <User className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Add New Employee</h1>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
        >
          Employee added successfully! Redirecting...
        </motion.div>
      )}

      <motion.form
        variants={container}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit}
        className="space-y-8 bg-white rounded-xl shadow-lg p-6"
      >
        {/* Personal Information */}
        <div>
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 text-purple-600 mr-2" />
            Personal Information
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="First_Name"
                  value={formData.First_Name}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                name="Last_Name"
                value={formData.Last_Name}
                onChange={handleChange}
                required
                maxLength={50}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="Contact"
                  value={formData.Contact}
                  onChange={handleChange}
                  maxLength={20}
                  className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={item} className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  required
                  className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 text-purple-600 mr-2" />
            Employment Information
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Job Title *</label>
              <input
                type="text"
                name="Job_Title"
                value={formData.Job_Title}
                onChange={handleChange}
                required
                maxLength={100}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Department *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="Department_ID"
                  value={formData.Department_ID}
                  onChange={handleChange}
                  required
                  className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.Department_ID} value={dept.Department_ID}>
                      {dept.Department_Name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Date Joined *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="Date_Joined"
                  value={formData.Date_Joined}
                  onChange={handleChange}
                  required
                  className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
              <input
                type="number"
                name="Performance_Rating"
                value={formData.Performance_Rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Basic Salary *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="Basic_Salary"
                  value={formData.Basic_Salary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bank Information */}
        <div>
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
            Bank Information
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
              <input
                type="text"
                name="Bank_Account_Number"
                value={formData.Bank_Account_Number}
                onChange={handleChange}
                maxLength={50}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
              <input
                type="text"
                name="IFSC_Code"
                value={formData.IFSC_Code}
                onChange={handleChange}
                maxLength={20}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>
          </div>
        </div>

        {/* Security Information */}
        <div>
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 text-purple-600 mr-2" />
            Security Information
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                required
                maxLength={255}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700">Leave Balance</label>
              <input
                type="number"
                name="Leave_Balance"
                value={formData.Leave_Balance}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
              />
            </motion.div>
          </div>
        </div>

        {/* Dependents section */}
        <div>
          <motion.h2 variants={item} className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            Dependents
          </motion.h2>
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addDependent}
            className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Dependent
          </motion.button>

          {formData.dependents.map((dependent, index) => (
            <motion.div
              key={index}
              variants={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-4 mb-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={dependent.Name}
                    onChange={(e) => handleDependentChange(index, "Name", e.target.value)}
                    required
                    maxLength={100}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship *</label>
                  <select
                    value={dependent.Relationship}
                    onChange={(e) => handleDependentChange(index, "Relationship", e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={dependent.DOB}
                    onChange={(e) => handleDependentChange(index, "DOB", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={dependent.Gender}
                    onChange={(e) => handleDependentChange(index, "Gender", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="tel"
                    value={dependent.Contact}
                    onChange={(e) => handleDependentChange(index, "Contact", e.target.value)}
                    maxLength={20}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    const newDependents = [...formData.dependents]
                    newDependents.splice(index, 1)
                    setFormData({ ...formData, dependents: newDependents })
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors shadow-md flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Employee
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  )
}

export default AddEmployee

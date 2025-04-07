"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Employees = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Job_Title: "",
    Department_ID: "",
    Date_Joined: "",
    DOB: "",
    Address: "",
    Contact: "",
    Bank_Account_Number: "",
    IFSC_Code: "",
    Password: "",
    Performance_Rating: "",
  })

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [viewEmployee, setViewEmployee] = useState(null)

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Failed to fetch employees. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (formData.Employee_ID) {
        // Update existing employee
        await axios.put(
          `http://localhost:5000/api/employees/${formData.Employee_ID}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        // Add new employee
        await axios.post(
          'http://localhost:5000/api/employees',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchEmployees()
      resetForm()
    } catch (error) {
      console.error('Error saving employee:', error)
      setError(error.response?.data?.message || 'Failed to save employee. Please try again.')
    }
  }

  const handleEdit = (employee) => {
    setFormData(employee)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      setError(error.response?.data?.message || 'Failed to delete employee. Please try again.')
    }
  }

  const handleView = (employee) => {
    setViewEmployee(employee)
  }

  const resetForm = () => {
    setFormData({
      First_Name: "",
      Last_Name: "",
      Email: "",
      Job_Title: "",
      Department_ID: "",
      Date_Joined: "",
      DOB: "",
      Address: "",
      Contact: "",
      Bank_Account_Number: "",
      IFSC_Code: "",
      Password: "",
      Performance_Rating: "",
    })
    setShowAddModal(false)
    setError(null)
  }

  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      employee.First_Name.toLowerCase().includes(searchLower) ||
      employee.Last_Name.toLowerCase().includes(searchLower) ||
      employee.Email.toLowerCase().includes(searchLower) ||
      employee.Job_Title.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">Employee Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 flex items-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          <button
            onClick={() => navigate('/employees/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.Employee_ID}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.First_Name} {employee.Last_Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.Email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.Job_Title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {departments.find(d => d.Department_ID === employee.Department_ID)?.Department_Name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(employee.Date_Joined).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(employee)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.Employee_ID)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              {formData.Employee_ID ? "Edit Employee" : "Add New Employee"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="First_Name"
                    value={formData.First_Name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="Last_Name"
                    value={formData.Last_Name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    name="Job_Title"
                    value={formData.Job_Title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="Department_ID"
                    value={formData.Department_ID}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.Department_ID} value={dept.Department_ID}>
                        {dept.Department_Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                  <input
                    type="date"
                    name="Date_Joined"
                    value={formData.Date_Joined}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="tel"
                    name="Contact"
                    value={formData.Contact}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                  <input
                    type="text"
                    name="Bank_Account_Number"
                    value={formData.Bank_Account_Number}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                  <input
                    type="text"
                    name="IFSC_Code"
                    value={formData.IFSC_Code}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required={!formData.Employee_ID}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
                  <input
                    type="number"
                    name="Performance_Rating"
                    value={formData.Performance_Rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {formData.Employee_ID ? "Update" : "Add"} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">{viewEmployee.First_Name} {viewEmployee.Last_Name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{viewEmployee.Email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job Title</p>
                <p className="mt-1">{viewEmployee.Job_Title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="mt-1">
                  {departments.find(d => d.Department_ID === viewEmployee.Department_ID)?.Department_Name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Joined</p>
                <p className="mt-1">{new Date(viewEmployee.Date_Joined).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="mt-1">{new Date(viewEmployee.DOB).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="mt-1">{viewEmployee.Contact}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Account</p>
                <p className="mt-1">{viewEmployee.Bank_Account_Number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                <p className="mt-1">{viewEmployee.IFSC_Code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Performance Rating</p>
                <p className="mt-1">{viewEmployee.Performance_Rating || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewEmployee(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees


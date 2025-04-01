"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react"

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    position: "",
    department: "",
    joinDate: "",
    salary: "",
    phone: "",
    address: "",
    taxId: "",
    bankAccount: "",
    emergencyContact: "",
    status: "active",
  })

  // Sample employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      position: "Software Engineer",
      department: "Engineering",
      joinDate: "2022-01-15",
      salary: 85000,
      phone: "+1 (555) 123-4567",
      address: "123 Main St, Anytown, CA 12345",
      taxId: "TX-12345-JD",
      bankAccount: "****4567",
      emergencyContact: "Jane Doe, +1 (555) 987-6543",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      position: "HR Manager",
      department: "Human Resources",
      joinDate: "2021-05-20",
      salary: 75000,
      phone: "+1 (555) 234-5678",
      address: "456 Oak St, Somewhere, NY 54321",
      taxId: "TX-67890-JS",
      bankAccount: "****7890",
      emergencyContact: "John Smith, +1 (555) 876-5432",
      status: "active",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      position: "Marketing Specialist",
      department: "Marketing",
      joinDate: "2022-03-10",
      salary: 65000,
      phone: "+1 (555) 345-6789",
      address: "789 Pine St, Nowhere, TX 67890",
      taxId: "TX-23456-MB",
      bankAccount: "****2345",
      emergencyContact: "Sarah Brown, +1 (555) 765-4321",
      status: "on_leave",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      position: "Financial Analyst",
      department: "Finance",
      joinDate: "2021-11-05",
      salary: 70000,
      phone: "+1 (555) 456-7890",
      address: "321 Elm St, Everywhere, FL 13579",
      taxId: "TX-34567-SJ",
      bankAccount: "****3456",
      emergencyContact: "Mike Johnson, +1 (555) 654-3210",
      status: "active",
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert@example.com",
      position: "Product Manager",
      department: "Product",
      joinDate: "2022-02-28",
      salary: 90000,
      phone: "+1 (555) 567-8901",
      address: "654 Maple St, Someplace, WA 24680",
      taxId: "TX-45678-RW",
      bankAccount: "****4567",
      emergencyContact: "Lisa Wilson, +1 (555) 543-2109",
      status: "inactive",
    },
  ])

  const [viewEmployee, setViewEmployee] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.id) {
      // Update existing employee
      setEmployees(
        employees.map((emp) => (emp.id === formData.id ? { ...formData, salary: Number(formData.salary) } : emp)),
      )
    } else {
      // Add new employee
      const newEmployee = {
        ...formData,
        id: employees.length + 1,
        salary: Number(formData.salary),
      }
      setEmployees([...employees, newEmployee])
    }
    resetForm()
  }

  const handleEdit = (employee) => {
    setFormData(employee)
    setShowAddModal(true)
  }

  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const handleView = (employee) => {
    setViewEmployee(employee)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      position: "",
      department: "",
      joinDate: "",
      salary: "",
      phone: "",
      address: "",
      taxId: "",
      bankAccount: "",
      emergencyContact: "",
      status: "active",
    })
    setShowAddModal(false)
  }

  const filteredEmployees = employees.filter((employee) => {
    // Filter by search term
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && employee.status === "active"
    if (activeTab === "on_leave") return matchesSearch && employee.status === "on_leave"
    if (activeTab === "inactive") return matchesSearch && employee.status === "inactive"

    return matchesSearch
  })

  return (
    <div className="container mx-auto px-4 py-8">
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
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === "all" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("all")}
        >
          All Employees
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === "active" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === "on_leave" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("on_leave")}
        >
          On Leave
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === "inactive" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search employees by name, email, position, or department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : employee.status === "on_leave"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.status === "active"
                        ? "Active"
                        : employee.status === "on_leave"
                          ? "On Leave"
                          : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(employee)} className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEdit(employee)} className="text-yellow-600 hover:text-yellow-900">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.id ? "Edit Employee" : "Add New Employee"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Employment Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Join Date</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary ($)</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Financial Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {formData.id ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Employee Details</h3>
              <button onClick={() => setViewEmployee(null)} className="text-gray-400 hover:text-gray-500">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-semibold mb-4">
                      {viewEmployee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h4 className="text-xl font-medium text-gray-900">{viewEmployee.name}</h4>
                    <p className="text-gray-500">{viewEmployee.position}</p>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          viewEmployee.status === "active"
                            ? "bg-green-100 text-green-800"
                            : viewEmployee.status === "on_leave"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {viewEmployee.status === "active"
                          ? "Active"
                          : viewEmployee.status === "on_leave"
                            ? "On Leave"
                            : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 md:border-l md:pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">{viewEmployee.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{viewEmployee.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="text-sm text-gray-900">{viewEmployee.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                          <p className="text-sm text-gray-900">{viewEmployee.emergencyContact}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-gray-700 mb-4">Employment Information</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Department</p>
                          <p className="text-sm text-gray-900">{viewEmployee.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Join Date</p>
                          <p className="text-sm text-gray-900">{viewEmployee.joinDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Salary</p>
                          <p className="text-sm text-gray-900">${viewEmployee.salary.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tax ID</p>
                          <p className="text-sm text-gray-900">{viewEmployee.taxId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Bank Account</p>
                          <p className="text-sm text-gray-900">{viewEmployee.bankAccount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setViewEmployee(null)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(viewEmployee)
                    setViewEmployee(null)
                  }}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    First_Name: '',          // varchar(50), NOT NULL
    Last_Name: '',          // varchar(50), NOT NULL
    DOB: '',                // date, NOT NULL
    Address: '',            // text, NULL
    Contact: '',            // varchar(20), NULL
    Email: '',              // varchar(100), NOT NULL, UNIQUE
    Job_Title: '',          // varchar(100), NOT NULL
    Department_ID: '',      // int, NOT NULL
    Date_Joined: new Date().toISOString().split('T')[0],  // date, NOT NULL
    Performance_Rating: '', // decimal(3,2), NULL
    Bank_Account_Number: '', // varchar(50), NULL
    IFSC_Code: '',         // varchar(20), NULL
    Password: '',          // varchar(255), NOT NULL
    Leave_Balance: 20,     // int, DEFAULT 20
    Basic_Salary: '',      // decimal(10,2), NOT NULL, DEFAULT 0.00
    dependents: []         // Array for dependent information
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDependentChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.map((dependent, i) => 
        i === index ? { ...dependent, [field]: value } : dependent
      )
    }));
  };

  const addDependent = () => {
    setFormData(prev => ({
      ...prev,
      dependents: [
        ...prev.dependents,
        {
          Name: '',           // varchar(100), NOT NULL
          Relationship: '',   // varchar(50), NOT NULL
          DOB: '',           // date, NULL
          Gender: '',        // enum('M','F','Other'), NULL
          Contact: ''        // varchar(20), NULL
        }
      ]
    }));
  };

  const removeDependent = (index) => {
    if (formData.dependents.length > 1) {
      setFormData(prev => ({
        ...prev,
        dependents: prev.dependents.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/employees', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Employee</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="First_Name"
              value={formData.First_Name}
              onChange={handleChange}
              required
              maxLength={50}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="Last_Name"
              value={formData.Last_Name}
              onChange={handleChange}
              required
              maxLength={50}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              maxLength={100}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact</label>
            <input
              type="tel"
              name="Contact"
              value={formData.Contact}
              onChange={handleChange}
              maxLength={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title *</label>
            <input
              type="text"
              name="Job_Title"
              value={formData.Job_Title}
              onChange={handleChange}
              required
              maxLength={100}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department *</label>
            <select
              name="Department_ID"
              value={formData.Department_ID}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.Department_ID} value={dept.Department_ID}>
                  {dept.Department_Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date Joined *</label>
            <input
              type="date"
              name="Date_Joined"
              value={formData.Date_Joined}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
            <input
              type="text"
              name="Bank_Account_Number"
              value={formData.Bank_Account_Number}
              onChange={handleChange}
              maxLength={50}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
            <input
              type="text"
              name="IFSC_Code"
              value={formData.IFSC_Code}
              onChange={handleChange}
              maxLength={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              maxLength={255}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Basic Salary *</label>
            <input
              type="number"
              name="Basic_Salary"
              value={formData.Basic_Salary}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dependents section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Dependents</h2>
          <button
            type="button"
            onClick={addDependent}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Dependent
          </button>

          {formData.dependents.map((dependent, index) => (
            <div key={index} className="border p-4 mb-4 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={dependent.Name}
                    onChange={(e) => handleDependentChange(index, 'Name', e.target.value)}
                    required
                    maxLength={100}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship *</label>
                  <select
                    value={dependent.Relationship}
                    onChange={(e) => handleDependentChange(index, 'Relationship', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    onChange={(e) => handleDependentChange(index, 'DOB', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={dependent.Gender}
                    onChange={(e) => handleDependentChange(index, 'Gender', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    onChange={(e) => handleDependentChange(index, 'Contact', e.target.value)}
                    maxLength={20}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newDependents = [...formData.dependents];
                    newDependents.splice(index, 1);
                    setFormData({ ...formData, dependents: newDependents });
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-4">
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Calendar, Users } from 'lucide-react';
import EmployeeNavbar from '../components/EmployeeNavbar';
import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeDependents = () => {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDependents = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
        const employeeId = employeeUser.id;

        if (!token || !employeeId) {
          setError('Employee session not found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}/dependents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setDependents(response.data);
        } else {
          setError('No dependents found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchDependents:', err);
        setError('Failed to fetch dependents data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDependents();
  }, []);

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EmployeeSidebar />
        <div className="flex-1 ml-64">
          <EmployeeNavbar />
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar />
      <div className="flex-1 ml-64">
        <EmployeeNavbar />
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dependents</h1>
            <p className="text-gray-600 mt-2">
              View and manage information about your dependents
            </p>
          </div>

          {/* Dependents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dependents.length > 0 ? (
              dependents.map((dependent) => (
                <div key={dependent.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {dependent.Relationship}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {dependent.First_Name} {dependent.Last_Name}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                        <p className="text-gray-800">{formatDate(dependent.DOB)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gender</p>
                        <p className="text-gray-800">{dependent.Gender}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact</p>
                        <p className="text-gray-800">{dependent.Contact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No dependents found. Please add your dependents.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDependents; 
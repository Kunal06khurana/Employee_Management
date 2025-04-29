import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, Clock, LogOut } from 'lucide-react';

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
  
  const isActivePath = (path) => {
    return location.pathname === path;
  };
  
  const getLinkClass = (path) => {
    return isActivePath(path)
      ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeUser');
    navigate('/home'); // Redirect to home page instead of employee login page
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">EMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/employee/dashboard"
                className={getLinkClass("/employee/dashboard")}
              >
                <Home className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/employee/leave"
                className={getLinkClass("/employee/leave")}
              >
                <Calendar className="h-5 w-5 mr-1" />
                Leave
              </Link>
              <Link
                to="/employee/payslip"
                className={getLinkClass("/employee/payslip")}
              >
                <FileText className="h-5 w-5 mr-1" />
                Payslip
              </Link>
              <Link
                to="/employee/attendance"
                className={getLinkClass("/employee/attendance")}
              >
                <Clock className="h-5 w-5 mr-1" />
                Attendance
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;
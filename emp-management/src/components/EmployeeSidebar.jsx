import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, Clock, Users, User } from 'lucide-react';

const EmployeeSidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/employee/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/employee/payslip', icon: <FileText size={20} />, label: 'Payslip' },
    { path: '/employee/leave', icon: <Calendar size={20} />, label: 'Leave' },
    { path: '/employee/attendance', icon: <Clock size={20} />, label: 'Attendance' },
    { path: '/employee/dependents', icon: <Users size={20} />, label: 'Dependents' },
    { path: '/employee/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="bg-white shadow-md h-full w-64 fixed left-0 top-0 pt-16">
      <div className="py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeSidebar; 
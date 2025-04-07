import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employee Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your login type
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <User className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
            </span>
            Admin Login
          </Link>
          
          <Link
            to="/employee/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Users className="h-5 w-5 text-green-500 group-hover:text-green-400" />
            </span>
            Employee Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 
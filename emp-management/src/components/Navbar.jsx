import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, User, DollarSign, FileText, Home, LogIn } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Employees', path: '/employees', icon: <User className="w-5 h-5" /> },
    { name: 'Salary Management', path: '/salary', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Login', path: '/login', icon: <LogIn className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">EmpSalary</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'bg-indigo-900 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2'
                        : 'text-gray-200 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2'
                    }
                  >
                    {link.icon}
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-indigo-800 inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-indigo-600 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? 'bg-indigo-900 text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2'
                  : 'text-gray-200 hover:bg-indigo-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2'
              }
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

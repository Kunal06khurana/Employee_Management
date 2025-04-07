import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';  
import Employees from './pages/employees';
import AddEmployee from './pages/AddEmployee';
import Salary from './pages/Salary';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeDependents from './pages/EmployeeDependents';
import EmployeeLeave from './pages/EmployeeLeave';
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute';
import EmployeeNavbar from './components/EmployeeNavbar';
import EmployeeSidebar from './components/EmployeeSidebar';
import Home from './pages/Home';
import './App.css';

// Placeholder components for employee pages
const EmployeePayslip = () => (
  <div className="flex h-screen bg-gray-50">
    <EmployeeSidebar />
    <div className="flex-1 ml-64">
      <EmployeeNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payslip</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Payslip content will be displayed here.</p>
        </div>
      </div>
    </div>
  </div>
);

const EmployeeAttendance = () => (
  <div className="flex h-screen bg-gray-50">
    <EmployeeSidebar />
    <div className="flex-1 ml-64">
      <EmployeeNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Attendance content will be displayed here.</p>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Landing Page */}
          <Route path="/home" element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Employees />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/add"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <AddEmployee />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/salary"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Salary />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Reports />
                </>
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          
          <Route
            path="/employee/dashboard"
            element={
              <EmployeeProtectedRoute>
                <EmployeeDashboard />
              </EmployeeProtectedRoute>
            }
          />

          <Route
            path="/employee/payslip"
            element={
              <EmployeeProtectedRoute>
                <EmployeePayslip />
              </EmployeeProtectedRoute>
            }
          />

          <Route
            path="/employee/leave"
            element={
              <EmployeeProtectedRoute>
                <EmployeeLeave />
              </EmployeeProtectedRoute>
            }
          />

          <Route
            path="/employee/attendance"
            element={
              <EmployeeProtectedRoute>
                <EmployeeAttendance />
              </EmployeeProtectedRoute>
            }
          />

          <Route
            path="/employee/dependents"
            element={
              <EmployeeProtectedRoute>
                <EmployeeDependents />
              </EmployeeProtectedRoute>
            }
          />

          <Route
            path="/employee/profile"
            element={
              <EmployeeProtectedRoute>
                <EmployeeProfile />
              </EmployeeProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


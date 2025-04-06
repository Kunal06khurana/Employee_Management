import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Salary from './pages/Salary';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
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

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


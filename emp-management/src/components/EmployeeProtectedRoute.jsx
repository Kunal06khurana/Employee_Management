import { Navigate, useLocation } from 'react-router-dom';

const EmployeeProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('employeeToken');
  const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');

  if (!token) {
    // Redirect to employee login page but save the attempted url
    return <Navigate to="/employee/login" state={{ from: location }} replace />;
  }

  return children;
}

export default EmployeeProtectedRoute; 
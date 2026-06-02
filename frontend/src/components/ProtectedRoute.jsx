import { Navigate, Outlet } from 'react-router-dom';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token expired
    }
    return true;
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

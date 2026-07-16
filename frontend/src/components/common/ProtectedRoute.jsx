import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

// ✅ Role-based route protection
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user?.role)) {
    // ✅ Redirect based on role
    const role = user?.role || 'employee';
    const position = user?.position || '';
    
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === 'delivery') {
      return <Navigate to="/delivery-dashboard" replace />;
    }
    if (role === 'employee') {
      if (position === 'washer') {
        return <Navigate to="/washer-dashboard" replace />;
      }
      if (position === 'ironer') {
        return <Navigate to="/ironer-dashboard" replace />;
      }
      if (position === 'packer') {
        return <Navigate to="/packer-dashboard" replace />;
      }
      return <Navigate to="/washer-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
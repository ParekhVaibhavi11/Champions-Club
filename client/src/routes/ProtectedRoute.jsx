import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-champion-grey">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champion-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective primary route
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'front_desk') return <Navigate to="/desk/calendar" replace />;
    if (user?.role === 'staff') return <Navigate to="/staff/shop-pos" replace />;
    if (user?.role === 'member') return <Navigate to="/member/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

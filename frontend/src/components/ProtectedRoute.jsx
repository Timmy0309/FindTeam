import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';

function ProtectedRoute({ children, requiredRights = [] }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRights = useSelector((state) => state.auth.rights);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRights.length > 0) {
    const hasRequiredRights = requiredRights.every(right => 
      userRights.includes(right)
    );
    
    if (!hasRequiredRights) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}

export default ProtectedRoute;
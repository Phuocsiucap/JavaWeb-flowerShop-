import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AdminContext  from '../../contexts/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const  {adminToken}  = useContext(AdminContext);
  
  if (!adminToken) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
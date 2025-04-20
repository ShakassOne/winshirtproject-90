
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Admin main page that redirects to dashboard
 */
const AdminPage: React.FC = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPage;

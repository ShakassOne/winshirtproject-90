
import React from 'react';
import AdminNavigation from './admin/AdminNavigation';

// Cette composant est un wrapper pour AdminNavigation
// avec potentiellement d'autres fonctionnalités de navigation admin
const AdminNavigationHandler: React.FC = () => {
  return <AdminNavigation />;
};

export default AdminNavigationHandler;


import React from 'react';
import AdminNavigation from './admin/AdminNavigation';

// Ce composant est un wrapper pour AdminNavigation
// avec potentiellement d'autres fonctionnalités de navigation admin
const AdminNavigationHandler: React.FC = () => {
  return (
    <div className="z-50 relative">
      <AdminNavigation />
    </div>
  );
};

export default AdminNavigationHandler;

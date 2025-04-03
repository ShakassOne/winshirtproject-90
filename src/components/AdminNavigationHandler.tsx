
import React from 'react';
import AdminNavigation from './admin/AdminNavigation';

/**
 * Ce composant est un wrapper pour AdminNavigation
 * avec une gestion spécifique du z-index pour assurer
 * que la navigation admin est toujours visible
 */
const AdminNavigationHandler: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <AdminNavigation />
    </div>
  );
};

export default AdminNavigationHandler;

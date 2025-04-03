
import React from 'react';
import AdminNavigation from './admin/AdminNavigation';

/**
 * Ce composant est un wrapper pour AdminNavigation
 * avec une gestion spécifique du z-index pour assurer
 * que la navigation admin est toujours visible
 * mais ne bloque pas les interactions avec d'autres composants
 */
const AdminNavigationHandler: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="pointer-events-auto">
        <AdminNavigation />
      </div>
    </div>
  );
};

export default AdminNavigationHandler;

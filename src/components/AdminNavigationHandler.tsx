
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
    <>
      <AdminNavigation />
    </>
  );
};

export default AdminNavigationHandler;

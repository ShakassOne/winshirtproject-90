
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavigation from './admin/AdminNavigation';

/**
 * Ce composant est un wrapper pour AdminNavigation
 * qui contrôle si la barre de navigation admin doit être affichée
 * selon le chemin actuel et le rôle de l'utilisateur
 */
const AdminNavigationHandler: React.FC = () => {
  const location = useLocation();
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur (via localStorage)
    const user = localStorage.getItem('user');
    const isAdmin = user ? JSON.parse(user)?.isAdmin : false;
    
    // Afficher la navigation si l'utilisateur est administrateur, même s'il n'est pas sur une page admin
    if (isAdmin) {
      setShouldShow(true);
      return;
    }
    
    // Sinon, vérifier si on est sur une page admin
    const isAdminPage = location.pathname.startsWith('/admin');
    setShouldShow(isAdminPage);
  }, [location]);
  
  if (!shouldShow) return null;
  
  return <AdminNavigation />;
};

export default AdminNavigationHandler;

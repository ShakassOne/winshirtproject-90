
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
    let isAdmin = false;
    
    try {
      const userData = user ? JSON.parse(user) : null;
      isAdmin = userData?.isAdmin === true;
    } catch (e) {
      console.error("Erreur lors de la lecture des données utilisateur:", e);
    }
    
    // Vérifier si on est sur une page admin
    const isAdminPage = location.pathname.startsWith('/admin');
    
    // Afficher la navigation si l'utilisateur est administrateur, 
    // ou si on est sur une page admin
    setShouldShow(isAdmin || isAdminPage);
  }, [location]);
  
  // Si on ne doit pas afficher la navigation, retourner null
  if (!shouldShow) return null;
  
  // Ajout d'un élément wrapper pour s'assurer que le style fixed bottom fonctionne correctement
  return <AdminNavigation />;
};

export default AdminNavigationHandler;

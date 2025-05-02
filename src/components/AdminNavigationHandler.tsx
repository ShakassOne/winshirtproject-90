
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavigation from './admin/AdminNavigation';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavigationHandlerProps {
  children: React.ReactNode;
}

/**
 * Ce composant est un wrapper pour AdminNavigation
 * qui contrôle si la barre de navigation admin doit être affichée
 * selon le chemin actuel et le rôle de l'utilisateur
 */
const AdminNavigationHandler: React.FC<AdminNavigationHandlerProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    // Vérifier si le chemin est un chemin admin
    const isAdminPath = location.pathname.includes('/admin');
    
    // Protection stricte des chemins admin
    if (isAdminPath && !isLoading) {
      if (!isAuthenticated) {
        // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
        toast.error("Authentication requise pour accéder à l'administration");
        navigate('/login', { state: { from: location.pathname } });
        setShouldShow(false);
        return;
      } else if (!isAdmin) {
        // Si l'utilisateur est connecté mais n'est pas admin, rediriger vers la page d'accueil
        toast.error("Vous n'avez pas les permissions nécessaires pour accéder à l'administration");
        navigate('/', { replace: true });
        setShouldShow(false);
        return;
      }
    }
    
    // Montrer le menu admin uniquement si utilisateur est admin ET sur un chemin admin
    setShouldShow(isAuthenticated && isAdmin && isAdminPath);
  }, [location.pathname, isAuthenticated, isAdmin, navigate, isLoading]);
  
  // Ne rien rendre pendant le chargement pour éviter des flashs d'interface
  if (isLoading) return null;
  
  return (
    <>
      {shouldShow && <AdminNavigation />}
      {children}
    </>
  );
};

export default AdminNavigationHandler;

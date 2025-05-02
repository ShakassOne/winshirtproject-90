
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavigation from './admin/AdminNavigation';
import { supabase } from '@/integrations/supabase/client';
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
  const { isAuthenticated, isAdmin } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier si le chemin est un chemin admin
        const isAdminPath = location.pathname.includes('/admin');
        
        // Protection stricte des chemins admin
        if (isAdminPath) {
          if (!isAuthenticated) {
            // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
            toast.error("Authentication requise pour accéder à l'administration");
            navigate('/login', { replace: true });
            setShouldShow(false);
            setIsLoading(false);
            return;
          } else if (!isAdmin) {
            // Si l'utilisateur est connecté mais n'est pas admin, rediriger vers la page d'accueil
            toast.error("Vous n'avez pas les permissions nécessaires pour accéder à l'administration");
            navigate('/', { replace: true });
            setShouldShow(false);
            setIsLoading(false);
            return;
          }
        }
        
        // Montrer le menu admin uniquement si utilisateur est admin ET sur un chemin admin
        const showMenu = isAuthenticated && isAdmin && isAdminPath;
        setShouldShow(showMenu);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsLoading(false);
        setShouldShow(false);
      }
    };
    
    checkAdminStatus();
  }, [location.pathname, isAuthenticated, isAdmin, navigate]);
  
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

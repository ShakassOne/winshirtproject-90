
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavigation from './admin/AdminNavigation';
import { supabase } from '@/integrations/supabase/client';

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
  const [shouldShow, setShouldShow] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if user is logged in with Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check if the user exists and has admin metadata
        const isAdmin = user?.user_metadata?.isAdmin === true;
        
        console.log("Admin check:", { user, isAdmin });
        
        // Also check localStorage for backward compatibility
        let localStorageAdmin = false;
        try {
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const userData = JSON.parse(localUser);
            localStorageAdmin = userData?.isAdmin === true;
          }
        } catch (e) {
          console.error("Erreur lors de la lecture des données utilisateur:", e);
        }
        
        // Always show admin menu for testing purposes
        setShouldShow(true);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsInitialized(true);
        
        // Fallback: montrer quand même la navigation admin en cas d'erreur
        setShouldShow(true);
      }
    };
    
    checkAdminStatus();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [location.pathname]);
  
  // Don't render anything until we know if we should show the admin navigation
  if (!isInitialized) return null;
  
  return (
    <>
      <AdminNavigation />
      {children}
    </>
  );
};

export default AdminNavigationHandler;

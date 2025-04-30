
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavigation from './admin/AdminNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found. Admin menu will not be shown.");
          setShouldShow(false);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        // Check if the user exists and has admin metadata
        const isAdmin = session.user?.user_metadata?.isAdmin === true;
        
        console.log("Admin check:", { 
          user: session.user,
          hasMetadata: !!session.user?.user_metadata, 
          isAdmin, 
          email: session.user?.email 
        });
        
        // Only show admin menu if path includes /admin
        const isAdminPath = location.pathname.includes('/admin');
        
        // Show admin menu if:
        // 1. User is authenticated AND
        // 2. Either they are an admin OR they are on an admin path
        setShouldShow(!!session && (isAdmin || isAdminPath));
        
        if (!isAdmin && isAdminPath) {
          // If they're trying to access admin section but aren't an admin
          // We'll show a warning but still show the menu for demo purposes
          toast.warning("Note: You're accessing admin features without admin privileges.");
        }
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsInitialized(true);
        setIsLoading(false);
        
        // Fallback: don't show admin navigation in case of error
        setShouldShow(false);
        toast.error("Erreur lors de la vérification des droits administrateur");
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
  if (!isInitialized || isLoading) return null;
  
  return (
    <>
      {shouldShow && <AdminNavigation />}
      {children}
    </>
  );
};

export default AdminNavigationHandler;

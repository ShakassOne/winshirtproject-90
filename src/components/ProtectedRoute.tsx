
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Vérification stricte des droits d'administration
  useEffect(() => {
    if (adminOnly && !isAdmin && isAuthenticated) {
      // L'utilisateur est connecté mais n'est pas admin
      toast.error("Vous n'avez pas les droits d'administration nécessaires");
    }
  }, [adminOnly, isAdmin, isAuthenticated]);

  // Redirection si non authentifié
  if (!isAuthenticated) {
    console.log("Accès refusé: utilisateur non authentifié");
    toast.error("Vous devez être connecté pour accéder à cette page");
    return <Navigate to="/login" replace />;
  }

  // Vérification stricte des droits d'administration
  if (adminOnly && !isAdmin) {
    console.log("Accès refusé: droits d'administration requis");
    toast.error("Vous n'avez pas les permissions nécessaires pour accéder à cette page");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

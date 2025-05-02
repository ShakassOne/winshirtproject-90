
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  // Vérification stricte des droits d'administration
  useEffect(() => {
    if (!isLoading && adminOnly && !isAdmin && isAuthenticated) {
      // L'utilisateur est connecté mais n'est pas admin
      toast.error("Vous n'avez pas les droits d'administration nécessaires");
    }
  }, [adminOnly, isAdmin, isAuthenticated, isLoading]);

  // Afficher un état de chargement pendant la vérification d'authentification
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-winshirt-purple"></div>
    </div>;
  }

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

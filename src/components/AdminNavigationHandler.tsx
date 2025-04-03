
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminNavigationHandler: React.FC = () => {
  const { isAdmin } = useAuth();
  
  // Afficher le menu admin uniquement si l'utilisateur est admin
  // Ce composant est maintenant ajouté globalement dans App.tsx
  return isAdmin ? <AdminNavigation /> : null;
};

export default AdminNavigationHandler;

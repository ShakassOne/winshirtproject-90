
import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminCommandesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des commandes</h1>
      </div>
      
      <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
        <p>La gestion des commandes est en cours d'implémentation.</p>
        <p className="text-gray-400 mt-2">Cette section vous permettra de gérer les commandes des clients.</p>
      </div>
      
      <AdminNavigation />
    </div>
  );
};

export default AdminCommandesPage;


import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminSettingsPage: React.FC = () => {
  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paramètres admin</h1>
      </div>
      
      <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
        <p>Page disponible prochainement.</p>
        <p className="text-gray-400 mt-2">Cette section vous permettra de gérer les paramètres de l'application.</p>
      </div>
      
      <AdminNavigation />
    </div>
  );
};

export default AdminSettingsPage;

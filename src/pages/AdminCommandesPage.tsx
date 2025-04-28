
import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StarBackground from '@/components/StarBackground';

const AdminOrdersPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="winshirt-card p-8">
            <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
              Gestion des Commandes
            </h1>
            
            <div className="text-center py-8">
              <p className="text-gray-300">
                Cette section vous permet de gérer toutes les commandes passées sur votre site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrdersPage;

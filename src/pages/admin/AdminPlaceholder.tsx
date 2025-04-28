
import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StarBackground from '@/components/StarBackground';

const AdminPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="winshirt-card p-8">
            <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
              Administration
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Loteries</h2>
                <p className="text-gray-300 mb-4">Gérez vos loteries, tirez les gagnants et créez de nouveaux événements.</p>
                <a href="/admin/lotteries" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
              
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Produits</h2>
                <p className="text-gray-300 mb-4">Ajoutez, modifiez ou supprimez des produits dans votre catalogue.</p>
                <a href="/admin/products" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
              
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Visuels</h2>
                <p className="text-gray-300 mb-4">Gérez les designs et visuels disponibles pour les produits personnalisables.</p>
                <a href="/admin/visuals" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
              
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Commandes</h2>
                <p className="text-gray-300 mb-4">Suivez et gérez toutes les commandes passées sur votre boutique.</p>
                <a href="/admin/orders" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
              
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Clients</h2>
                <p className="text-gray-300 mb-4">Consultez les informations et l'historique de vos clients.</p>
                <a href="/admin/clients" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
              
              <div className="winshirt-card bg-winshirt-space-light/30 p-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-winshirt-purple-light">Synchronisation</h2>
                <p className="text-gray-300 mb-4">Synchronisez vos données avec la base de données Supabase.</p>
                <a href="/admin/sync" className="text-winshirt-blue hover:text-winshirt-blue-light">Accéder →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;

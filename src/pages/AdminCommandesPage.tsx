
import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Calendar, Package } from 'lucide-react';

const AdminCommandesPage: React.FC = () => {
  return (
    <div className="container mx-auto pt-28 pb-20 px-4">
      <div className="w-full max-w-none space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des commandes</h1>
        </div>
        
        <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-6 w-6 text-winshirt-purple" />
            <h2 className="text-xl font-semibold">Module de commandes</h2>
          </div>
          <p>La gestion des commandes est en cours d'implémentation.</p>
          <p className="text-gray-400 mt-2">Cette section vous permettra de suivre, gérer et traiter les commandes des clients.</p>
          
          <div className="mt-6 p-4 border border-winshirt-purple/20 rounded-lg bg-winshirt-space-light/30">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-winshirt-blue" />
              Fonctionnalités à venir
            </h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>Tableau de bord des commandes en temps réel</li>
              <li>Gestion des statuts de livraison</li>
              <li>Génération de factures</li>
              <li>Historique des commandes</li>
              <li>Statistiques de vente</li>
            </ul>
          </div>
        </div>
      </div>
      
      <AdminNavigation />
    </div>
  );
};

export default AdminCommandesPage;

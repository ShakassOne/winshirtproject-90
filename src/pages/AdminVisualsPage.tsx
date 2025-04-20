
import React from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Image, Palette } from 'lucide-react';

const AdminVisualsPage: React.FC = () => {
  return (
    <div className="container mx-auto pt-28 pb-20 px-4">
      <div className="w-full max-w-none space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des visuels</h1>
        </div>
        
        <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-6 w-6 text-winshirt-purple" />
            <h2 className="text-xl font-semibold">Module de gestion des visuels</h2>
          </div>
          <p>Cette fonctionnalité est en cours d'implémentation.</p>
          <p className="text-gray-400 mt-2">Cette section vous permettra de gérer les visuels disponibles pour les produits personnalisables.</p>
          
          <div className="mt-6 p-4 border border-winshirt-purple/20 rounded-lg bg-winshirt-space-light/30">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Image className="h-5 w-5 mr-2 text-winshirt-blue" />
              Fonctionnalités à venir
            </h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>Bibliothèque de visuels</li>
              <li>Importation de nouveaux designs</li>
              <li>Catégorisation des visuels</li>
              <li>Positionnement sur les produits</li>
              <li>Gestion des droits d'auteur</li>
            </ul>
          </div>
        </div>
      </div>
      
      <AdminNavigation />
    </div>
  );
};

export default AdminVisualsPage;

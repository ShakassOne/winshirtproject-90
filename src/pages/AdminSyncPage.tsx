import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { syncProductsToSupabase } from '@/services/productService';
import { syncClientsToSupabase } from '@/services/clientService';
import { useLotteries } from '@/services/lotteryService';
import { syncOrdersToSupabase } from '@/services/orderService';
import { syncVisualCategoriesToSupabase } from '@/api/visualApi';
import { checkSupabaseConnection } from '@/lib/supabase';
import AdminSetup from '@/components/AdminSetup';

const AdminSyncPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { lotteries } = useLotteries();

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    
    checkConnection();
  }, []);

  const handleSyncProducts = async () => {
    try {
      const success = await syncProductsToSupabase();
      if (success) {
        toast.success("Produits synchronisés avec succès");
      } else {
        toast.error("Erreur lors de la synchronisation des produits");
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      toast.error("Erreur lors de la synchronisation des produits");
    }
  };

  const handleSyncClients = async () => {
    try {
      const success = await syncClientsToSupabase();
      if (success) {
        toast.success("Clients synchronisés avec succès");
      } else {
        toast.error("Erreur lors de la synchronisation des clients");
      }
    } catch (error) {
      console.error("Error syncing clients:", error);
      toast.error("Erreur lors de la synchronisation des clients");
    }
  };

  const handleSyncOrders = async () => {
    try {
      const success = await syncOrdersToSupabase();
      if (success) {
        toast.success("Commandes synchronisées avec succès");
      } else {
        toast.error("Erreur lors de la synchronisation des commandes");
      }
    } catch (error) {
      console.error("Error syncing orders:", error);
      toast.error("Erreur lors de la synchronisation des commandes");
    }
  };

  const handleSyncLotteries = async () => {
    try {
      // Implement lottery sync
      toast.info("Synchronisation des loteries non implémentée");
    } catch (error) {
      console.error("Error syncing lotteries:", error);
      toast.error("Erreur lors de la synchronisation des loteries");
    }
  };

  const handleSyncVisualCategories = async () => {
    try {
      const success = await syncVisualCategoriesToSupabase();
      if (success) {
        toast.success("Catégories visuelles synchronisées avec succès");
      } else {
        toast.error("Erreur lors de la synchronisation des catégories visuelles");
      }
    } catch (error) {
      console.error("Error syncing visual categories:", error);
      toast.error("Erreur lors de la synchronisation des catégories visuelles");
    }
  };

  const handleSyncAll = async () => {
    try {
      toast.info("Début de la synchronisation complète...");
      
      // Sync in sequence to avoid race conditions
      await handleSyncProducts();
      await handleSyncClients();
      await handleSyncOrders();
      await handleSyncLotteries();
      await handleSyncVisualCategories();
      
      toast.success("Synchronisation complète terminée");
    } catch (error) {
      console.error("Error in complete sync:", error);
      toast.error("Erreur lors de la synchronisation complète");
    }
  };
  
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Synchronisation avec Supabase
          </h1>
          
          {/* Admin Setup Component for creating/configuring admin user */}
          <AdminSetup />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h2 className="text-xl font-semibold mb-4 text-white">État de la connexion</h2>
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white">{isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase'}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {isConnected 
                  ? 'Vous pouvez synchroniser vos données avec Supabase.' 
                  : 'Vérifiez votre connexion internet et les paramètres de Supabase.'}
              </p>
              <button 
                onClick={handleSyncAll}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser toutes les données
              </button>
            </div>
            
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h2 className="text-xl font-semibold mb-4 text-white">Statistiques locales</h2>
              <ul className="space-y-2 text-white">
                <li className="flex justify-between">
                  <span>Produits:</span>
                  <span className="font-semibold">0</span>
                </li>
                <li className="flex justify-between">
                  <span>Clients:</span>
                  <span className="font-semibold">0</span>
                </li>
                <li className="flex justify-between">
                  <span>Commandes:</span>
                  <span className="font-semibold">0</span>
                </li>
                <li className="flex justify-between">
                  <span>Loteries:</span>
                  <span className="font-semibold">{lotteries?.length || 0}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Produits</h3>
              <p className="text-gray-400 text-sm mb-4">
                Synchronisez les produits entre le stockage local et Supabase.
              </p>
              <button 
                onClick={handleSyncProducts}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser les produits
              </button>
            </div>
            
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Clients</h3>
              <p className="text-gray-400 text-sm mb-4">
                Synchronisez les données clients entre le stockage local et Supabase.
              </p>
              <button 
                onClick={handleSyncClients}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser les clients
              </button>
            </div>
            
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Commandes</h3>
              <p className="text-gray-400 text-sm mb-4">
                Synchronisez les commandes entre le stockage local et Supabase.
              </p>
              <button 
                onClick={handleSyncOrders}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser les commandes
              </button>
            </div>
            
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Loteries</h3>
              <p className="text-gray-400 text-sm mb-4">
                Synchronisez les loteries entre le stockage local et Supabase.
              </p>
              <button 
                onClick={handleSyncLotteries}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser les loteries
              </button>
            </div>
            
            <div className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Catégories visuelles</h3>
              <p className="text-gray-400 text-sm mb-4">
                Synchronisez les catégories visuelles entre le stockage local et Supabase.
              </p>
              <button 
                onClick={handleSyncVisualCategories}
                disabled={!isConnected}
                className="w-full py-2 px-4 bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Synchroniser les catégories
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminSyncPage;

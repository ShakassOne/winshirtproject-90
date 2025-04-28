
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LotteriesPage from './pages/LotteriesPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import { toast } from './lib/toast';
import { testSupabaseConnection } from './api/lotteryApi';
import { initializeSupabase } from './api/setupSupabase';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
import AdminCommandesPage from './pages/AdminCommandesPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function App() {
  // Effet pour initialiser Supabase au démarrage de l'application
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Vérifier d'abord la connexion à Supabase
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          toast.success("Connexion à Supabase établie", { position: "bottom-right" });
          
          // Initialiser les politiques RLS et autres configurations
          const initialized = await initializeSupabase();
          
          if (initialized) {
            toast.success("Configuration Supabase initialisée avec succès", { position: "bottom-right" });
            
            // Create helper functions for RLS policies
            try {
              const { error: fnError } = await createRlsHelperFunctions();
              if (fnError) {
                console.log("Les fonctions RLS existent peut-être déjà:", fnError);
              }
            } catch (err) {
              console.error("Erreur lors de la création des fonctions helper RLS:", err);
            }
          } else {
            toast.warning("Configuration Supabase partielle - certaines fonctionnalités pourraient ne pas fonctionner", { 
              position: "bottom-right" 
            });
          }
        } else {
          toast.warning("Mode hors-ligne actif - les données seront stockées localement", { 
            position: "bottom-right" 
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application:", error);
        toast.error("Erreur d'initialisation de l'application", { 
          description: "Certaines fonctionnalités pourraient ne pas fonctionner correctement", 
          position: "bottom-right" 
        });
      }
    };
    
    setupApp();
  }, []);
  
  // Helper function to create RLS helper functions in the database
  const createRlsHelperFunctions = async () => {
    const { error } = await supabase.rpc('create_rls_helper_functions');
    return { error };
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lotteries" element={<LotteriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* Routes d'administration */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/lotteries" element={<AdminLotteriesPage />} />
          <Route path="/admin/visuals" element={<AdminVisualsPage />} />
          <Route path="/admin/commandes" element={<AdminCommandesPage />} />
          <Route path="/admin/clients" element={<AdminClientsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;

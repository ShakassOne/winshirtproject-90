
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LotteriesPage from './pages/LotteriesPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import { toast } from './lib/toast';
import { testSupabaseConnection } from './api/lotteryApi';
import { initializeSupabase } from './api/setupSupabase';

// Ajoutez vos autres importations de pages ici

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
  
  return (
    <div>
      <Routes>
        <Route path="/" element={<LotteriesPage />} />
        <Route path="/lotteries" element={<LotteriesPage />} />
        <Route path="/admin/lotteries" element={<AdminLotteriesPage />} />
        {/* Ajoutez vos autres routes ici */}
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

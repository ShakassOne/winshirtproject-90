
import React, { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection, ensureDatabaseSchema } from '@/lib/supabase';

interface SupabaseInitializerProps {
  children: React.ReactNode;
}

const SupabaseInitializer: React.FC<SupabaseInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSupabase = async () => {
      setIsLoading(true);
      try {
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          console.log("Connexion Supabase établie, initialisation du schéma...");
          const schemaFixed = await ensureDatabaseSchema();
          
          if (schemaFixed) {
            console.log("Schéma de base de données vérifié et mis à jour");
            toast.success("Connexion à la base de données établie", { position: "bottom-right" });
          }
        } else {
          console.log("Mode hors-ligne: utilisation du stockage local");
          toast.info("Mode hors-ligne: utilisation du stockage local", { position: "bottom-right" });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        toast.error("Problème de connexion à la base de données", { position: "bottom-right" });
        setIsInitialized(true); // Continue anyway in offline mode
      } finally {
        setIsLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-winshirt-space">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-winshirt-purple mx-auto mb-4"></div>
          <p className="text-white">Connexion à la base de données...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SupabaseInitializer;


import React, { useEffect, useState } from 'react';
import DynamicBackground from '@/components/backgrounds/DynamicBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import SyncSettingsManager from '@/components/admin/settings/SyncSettingsManager';
import FtpSettingsManager from '@/components/admin/settings/FtpSettingsManager';
import HomeIntroManager from '@/components/admin/settings/HomeIntroManager';
import SyncDebugTool from '@/components/admin/settings/SyncDebugTool';
import PageBackgroundsManager from '@/components/admin/settings/PageBackgroundsManager';
import { checkSupabaseConnection, forceSupabaseConnection } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSettingsPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);

  // Check connection when page loads
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const connected = await checkSupabaseConnection();
        setIsConnected(connected);
        
        // Save connection state in localStorage for consistency across components
        localStorage.setItem('supabase_connected', connected ? 'true' : 'false');
        
        if (connected) {
          toast.success("Connexion à Supabase établie", { position: "bottom-right" });
        } else {
          toast.warning("Non connecté à Supabase. Veuillez établir la connexion.", { position: "bottom-right" });
          setError("La connexion à Supabase n'est pas établie. Cliquez sur 'Établir la connexion'.");
        }
      } catch (e) {
        console.error("Erreur lors de la vérification de la connexion:", e);
        setError(`Erreur: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
        toast.error("Erreur lors de la vérification de la connexion", { position: "bottom-right" });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    // Listen for background updates to force re-render
    const handleBackgroundsUpdated = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    
    window.addEventListener('backgroundsUpdated', handleBackgroundsUpdated);
    
    return () => {
      window.removeEventListener('backgroundsUpdated', handleBackgroundsUpdated);
    };
  }, []);

  const handleForceConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await forceSupabaseConnection();
      setIsConnected(success);
      
      if (success) {
        toast.success("Connexion à Supabase établie avec succès!", { position: "bottom-right" });
        setError(null);
      } else {
        setError("Impossible d'établir une connexion à Supabase");
        toast.error("Échec de la connexion à Supabase", { position: "bottom-right" });
      }
    } catch (e) {
      console.error("Erreur lors de la tentative de connexion:", e);
      setError(`Erreur: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      toast.error("Erreur lors de la tentative de connexion", { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (autoSync: boolean, syncInterval: number) => {
    // Handle settings changes if needed
    console.log("Settings changed:", { autoSync, syncInterval });
  };

  return (
    <>
      <DynamicBackground key={`background-${updateTrigger}`} />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-bold mb-8 text-white text-center">
            Paramètres de l'application
          </h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                {error}
                <Button 
                  onClick={handleForceConnection} 
                  variant="outline" 
                  className="self-start mt-2"
                  size="sm"
                  disabled={isLoading}
                >
                  Établir la connexion
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <SyncDebugTool />
          
          <Tabs defaultValue="general" className="winshirt-card p-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Home Intro</TabsTrigger>
              <TabsTrigger value="backgrounds">Arrière-plans</TabsTrigger>
              <TabsTrigger value="sync">Synchronisation</TabsTrigger>
              <TabsTrigger value="ftp">FTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <GeneralSettings />
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6">
              <HomeIntroManager />
            </TabsContent>
            
            <TabsContent value="backgrounds" className="space-y-6">
              <PageBackgroundsManager />
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-6">
              <SyncSettingsManager onSettingsChange={handleSettingsChange} />
            </TabsContent>
            
            <TabsContent value="ftp" className="space-y-6">
              <FtpSettingsManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AdminSettingsPage;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, Server } from 'lucide-react';
import { toast } from '@/lib/toast';
import { syncConfig, syncData } from '@/lib/initSupabase';
import { checkSupabaseConnection, requiredTables } from '@/integrations/supabase/client';

const SyncSettingsManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [syncSuccess, setSyncSuccess] = useState<Record<string, boolean | null>>({});
  const [autoSync, setAutoSync] = useState(syncConfig.autoSync);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Check if connected to Supabase on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    
    checkConnection();
    
    // Check connection every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSyncTable = async (table: string) => {
    // Mettre à jour l'état de chargement
    setIsLoading(prev => ({ ...prev, [table]: true }));
    setSyncSuccess(prev => ({ ...prev, [table]: null }));
    
    try {
      // Vérifier si connecté à Supabase
      if (!isConnected) {
        const connected = await checkSupabaseConnection();
        if (!connected) {
          toast.error("Impossible de se connecter à Supabase. Synchronisation impossible.");
          setIsLoading(prev => ({ ...prev, [table]: false }));
          setSyncSuccess(prev => ({ ...prev, [table]: false }));
          return;
        }
        setIsConnected(true);
      }
      
      // Synchroniser la table
      const success = await syncData(table);
      
      // Mettre à jour l'état de succès
      setSyncSuccess(prev => ({ ...prev, [table]: success }));
      
      if (success) {
        toast.success(`Synchronisation de ${table} réussie`);
      } else {
        toast.error(`Échec de la synchronisation de ${table}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de ${table}:`, error);
      toast.error(`Erreur lors de la synchronisation de ${table}`);
      setSyncSuccess(prev => ({ ...prev, [table]: false }));
    } finally {
      setIsLoading(prev => ({ ...prev, [table]: false }));
    }
  };
  
  const handleSyncAll = async () => {
    // Synchroniser toutes les tables
    for (const table of syncConfig.tables) {
      await handleSyncTable(table);
    }
    
    toast.success('Synchronisation de toutes les tables terminée');
  };
  
  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    // Ici, dans une version future, on pourrait sauvegarder cette préférence
    // dans la configuration générale
    toast.success(`Synchronisation automatique ${checked ? 'activée' : 'désactivée'}`);
  };
  
  const getStatusIcon = (table: string) => {
    if (isLoading[table]) {
      return <Loader2 className="h-5 w-5 animate-spin text-winshirt-blue" />;
    }
    
    if (syncSuccess[table] === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (syncSuccess[table] === false) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    return null;
  };
  
  // Formater le nom de la table pour l'affichage
  const formatTableName = (table: string) => {
    return table.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synchronisation des données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-gray-300">
              {isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase (mode hors-ligne)'}
            </p>
          </div>
          
          <p className="text-gray-300 mb-4">
            Configurez la synchronisation des données entre le stockage local et Supabase.
            Vous pouvez synchroniser manuellement les tables ou activer la synchronisation automatique.
          </p>
          
          <div className="flex items-center space-x-2 mb-6">
            <Switch 
              id="auto-sync" 
              checked={autoSync} 
              onCheckedChange={handleToggleAutoSync} 
              disabled={!isConnected}
            />
            <Label htmlFor="auto-sync" className="text-white">
              Synchronisation automatique
            </Label>
          </div>
          
          {!isConnected && (
            <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-md mb-6">
              <p className="text-red-200 text-sm">
                La connexion à Supabase n'est pas établie. Veuillez vérifier votre connexion internet et les paramètres de Supabase.
              </p>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => checkSupabaseConnection().then(setIsConnected)}
                className="mt-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Vérifier la connexion
              </Button>
            </div>
          )}
          
          <Separator className="my-4 bg-winshirt-purple/20" />
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requiredTables.map(table => (
                <Card key={table} className="bg-winshirt-space-light border border-winshirt-purple/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-winshirt-purple-light" />
                        <span className="text-white">{formatTableName(table)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(table)}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={isLoading[table] || !isConnected}
                          onClick={() => handleSyncTable(table)}
                          className="h-8 border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Synchroniser
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple/80" 
              onClick={handleSyncAll}
              disabled={Object.values(isLoading).some(value => value) || !isConnected}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Synchroniser toutes les tables
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncSettingsManager;

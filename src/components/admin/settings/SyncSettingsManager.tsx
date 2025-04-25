import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, Server, Link2, AlertCircle, CloudOff, Cloud } from 'lucide-react';
import { toast } from '@/lib/toast';
import { syncConfig, syncData, forceSupabaseConnection } from '@/lib/initSupabase';
import { checkSupabaseConnection, requiredTables, ValidTableName } from '@/integrations/supabase/client';
import { supabase, camelToSnake, snakeToCamel } from '@/lib/supabase';

interface SyncSettingsManagerProps {
  isInitiallyConnected?: boolean;
}

const SyncSettingsManager: React.FC<SyncSettingsManagerProps> = ({ isInitiallyConnected = false }) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [syncSuccess, setSyncSuccess] = useState<Record<string, boolean | null>>({});
  const [autoSync, setAutoSync] = useState(syncConfig.autoSync);
  const [isConnected, setIsConnected] = useState<boolean>(isInitiallyConnected);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [localStorageData, setLocalStorageData] = useState<Record<string, boolean>>({});
  const [supabaseStorage, setSupabaseStorage] = useState<Record<string, boolean>>({});
  const [storageStats, setStorageStats] = useState<Record<string, {local: number; supabase: number}>>({});
  
  // Check if connected to Supabase on mount and check data existence
  useEffect(() => {
    const checkConnection = async () => {
      // Essayer d'abord de lire l'état de connexion du localStorage pour la cohérence
      const storedConnectionState = localStorage.getItem('supabase_connected');
      const initialConnected = storedConnectionState === 'true' || isInitiallyConnected;
      
      setIsConnected(initialConnected);
      
      // Puis vérifier la connexion réelle
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      localStorage.setItem('supabase_connected', connected ? 'true' : 'false');
      
      if (connected) {
        checkDataExistence();
        // Afficher un toast uniquement si l'état a changé
        if (!initialConnected) {
          toast.info("Connexion à Supabase établie", { position: "top-right", duration: 3000 });
        }
      }
    };
    
    checkConnection();
    
    // Check connection every 60 seconds (reduced from 30s to reduce load)
    const intervalId = setInterval(checkConnection, 60000);
    
    return () => clearInterval(intervalId);
  }, [isInitiallyConnected]);
  
  // Fonction pour vérifier l'existence de données dans chaque table
  const checkDataExistence = async () => {
    // Vérifier l'existence des données locales
    const localData: Record<string, boolean> = {};
    const localStats: Record<string, number> = {};
    
    for (const table of requiredTables) {
      const storedData = window.localStorage.getItem(table);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          localData[table] = Array.isArray(parsed) && parsed.length > 0;
          localStats[table] = Array.isArray(parsed) ? parsed.length : 0;
        } catch (e) {
          localData[table] = false;
          localStats[table] = 0;
        }
      } else {
        localData[table] = false;
        localStats[table] = 0;
      }
    }
    
    setLocalStorageData(localData);
    
    // Vérifier l'existence des données Supabase si connecté
    if (isConnected) {
      const supabaseData: Record<string, boolean> = {};
      const supabaseStats: Record<string, number> = {};
      
      for (const table of requiredTables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          supabaseData[table] = !error && count !== null && count > 0;
          supabaseStats[table] = count || 0;
        } catch (e) {
          supabaseData[table] = false;
          supabaseStats[table] = 0;
        }
      }
      
      setSupabaseStorage(supabaseData);
      
      // Combiner les statistiques
      const combinedStats: Record<string, {local: number; supabase: number}> = {};
      
      for (const table of requiredTables) {
        combinedStats[table] = {
          local: localStats[table] || 0,
          supabase: supabaseStats[table] || 0
        };
      }
      
      setStorageStats(combinedStats);
    }
  };
  
  const handleSyncTable = async (table: ValidTableName) => {
    setIsLoading(prev => ({ ...prev, [table]: true }));
    setSyncSuccess(prev => ({ ...prev, [table]: null }));
    
    try {
      // Vérifier d'abord si nous sommes connectés à Supabase
      if (!isConnected) {
        const connected = await checkSupabaseConnection();
        if (!connected) {
          toast.error("Impossible de se connecter à Supabase", { position: "top-right" });
          setIsLoading(prev => ({ ...prev, [table]: false }));
          setSyncSuccess(prev => ({ ...prev, [table]: false }));
          return;
        }
        setIsConnected(true);
        localStorage.setItem('supabase_connected', 'true');
      }
      
      // Récupérer les données du localStorage
      const localData = localStorage.getItem(table);
      let parsedData = [];
      
      if (localData) {
        try {
          parsedData = JSON.parse(localData);
          console.log(`Loaded ${parsedData.length} items from localStorage for ${table}`);
        } catch (e) {
          console.error(`Error parsing localStorage data for ${table}:`, e);
        }
      }
      
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        toast.warning(`Pas de données locales pour ${table}`, { position: "top-right" });
        setIsLoading(prev => ({ ...prev, [table]: false }));
        setSyncSuccess(prev => ({ ...prev, [table]: false }));
        return;
      }
      
      // Conversion des données camelCase vers snake_case pour Supabase
      const snakeCaseData = parsedData.map(item => camelToSnake(item));
      
      // Effacer les données existantes
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .gt('id', 0);
        
      if (deleteError) {
        console.error(`Error clearing ${table} table:`, deleteError);
        toast.error(`Erreur lors de la suppression des données: ${deleteError.message}`, { position: "top-right" });
        setIsLoading(prev => ({ ...prev, [table]: false }));
        setSyncSuccess(prev => ({ ...prev, [table]: false }));
        return;
      }
      
      // Insérer les nouvelles données
      const batchSize = 25;
      let allSuccess = true;
      
      for (let i = 0; i < snakeCaseData.length; i += batchSize) {
        const batch = snakeCaseData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from(table)
          .insert(batch);
          
        if (insertError) {
          console.error(`Error inserting batch to ${table}:`, insertError);
          toast.error(`Erreur lors de l'insertion des données: ${insertError.message}`, { position: "top-right" });
          allSuccess = false;
          break;
        }
      }
      
      setSyncSuccess(prev => ({ ...prev, [table]: allSuccess }));
      
      if (allSuccess) {
        toast.success(`Synchronisation réussie pour ${table} (${parsedData.length} éléments)`, { position: "top-right" });
        
        // Vérifier le résultat
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        console.log(`Verified ${count} items in Supabase for ${table}`);
        
        // Récupérer les données depuis Supabase pour mettre à jour le localStorage
        const { data, error: fetchError } = await supabase
          .from(table)
          .select('*');
          
        if (!fetchError && data) {
          // Convertir les données snake_case en camelCase
          const camelCaseData = data.map(item => snakeToCamel(item));
          
          // Mettre à jour le localStorage
          localStorage.setItem(table, JSON.stringify(camelCaseData));
          console.log(`Updated localStorage with ${camelCaseData.length} items for ${table}`);
        }
        
        // Mettre à jour les statistiques
        checkDataExistence();
      } else {
        toast.error(`Échec de synchronisation pour ${table}`, { position: "top-right" });
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de ${table}:`, error);
      toast.error(`Erreur lors de la synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "top-right" });
      setSyncSuccess(prev => ({ ...prev, [table]: false }));
    } finally {
      setIsLoading(prev => ({ ...prev, [table]: false }));
    }
  };
  
  const handleSyncAll = async () => {
    toast.info("Démarrage de la synchronisation de toutes les tables...", { position: "top-right" });
    
    // Synchroniser toutes les tables
    for (const table of syncConfig.tables) {
      await handleSyncTable(table);
    }
    
    toast.success('Synchronisation de toutes les tables terminée', { position: "top-right" });
    
    // Mettre à jour les statistiques
    checkDataExistence();
  };
  
  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    // Ici, dans une version future, on pourrait sauvegarder cette préférence
    // dans la configuration générale
    toast.success(`Synchronisation automatique ${checked ? 'activée' : 'désactivée'}`, { position: "top-right" });
  };
  
  const handleForceConnection = async () => {
    setIsConnecting(true);
    
    try {
      const success = await forceSupabaseConnection();
      setIsConnected(success);
      localStorage.setItem('supabase_connected', success ? 'true' : 'false');
      
      if (success) {
        toast.success("Connexion à Supabase établie avec succès!", { position: "top-right" });
        // Mettre à jour les statistiques
        await checkDataExistence();
      } else {
        toast.error("Impossible de se connecter à Supabase", { position: "top-right" });
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de connexion:", error);
      toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "top-right" });
    } finally {
      setIsConnecting(false);
    }
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
  
  // Déterminer le statut de stockage d'une table
  const getStorageStatus = (table: string) => {
    const local = localStorageData[table];
    const supabase = supabaseStorage[table];
    
    if (local && supabase) {
      return 'both';
    } else if (local) {
      return 'local';
    } else if (supabase) {
      return 'supabase';
    } else {
      return 'none';
    }
  };
  
  // Obtenir l'icône et la couleur pour le statut de stockage
  const getStorageStatusIcon = (table: string) => {
    const status = getStorageStatus(table);
    
    switch (status) {
      case 'both':
        return <Cloud className="h-4 w-4 text-green-500" aria-label="Données présentes en local et sur Supabase" />;
      case 'local':
        return <CloudOff className="h-4 w-4 text-yellow-500" aria-label="Données présentes uniquement en local" />;
      case 'supabase':
        return <Database className="h-4 w-4 text-blue-500" aria-label="Données présentes uniquement sur Supabase" />;
      case 'none':
        return <AlertCircle className="h-4 w-4 text-red-500" aria-label="Aucune donnée trouvée" />;
      default:
        return null;
    }
  };

  // Afficher le badge de statut
  const renderStorageStatusBadge = (table: string) => {
    const status = getStorageStatus(table);
    let bgColor = '';
    let textColor = '';
    let statusText = '';
    
    switch (status) {
      case 'both':
        bgColor = 'bg-green-500/20';
        textColor = 'text-green-300';
        statusText = 'Local+Supabase';
        break;
      case 'local':
        bgColor = 'bg-yellow-500/20';
        textColor = 'text-yellow-300';
        statusText = 'Local uniquement';
        break;
      case 'supabase':
        bgColor = 'bg-blue-500/20';
        textColor = 'text-blue-300';
        statusText = 'Supabase uniquement';
        break;
      case 'none':
        bgColor = 'bg-red-500/20';
        textColor = 'text-red-300';
        statusText = 'Aucune donnée';
        break;
    }
    
    return (
      <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
        {getStorageStatusIcon(table)}
        <span>{statusText}</span>
      </span>
    );
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-gray-300">
                {isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase (mode hors-ligne)'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceConnection}
              disabled={isConnecting || isConnected}
              className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-1" />
              )}
              {isConnected ? 'Connecté' : 'Établir la connexion'}
            </Button>
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
            <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-md mb-6 max-w-[100%]">
              <p className="text-red-200 text-sm">
                La connexion à Supabase n'est pas établie. Veuillez cliquer sur "Établir la connexion" pour vous connecter à votre base de données.
              </p>
              <div className="mt-4 text-sm text-red-200">
                <p className="font-semibold">Instructions pour établir la connexion:</p>
                <ol className="list-decimal pl-4 mt-2 space-y-1">
                  <li>Vérifiez que le serveur Supabase est accessible</li>
                  <li>Assurez-vous que votre clé API Supabase est valide</li>
                  <li>Cliquez sur le bouton "Établir la connexion" ci-dessus</li>
                  <li>Une fois connecté, vous pourrez synchroniser vos données</li>
                </ol>
              </div>
            </div>
          )}
          
          <Separator className="my-4 bg-winshirt-purple/20" />
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requiredTables.map(table => {
                const stats = storageStats[table] || { local: 0, supabase: 0 };
                
                return (
                  <Card key={table} className="bg-winshirt-space-light border border-winshirt-purple/20">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
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
                              onClick={() => handleSyncTable(table as ValidTableName)}
                              className="h-8 border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Synchroniser
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {renderStorageStatusBadge(table)}
                          
                          <div className="text-xs text-gray-400">
                            <span className="mr-3">Local: {stats.local} éléments</span>
                            <span>Supabase: {stats.supabase} éléments</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Button 
              className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple/80" 
              onClick={handleSyncAll}
              disabled={Object.values(isLoading).some(value => value) || !isConnected}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Synchroniser toutes les tables
            </Button>
            
            <Button
              className="w-full mt-2 bg-winshirt-blue hover:bg-winshirt-blue/80"
              onClick={checkDataExistence}
              disabled={Object.values(isLoading).some(value => value)}
            >
              <Database className="h-4 w-4 mr-2" />
              Vérifier l'état des données
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncSettingsManager;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, Server, Link2, AlertCircle, CloudOff, Cloud } from 'lucide-react';
import { toast } from '@/lib/toast';
import { syncConfig, syncData, forceSupabaseConnection, createTablesSQL, ValidTableName } from '@/lib/initSupabase';
import { checkSupabaseConnection, requiredTables } from '@/integrations/supabase/client';
import { supabase, camelToSnake, snakeToCamel } from '@/lib/supabase';

const SyncSettingsManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [syncSuccess, setSyncSuccess] = useState<Record<string, boolean | null>>({});
  const [autoSync, setAutoSync] = useState(syncConfig.autoSync);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [localStorageData, setLocalStorageData] = useState<Record<string, boolean>>({});
  const [supabaseStorage, setSupabaseStorage] = useState<Record<string, boolean>>({});
  const [storageStats, setStorageStats] = useState<Record<string, {local: number; supabase: number}>>({});
  
  // Check if connected to Supabase on mount and check data existence
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Checking Supabase connection...");
        const connected = await checkSupabaseConnection();
        console.log("Connection result:", connected);
        setIsConnected(connected);
        
        if (connected) {
          checkDataExistence();
          // Show a welcome toast
          toast.info("Connexion à Supabase établie", { duration: 3000 });
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };
    
    checkConnection();
    
    // Check connection every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
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
          console.log(`Table ${table} count:`, count);
        } catch (e) {
          console.error(`Error checking table ${table}:`, e);
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
    console.log(`Starting sync for table ${table}`);
    setIsLoading(prev => ({ ...prev, [table]: true }));
    setSyncSuccess(prev => ({ ...prev, [table]: null }));
    
    try {
      if (!isConnected) {
        console.log("Not connected to Supabase, trying to connect...");
        const connected = await forceSupabaseConnection();
        if (!connected) {
          console.error("Could not connect to Supabase");
          toast.error("Impossible de se connecter à Supabase");
          setIsLoading(prev => ({ ...prev, [table]: false }));
          setSyncSuccess(prev => ({ ...prev, [table]: false }));
          return;
        }
        setIsConnected(true);
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
        toast.warning(`Pas de données locales pour ${table}`);
        setIsLoading(prev => ({ ...prev, [table]: false }));
        setSyncSuccess(prev => ({ ...prev, [table]: false }));
        return;
      }
      
      // Conversion des données camelCase vers snake_case pour Supabase
      const snakeCaseData = parsedData.map(item => camelToSnake(item));
      console.log(`Converted data for ${table}:`, snakeCaseData[0]);
      
      // Effacer les données existantes
      console.log(`Deleting existing data from ${table}`);
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .gt('id', 0);
        
      if (deleteError) {
        console.error(`Error clearing ${table} table:`, deleteError);
        toast.error(`Erreur lors de la suppression des données: ${deleteError.message}`);
        setIsLoading(prev => ({ ...prev, [table]: false }));
        setSyncSuccess(prev => ({ ...prev, [table]: false }));
        return;
      }
      
      // Insérer les nouvelles données
      const batchSize = 25;
      let allSuccess = true;
      
      console.log(`Inserting ${snakeCaseData.length} items into ${table} in batches of ${batchSize}`);
      for (let i = 0; i < snakeCaseData.length; i += batchSize) {
        const batch = snakeCaseData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from(table)
          .insert(batch);
          
        if (insertError) {
          console.error(`Error inserting batch to ${table}:`, insertError);
          toast.error(`Erreur lors de l'insertion des données: ${insertError.message}`);
          allSuccess = false;
          break;
        }
      }
      
      setSyncSuccess(prev => ({ ...prev, [table]: allSuccess }));
      
      if (allSuccess) {
        console.log(`Successfully synchronized ${table}`);
        toast.success(`Synchronisation réussie pour ${table} (${parsedData.length} éléments)`);
        
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
          console.log(`Got ${data.length} items from Supabase for ${table}`);
          // Convertir les données snake_case en camelCase
          const camelCaseData = data.map(item => snakeToCamel(item));
          
          // Mettre à jour le localStorage
          localStorage.setItem(table, JSON.stringify(camelCaseData));
          console.log(`Updated localStorage with ${camelCaseData.length} items for ${table}`);
        } else if (fetchError) {
          console.error(`Error fetching back data for ${table}:`, fetchError);
        }
        
        // Mettre à jour les statistiques
        checkDataExistence();
      } else {
        toast.error(`Échec de synchronisation pour ${table}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de ${table}:`, error);
      toast.error(`Erreur lors de la synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setSyncSuccess(prev => ({ ...prev, [table]: false }));
    } finally {
      setIsLoading(prev => ({ ...prev, [table]: false }));
    }
  };
  
  const handleSyncAll = async () => {
    console.log("Starting synchronization of all tables");
    toast.info("Démarrage de la synchronisation de toutes les tables");
    
    let tablesProcessed = 0;
    let tablesSucceeded = 0;
    
    for (const table of requiredTables) {
      const validTable = table as ValidTableName;
      console.log(`Processing table ${table}`);
      
      setIsLoading(prev => ({ ...prev, [validTable]: true }));
      
      try {
        if (!isConnected) {
          const connected = await forceSupabaseConnection();
          if (!connected) {
            console.error("Could not connect to Supabase");
            toast.error("Impossible de se connecter à Supabase");
            break;
          }
          setIsConnected(true);
        }
        
        const localData = localStorage.getItem(validTable);
        let parsedData = [];
        
        if (localData) {
          try {
            parsedData = JSON.parse(localData);
            console.log(`Loaded ${parsedData.length} items from localStorage for ${validTable}`);
          } catch (e) {
            console.error(`Error parsing localStorage data for ${validTable}:`, e);
          }
        }
        
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          console.log(`No local data for ${validTable}, skipping`);
          tablesProcessed++;
          continue;
        }
        
        // Conversion des données camelCase vers snake_case pour Supabase
        const snakeCaseData = parsedData.map(item => camelToSnake(item));
        
        // Effacer les données existantes
        console.log(`Deleting existing data from ${validTable}`);
        const { error: deleteError } = await supabase
          .from(validTable)
          .delete()
          .gt('id', 0);
          
        if (deleteError) {
          console.error(`Error clearing ${validTable} table:`, deleteError);
          continue;
        }
        
        // Insérer les nouvelles données
        const batchSize = 25;
        let allSuccess = true;
        
        console.log(`Inserting ${snakeCaseData.length} items into ${validTable}`);
        for (let i = 0; i < snakeCaseData.length; i += batchSize) {
          const batch = snakeCaseData.slice(i, i + batchSize);
          
          const { error: insertError } = await supabase
            .from(validTable)
            .insert(batch);
            
          if (insertError) {
            console.error(`Error inserting batch to ${validTable}:`, insertError);
            allSuccess = false;
            break;
          }
        }
        
        if (allSuccess) {
          console.log(`Successfully synchronized ${validTable}`);
          tablesSucceeded++;
          
          // Récupérer les données depuis Supabase pour mettre à jour le localStorage
          const { data, error: fetchError } = await supabase
            .from(validTable)
            .select('*');
            
          if (!fetchError && data) {
            // Convertir les données snake_case en camelCase
            const camelCaseData = data.map(item => snakeToCamel(item));
            
            // Mettre à jour le localStorage
            localStorage.setItem(validTable, JSON.stringify(camelCaseData));
            console.log(`Updated localStorage with ${camelCaseData.length} items for ${validTable}`);
            
            setSyncSuccess(prev => ({ ...prev, [validTable]: true }));
          } else if (fetchError) {
            console.error(`Error fetching data for ${validTable}:`, fetchError);
            setSyncSuccess(prev => ({ ...prev, [validTable]: false }));
          }
        } else {
          setSyncSuccess(prev => ({ ...prev, [validTable]: false }));
        }
        
        tablesProcessed++;
      } catch (error) {
        console.error(`Error processing table ${validTable}:`, error);
        tablesProcessed++;
      } finally {
        setIsLoading(prev => ({ ...prev, [validTable]: false }));
      }
    }
    
    // Mettre à jour les statistiques
    checkDataExistence();
    
    // Afficher le résultat
    if (tablesSucceeded === requiredTables.length) {
      toast.success(`Synchronisation complète (${tablesSucceeded}/${requiredTables.length} tables)`);
    } else {
      toast.warning(`Synchronisation partielle (${tablesSucceeded}/${requiredTables.length} tables)`);
    }
  };
  
  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('autoSync', checked.toString());
  };
  
  const handleForceConnection = async () => {
    setIsConnecting(true);
    
    try {
      const connected = await forceSupabaseConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast.success("Connexion établie avec Supabase");
        checkDataExistence();
      } else {
        toast.error("Impossible de se connecter à Supabase");
      }
    } catch (error) {
      console.error("Error forcing connection:", error);
      toast.error("Erreur lors de la connexion à Supabase");
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Synchronisation des données Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-500">
                  <Cloud className="h-5 w-5 mr-2" />
                  <span>Connecté à Supabase</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-500">
                  <CloudOff className="h-5 w-5 mr-2" />
                  <span>Non connecté</span>
                </div>
              )}
            </div>
            <Button 
              onClick={handleForceConnection} 
              variant="outline" 
              size="sm"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Forcer la connexion
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={handleToggleAutoSync}
            />
            <Label htmlFor="auto-sync">Synchronisation automatique</Label>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Tables</h3>
              <Button
                onClick={handleSyncAll}
                variant="default"
                size="sm"
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser toutes les tables
              </Button>
            </div>
            
            <div className="space-y-2">
              {requiredTables.map((table) => (
                <div key={table} className="flex items-center justify-between p-2 rounded-lg border bg-winshirt-space/40 border-winshirt-purple/20">
                  <div className="flex-1 flex items-center">
                    <div className="mr-4 w-32 font-medium truncate">{table}</div>
                    
                    <div className="flex-1 flex items-center space-x-4">
                      <div className="text-xs text-gray-400">
                        Local: {storageStats[table]?.local || 0} 
                      </div>
                      <div className="text-xs text-gray-400">
                        Supabase: {storageStats[table]?.supabase || 0}
                      </div>
                      
                      {localStorageData[table] && !supabaseStorage[table] && (
                        <div className="text-xs text-yellow-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> 
                          Non synchronisé
                        </div>
                      )}
                      
                      {localStorageData[table] && supabaseStorage[table] && (
                        <div className="text-xs text-green-500 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> 
                          Synchronisé
                        </div>
                      )}
                      
                      {!localStorageData[table] && !supabaseStorage[table] && (
                        <div className="text-xs text-gray-400">
                          Pas de données
                        </div>
                      )}
                      
                      {!localStorageData[table] && supabaseStorage[table] && (
                        <div className="text-xs text-blue-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> 
                          Uniquement sur Supabase
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={() => handleSyncTable(table as ValidTableName)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading[table]}
                      className={
                        syncSuccess[table] === true
                          ? "text-green-500 border-green-500"
                          : syncSuccess[table] === false
                          ? "text-red-500 border-red-500"
                          : ""
                      }
                    >
                      {isLoading[table] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : syncSuccess[table] === true ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : syncSuccess[table] === false ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncSettingsManager;

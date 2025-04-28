
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, AlertCircle, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { syncLocalDataToSupabase, forceSupabaseConnection, checkSupabaseConnection } from '@/lib/supabase';
import { ValidTableName, requiredTables } from '@/integrations/supabase/client';

// Add the missing type definitions
type TablesStatus = 'both' | 'local' | 'supabase' | 'none' | 'error';

interface TableData {
  localData: boolean;
  supabaseData: boolean;
  status: TablesStatus;
  count: number;
  error?: string;
}

interface TablesData {
  [tableName: string]: TableData;
}

const SyncDebugTool: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tablesData, setTablesData] = useState<TablesData>({});
  
  // Vérifier la connexion et les données au chargement
  useEffect(() => {
    checkConnection();
  }, []);

  // Fonction pour vérifier la connexion à Supabase
  const checkConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // Récupérer d'abord l'état de connexion stocké
      const storedState = localStorage.getItem('supabase_connected');
      const initialConnected = storedState === 'true';
      
      // Vérifier la connexion
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Vérifier les données dans chaque table
        await checkTablesData();
        if (!initialConnected) {
          toast.success("Connecté à Supabase", { position: "bottom-right" });
        }
      } else {
        setConnectionError("Impossible d'établir une connexion à Supabase");
        toast.error("Non connecté à Supabase", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setConnectionError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setIsConnected(false);
      toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier les données dans les tables
  const checkTablesData = async () => {
    const data: TablesData = {};
    
    for (const table of requiredTables) {
      try {
        // Vérifier localStorage
        const localData = localStorage.getItem(table);
        const hasLocalData = localData && JSON.parse(localData).length > 0;
        
        // Vérifier Supabase
        let hasSupabaseData = false;
        let count = 0;
        
        try {
          const { data: supabaseData, error, count: supabaseCount } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
            
          if (!error && supabaseCount !== null) {
            hasSupabaseData = supabaseCount > 0;
            count = supabaseCount;
          }
        } catch (e) {
          console.error(`Erreur lors de la vérification de la table ${table}:`, e);
        }
        
        // Déterminer le statut
        let status: TablesStatus = 'none';
        if (hasLocalData && hasSupabaseData) status = 'both';
        else if (hasLocalData) status = 'local';
        else if (hasSupabaseData) status = 'supabase';
        
        data[table] = {
          localData: hasLocalData,
          supabaseData: hasSupabaseData,
          status,
          count
        };
      } catch (error) {
        console.error(`Erreur lors de la vérification des données pour ${table}:`, error);
        data[table] = {
          localData: false,
          supabaseData: false,
          status: 'error',
          count: 0,
          error: `${error instanceof Error ? error.message : 'Erreur inconnue'}`
        };
      }
    }
    
    setTablesData(data);
  };

  // Forcer la connexion à Supabase
  const handleForceConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      const connected = await forceSupabaseConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast.success("Connexion à Supabase établie avec succès", { position: "bottom-right" });
        await checkTablesData();
      } else {
        setConnectionError("Impossible d'établir une connexion à Supabase");
        toast.error("Échec de la connexion à Supabase", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de connexion forcée:", error);
      setConnectionError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  // Synchroniser une table
  const handleSyncTable = async (table: string) => {
    if (!isConnected) {
      toast.error("Vous devez être connecté à Supabase pour synchroniser", { position: "bottom-right" });
      return;
    }
    
    setIsLoading(true);
    try {
      // Ensure table is a valid table name before passing to syncLocalDataToSupabase
      if (requiredTables.includes(table as ValidTableName)) {
        const success = await syncLocalDataToSupabase(table as ValidTableName);
        if (success) {
          await checkTablesData();
        }
      } else {
        toast.error(`Table invalide: ${table}`, { position: "bottom-right" });
      }
    } catch (e) {
      console.error(`Erreur lors de la synchronisation de ${table}:`, e);
      toast.error(`Erreur: ${e instanceof Error ? e.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshData = async () => {
    await checkConnection();
  };

  // Obtenir la couleur de badge en fonction du statut
  const getStatusColor = (status: TablesStatus) => {
    switch (status) {
      case 'both': return 'bg-green-500 hover:bg-green-600';
      case 'local': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'supabase': return 'bg-blue-500 hover:bg-blue-600';
      case 'error': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Obtenir l'icône en fonction du statut
  const getStatusIcon = (status: TablesStatus) => {
    switch (status) {
      case 'both': return <CheckCircle className="h-4 w-4" />;
      case 'local': return <Info className="h-4 w-4" />;
      case 'supabase': return <Database className="h-4 w-4" />;
      case 'error': case 'none': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Obtenir le texte en fonction du statut
  const getStatusText = (status: TablesStatus) => {
    switch (status) {
      case 'both': return 'Local + Supabase';
      case 'local': return 'Local uniquement';
      case 'supabase': return 'Supabase uniquement';
      case 'error': return 'Erreur';
      case 'none': return 'Aucune donnée';
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="winshirt-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Outil de débogage Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-lg font-medium">
              État de la connexion: {isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isLoading}
              className="border-winshirt-blue/40 text-winshirt-blue"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Vérifier la connexion
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceConnection}
              disabled={isLoading || isConnected}
              className="border-green-500/40 text-green-500"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-1" />
              )}
              Établir la connexion
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Données des tables</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {requiredTables.map(table => {
              const tableData = tablesData[table] || { status: 'none', count: 0, localData: false, supabaseData: false };
              
              return (
                <div 
                  key={table} 
                  className="p-3 rounded-lg bg-winshirt-space-light border border-winshirt-purple/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{table}</span>
                    <Badge className={`${getStatusColor(tableData.status)} text-white`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(tableData.status)}
                        <span>{getStatusText(tableData.status)}</span>
                      </span>
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {tableData.status === 'both' || tableData.status === 'supabase' ? (
                      <span>Supabase: {tableData.count} éléments</span>
                    ) : null}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isLoading || !isConnected || !tableData.localData}
                    onClick={() => handleSyncTable(table)}
                    className="w-full h-8 border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Synchroniser
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        
        <Button 
          className="w-full mt-4" 
          onClick={refreshData}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </CardContent>
    </Card>
  );
};

export default SyncDebugTool;

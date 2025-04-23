import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, CheckCircle, XCircle, RefreshCw, Database, 
  ArrowRightLeft, AlertCircle, CloudOff, Cloud, Upload, Download
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useSyncData, TableName } from '@/hooks/useSyncData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

const SyncSettingsManager = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [storageStats, setStorageStats] = useState<Record<TableName, { local: number, supabase: number }>>({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  
  const { 
    syncStatus, 
    checkConnection, 
    getLocalData, 
    getSupabaseData, 
    syncToSupabase,
    syncFromSupabase,
    syncAllToSupabase
  } = useSyncData();
  
  const tables: TableName[] = [
    'lotteries',
    'products',
    'lottery_participants',
    'lottery_winners',
    'orders',
    'order_items',
    'clients',
    'visuals',
    'site_settings' // Include site_settings in the list
  ];
  
  useEffect(() => {
    verifyConnection();
    checkDataStats();
  }, []);
  
  const verifyConnection = async () => {
    try {
      setIsCheckingConnection(true);
      
      // Test direct connection to Supabase
      const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
      
      if (error) {
        console.error("Erreur de connexion à Supabase:", error);
        toast.error(`Erreur de connexion: ${error.message}`);
        setIsConnected(false);
      } else {
        setIsConnected(true);
        toast.success("Connexion à Supabase établie");
        console.log("Connexion à Supabase réussie:", data);
      }
    } catch (err) {
      console.error("Exception lors de la vérification de connexion:", err);
      toast.error("Une erreur s'est produite lors de la vérification de la connexion");
      setIsConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  const checkDataStats = async () => {
    setIsLoading(true);
    const stats: Record<TableName, { local: number, supabase: number }> = {} as any;
    
    for (const table of tables) {
      // Données locales
      const localData = getLocalData(table);
      
      // Données Supabase
      const { count: supabaseCount } = await getSupabaseData(table);
      
      stats[table] = {
        local: localData.length,
        supabase: supabaseCount
      };
    }
    
    setStorageStats(stats);
    setIsLoading(false);
  };
  
  const handleSyncToSupabase = async (table: TableName) => {
    if (!isConnected) {
      toast.error("Veuillez vous connecter à Supabase d'abord");
      return;
    }
    
    await syncToSupabase(table);
    await checkDataStats();
  };
  
  const handleSyncFromSupabase = async (table: TableName) => {
    if (!isConnected) {
      toast.error("Veuillez vous connecter à Supabase d'abord");
      return;
    }
    
    await syncFromSupabase(table);
    await checkDataStats();
  };
  
  const handleSyncAllData = async () => {
    if (!isConnected) {
      toast.error("Veuillez vous connecter à Supabase d'abord");
      return;
    }
    
    setIsLoading(true);
    setSyncProgress(0);
    
    // Synchroniser toutes les tables
    let completed = 0;
    const totalTables = tables.length;
    
    for (const table of tables) {
      await syncToSupabase(table);
      completed++;
      setSyncProgress(Math.round((completed / totalTables) * 100));
    }
    
    await checkDataStats();
    setIsLoading(false);
    toast.success("Synchronisation de toutes les données terminée");
  };
  
  const formatTableName = (tableName: string): string => {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getStatusColor = (table: TableName): string => {
    const stats = storageStats[table];
    if (!stats) return 'bg-gray-500';
    
    if (stats.local > 0 && stats.supabase === 0) {
      return 'bg-yellow-500'; // Seulement local
    } else if (stats.local === 0 && stats.supabase > 0) {
      return 'bg-blue-500'; // Seulement Supabase
    } else if (stats.local > 0 && stats.supabase > 0) {
      return 'bg-green-500'; // Les deux
    } else {
      return 'bg-gray-500'; // Aucune donnée
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="winshirt-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            État de la synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-gray-300">
                {isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase (mode hors-ligne)'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={verifyConnection}
              disabled={isCheckingConnection}
              className={`${isConnected ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'}`}
            >
              {isCheckingConnection ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Vérifier la connexion
            </Button>
          </div>
          
          {!isConnected && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-500/30 rounded-md">
              <p className="text-red-200 text-sm">
                Vous n'êtes pas connecté à Supabase. Veuillez vérifier votre connexion Internet et cliquer sur "Vérifier la connexion" pour réessayer.
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="my-4">
              <p className="text-sm text-gray-300 mb-2">Synchronisation en cours...</p>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Données stockées</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkDataStats} 
              disabled={isLoading}
              className="border-gray-500/20 text-gray-300"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Rafraîchir les statistiques
            </Button>
          </div>
          
          <div className="space-y-2">
            {tables.map((table) => {
              const stats = storageStats[table] || { local: 0, supabase: 0 };
              return (
                <div 
                  key={table} 
                  className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(table)}`}></div>
                    <span className="text-white font-medium">{formatTableName(table)}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="bg-gray-800/50 border-gray-700/30">
                      <CloudOff className="h-3 w-3 mr-1" /> Local: {stats.local || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-800/50 border-gray-700/30">
                      <Cloud className="h-3 w-3 mr-1" /> Supabase: {stats.supabase || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!isConnected || stats.local === 0 || syncStatus[table] === 'loading'}
                      onClick={() => handleSyncToSupabase(table)}
                      className="h-8 gap-1 text-xs py-1"
                    >
                      {syncStatus[table] === 'loading' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Vers Supabase
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!isConnected || stats.supabase === 0 || syncStatus[table] === 'loading'}
                      onClick={() => handleSyncFromSupabase(table)}
                      className="h-8 gap-1 text-xs py-1"
                    >
                      {syncStatus[table] === 'loading' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Vers Local
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator className="my-6 bg-gray-700/30" />
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" 
              onClick={handleSyncAllData} 
              disabled={!isConnected || isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="h-4 w-4" />
              )}
              Synchroniser toutes les données vers Supabase
            </Button>
          </div>
          
          {tables.some(table => storageStats[table]?.local > 0) && (
            <div className="mt-6 p-3 bg-blue-950/30 border border-blue-500/30 rounded-md">
              <h4 className="text-blue-200 font-medium flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                Comment utiliser cette page
              </h4>
              <p className="text-blue-200 text-sm">
                Vous avez des données stockées localement. Pour les transférer vers Supabase, cliquez sur le bouton "Synchroniser toutes les données vers Supabase" ci-dessus. 
                Une fois la synchronisation terminée, toutes vos données seront disponibles dans Supabase tout en restant accessibles localement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncSettingsManager;

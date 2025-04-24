import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection, checkRequiredTables, requiredTables, syncLocalDataToSupabase, ValidTableName } from '@/integrations/supabase/client';
import { Database, RefreshCcw, AlertCircle, CheckCircle, ServerCrash } from 'lucide-react';

const SyncDebugTool: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tablesStatus, setTablesStatus] = useState<{exists: boolean; missing: readonly string[]}>({ exists: false, missing: [] });
  const [isSyncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<Record<string, boolean>>({});
  const [localDataCounts, setLocalDataCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkConnection();
    checkLocalStorageData();
  }, []);

  const checkConnection = async () => {
    const connected = await checkSupabaseConnection();
    setIsConnected(connected);
    
    if (connected) {
      const tables = await checkRequiredTables();
      setTablesStatus(tables);
      
      if (!tables.exists) {
        toast.warning(`Tables manquantes: ${tables.missing.join(', ')}`);
      }
    }
  };

  const checkLocalStorageData = () => {
    const counts: Record<string, number> = {};
    
    requiredTables.forEach(table => {
      const data = localStorage.getItem(table);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          counts[table] = Array.isArray(parsed) ? parsed.length : 1;
        } catch (e) {
          counts[table] = 0;
        }
      } else {
        counts[table] = 0;
      }
    });
    
    setLocalDataCounts(counts);
  };

  const handleForceSync = async (table: ValidTableName) => {
    try {
      setSyncing(true);
      
      const success = await syncLocalDataToSupabase(table);
      
      setSyncResults(prev => ({
        ...prev,
        [table]: success
      }));
      
      if (success) {
        toast.success(`Synchronisation de ${table} réussie`);
      } else {
        toast.error(`Échec de la synchronisation de ${table}`);
      }
    } catch (error) {
      console.error(`Error syncing ${table}:`, error);
      toast.error(`Erreur lors de la synchronisation de ${table}`);
      
      setSyncResults(prev => ({
        ...prev,
        [table]: false
      }));
    } finally {
      setSyncing(false);
    }
  };

  const syncAllTables = async () => {
    setSyncing(true);
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      try {
        const success = await syncLocalDataToSupabase(table as ValidTableName);
        results[table] = success;
      } catch (e) {
        results[table] = false;
      }
    }
    
    setSyncResults(results);
    setSyncing(false);
    
    const successCount = Object.values(results).filter(Boolean).length;
    if (successCount === requiredTables.length) {
      toast.success("Toutes les tables ont été synchronisées avec succès");
    } else {
      toast.warning(`${successCount}/${requiredTables.length} tables synchronisées avec succès`);
    }
  };

  return (
    <Card className="winshirt-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="h-5 w-5" />
          Outil de débogage Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="p-4 rounded-lg bg-winshirt-space-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected === null ? (
                <RefreshCcw className="h-5 w-5 text-yellow-400 animate-spin" />
              ) : isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <ServerCrash className="h-5 w-5 text-red-500" />
              )}
              <h3 className="font-semibold text-white">État de la connexion</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkConnection} 
              disabled={isConnected === null}
              className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
            >
              Vérifier la connexion
            </Button>
          </div>
          <div className="mt-2">
            <p className="text-gray-300">
              {isConnected === null 
                ? "Vérification de la connexion..." 
                : isConnected 
                  ? "Connecté à Supabase" 
                  : "Non connecté à Supabase"}
            </p>
          </div>
        </div>

        {/* Tables Status */}
        {isConnected && (
          <div className="p-4 rounded-lg bg-winshirt-space-light">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">État des tables</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  const tables = await checkRequiredTables();
                  setTablesStatus(tables);
                }}
                className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
              >
                Vérifier les tables
              </Button>
            </div>
            <div className="mt-2">
              {tablesStatus.exists ? (
                <p className="text-green-400">Toutes les tables requises existent</p>
              ) : (
                <div>
                  <p className="text-yellow-400">Tables manquantes:</p>
                  <ul className="list-disc list-inside text-gray-300 mt-1">
                    {tablesStatus.missing.map(table => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local Data */}
        <div className="p-4 rounded-lg bg-winshirt-space-light">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Données locales</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkLocalStorageData}
              className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
            >
              Actualiser
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {requiredTables.map(table => (
              <div key={table} className="flex items-center justify-between p-2 rounded bg-winshirt-space/50">
                <span className="text-gray-300">{table}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{localDataCounts[table] || 0} éléments</span>
                  <Button 
                    variant="outline" 
                    size="sm"  
                    className="h-7 px-2 text-xs border-winshirt-blue/30 text-winshirt-blue hover:bg-winshirt-blue/10"
                    disabled={isSyncing || !isConnected || (localDataCounts[table] || 0) === 0}
                    onClick={() => handleForceSync(table as ValidTableName)}
                  >
                    {syncResults[table] === true ? "✓" : "Sync"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errors and Debug Info */}
        {(!isConnected || !tablesStatus.exists) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problèmes détectés</AlertTitle>
            <AlertDescription>
              {!isConnected && <div>• La connexion à Supabase a échoué</div>}
              {!tablesStatus.exists && <div>• Des tables requises sont manquantes</div>}
              <div className="mt-2 text-sm">
                Essayez de vérifier les paramètres de connexion et de recréer les tables manquantes.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="default" 
            className="bg-winshirt-blue hover:bg-winshirt-blue-dark flex-1"
            onClick={syncAllTables}
            disabled={isSyncing || !isConnected}
          >
            {isSyncing ? "Synchronisation..." : "Synchroniser toutes les données"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncDebugTool;

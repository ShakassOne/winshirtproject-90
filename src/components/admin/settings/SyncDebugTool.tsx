
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, CheckCircle, Loader2, RefreshCw, XCircle, AlertCircle, Cloud, CloudOff, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { testSupabaseConnection, ensureLotteryTablesExist } from '@/api/lotteryApi';
import { supabase } from '@/integrations/supabase/client';

const SyncDebugTool: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [localStorageData, setLocalStorageData] = useState<Record<string, boolean>>({});
  const [supabaseStorage, setSupabaseStorage] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const requiredTables = ['lotteries', 'lottery_participants', 'lottery_winners', 'products', 'visuals', 'orders', 'order_items', 'clients'];

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionError(null);
    
    try {
      const connected = await testSupabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setConnectionError("Échec de connexion à https://uwgclposhhdovfjnazlp.supabase.co");
      } else {
        toast.success("Connexion à Supabase établie", { position: "bottom-right" });
        checkLocalStorageData();
        checkSupabaseTables();
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setIsConnected(false);
      setConnectionError("Erreur lors de la vérification de la connexion");
    } finally {
      setIsChecking(false);
    }
  };

  const checkSupabaseTables = async () => {
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (error) {
        console.error("Error checking tables:", error);
        return;
      }
      
      if (!data) {
        setMissingTables(requiredTables);
        return;
      }
      
      const existingTables = data.map(t => t.tablename);
      const missing = requiredTables.filter(table => !existingTables.includes(table));
      
      setMissingTables(missing);
      
      if (missing.length > 0) {
        toast.warning(`Tables manquantes: ${missing.join(', ')}`, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error checking tables:", error);
    }
  };

  const createMissingTables = async () => {
    try {
      toast.info("Tentative de création des tables manquantes...", { position: "bottom-right" });
      
      const success = await ensureLotteryTablesExist();
      
      if (success) {
        toast.success("Tables créées avec succès", { position: "bottom-right" });
        checkConnection();
      } else {
        toast.error("Erreur lors de la création des tables", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error creating tables:", error);
      toast.error("Erreur lors de la création des tables", { position: "bottom-right" });
    }
  };

  const checkLocalStorageData = () => {
    const data: Record<string, any> = {};
    const storage: Record<string, boolean> = {};
    
    requiredTables.forEach(table => {
      try {
        const stored = localStorage.getItem(table);
        if (stored) {
          const parsed = JSON.parse(stored);
          data[table] = parsed;
          storage[table] = Array.isArray(parsed) && parsed.length > 0;
        } else {
          data[table] = [];
          storage[table] = false;
        }
      } catch (e) {
        console.error(`Error parsing ${table} data:`, e);
        data[table] = [];
        storage[table] = false;
      }
    });
    
    setLocalData(data);
    setLocalStorageData(storage);
    
    // Check Supabase storage if connected
    if (isConnected) {
      checkSupabaseStorage();
    }
  };

  const checkSupabaseStorage = async () => {
    const storage: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      setIsLoading(prev => ({ ...prev, [table]: true }));
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);
          
        storage[table] = !error && count !== null && count > 0;
      } catch (e) {
        console.error(`Error checking ${table} data:`, e);
        storage[table] = false;
      } finally {
        setIsLoading(prev => ({ ...prev, [table]: false }));
      }
    }
    
    setSupabaseStorage(storage);
  };

  const getStorageStatus = (table: string) => {
    if (!localStorageData || !supabaseStorage) return 'loading';
    
    const local = localStorageData[table];
    const remote = supabaseStorage[table];
    
    if (local && remote) return 'both';
    if (local) return 'local';
    if (remote) return 'supabase';
    return 'none';
  };

  const syncTable = async (table: string) => {
    setIsLoading(prev => ({ ...prev, [table]: true }));
    
    try {
      if (!isConnected) {
        toast.error("Pas de connexion à Supabase", { position: "bottom-right" });
        return;
      }
      
      const localDataForTable = localData[table];
      
      if (!Array.isArray(localDataForTable) || localDataForTable.length === 0) {
        toast.warning(`Pas de données locales pour ${table}`, { position: "bottom-right" });
        return;
      }
      
      // Convert camelCase to snake_case for Supabase
      const preparedData = localDataForTable.map(item => {
        if (!item) return {};
        
        const result: any = { ...item };
        
        // Table-specific transformations
        if (table === 'lotteries') {
          if ('targetParticipants' in item) result.target_participants = item.targetParticipants;
          if ('currentParticipants' in item) result.current_participants = item.currentParticipants;
          if ('linkedProducts' in item) result.linked_products = item.linkedProducts;
          if ('endDate' in item) result.end_date = item.endDate;
          if ('drawDate' in item) result.draw_date = item.drawDate;
          
          // Remove fields that don't belong in the database
          delete result.targetParticipants;
          delete result.currentParticipants;
          delete result.linkedProducts;
          delete result.endDate;
          delete result.drawDate;
          delete result.participants;
          delete result.winner;
        }
      
        return result;
      });
      
      // Delete existing data
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .gt('id', 0);
        
      if (deleteError) {
        console.error(`Error clearing ${table}:`, deleteError);
        toast.error(`Erreur lors de la suppression des données de ${table}`, { position: "bottom-right" });
        return;
      }
      
      // Insert new data
      const { error: insertError } = await supabase
        .from(table)
        .insert(preparedData);
        
      if (insertError) {
        console.error(`Error inserting to ${table}:`, insertError);
        toast.error(`Erreur lors de l'insertion des données dans ${table}`, { position: "bottom-right" });
        return;
      }
      
      toast.success(`Synchronisation de ${table} réussie`, { position: "bottom-right" });
      checkSupabaseStorage();
    } catch (error) {
      console.error(`Error syncing ${table}:`, error);
      toast.error(`Erreur lors de la synchronisation de ${table}`, { position: "bottom-right" });
    } finally {
      setIsLoading(prev => ({ ...prev, [table]: false }));
    }
  };

  useEffect(() => {
    // Vérifier la connexion au chargement initial
    checkConnection();
  }, []);

  // Fonction pour obtenir le statut de connexion
  const renderConnectionStatus = () => {
    if (isChecking) {
      return (
        <div className="flex items-center text-yellow-400">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          <span>Vérification de la connexion...</span>
        </div>
      );
    }
    
    if (isConnected) {
      return (
        <div className="flex items-center text-green-400">
          <Check className="mr-2 h-4 w-4" />
          <span>Connecté à Supabase</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-red-400">
        <AlertCircle className="mr-2 h-4 w-4" />
        <span>Non connecté à Supabase</span>
        {connectionError && <span className="ml-2 text-xs opacity-75">({connectionError})</span>}
      </div>
    );
  };

  // Retourne l'icône de statut appropriée pour chaque table
  const getStorageStatusIcon = (table: string) => {
    const status = getStorageStatus(table);
    
    if (isLoading[table]) {
      return <Loader2 className="h-5 w-5 animate-spin text-winshirt-blue" />;
    }
    
    switch (status) {
      case 'both':
        return <Cloud className="h-4 w-4 text-green-400" />;
      case 'local':
        return <CloudOff className="h-4 w-4 text-yellow-400" />;
      case 'supabase':
        return <Database className="h-4 w-4 text-blue-400" />;
      case 'none':
      default:
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  // Obtenez un badge de statut pour chaque table
  const getStatusBadge = (table: string) => {
    const status = getStorageStatus(table);
    let variant = 'outline';
    let label = '';
    
    switch (status) {
      case 'both':
        variant = 'success';
        label = 'Local + Supabase';
        break;
      case 'local':
        variant = 'warning';
        label = 'Local uniquement';
        break;
      case 'supabase':
        variant = 'secondary';
        label = 'Supabase uniquement';
        break;
      case 'none':
        variant = 'destructive';
        label = 'Aucune donnée';
        break;
      default:
        label = 'Chargement...';
    }
    
    return <Badge variant={variant as any} className="ml-auto mr-2">{label}</Badge>;
  };

  return (
    <Card className="winshirt-card p-4 mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
        <Database className="h-5 w-5" />
        Outil de débogage Supabase
      </h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="font-semibold text-white">État de la connexion</span>
          </div>
          
          <div className="flex items-center gap-3">
            {renderConnectionStatus()}
            
            <Button
              size="sm"
              className="ml-2"
              onClick={checkConnection}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Vérifier la connexion
            </Button>
          </div>
        </div>
        
        <div className="bg-winshirt-space-darker p-3 rounded-md text-sm font-mono">
          <div>URL Supabase: https://uwgclposhhdovfjnazlp.supabase.co</div>
          <div>État de la connexion: {isConnected ? 'Connecté' : 'Non connecté'}</div>
          <div>Tables manquantes: {missingTables.length > 0 ? missingTables.join(', ') : 'Aucune'}</div>
        </div>
        
        {/* Actions en fonction de l'état */}
        {missingTables.length > 0 && isConnected && (
          <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-md">
            <p className="text-amber-200 mb-2">Des tables sont manquantes dans Supabase.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={createMissingTables}
              className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
            >
              <Database className="h-4 w-4 mr-2" />
              Créer les tables manquantes
            </Button>
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-red-950/30 border border-red-500/30 p-3 rounded-md">
            <p className="text-red-200 mb-2">La connexion à Supabase a échoué.</p>
            <div className="text-sm text-red-200/80">
              <p className="font-semibold">Instructions pour résoudre:</p>
              <ol className="list-decimal pl-4 mt-2 space-y-1">
                <li>Vérifiez que l'URL Supabase est correcte: https://uwgclposhhdovfjnazlp.supabase.co</li>
                <li>Assurez-vous que votre clé API Supabase est valide</li>
                <li>Cliquez sur le bouton "Vérifier la connexion" ci-dessus</li>
                <li>Si des tables sont manquantes, essayez de les créer avec le bouton ci-dessous</li>
              </ol>
            </div>
          </div>
        )}
        
        {/* Données locales */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Données locales</h3>
          <div className="bg-winshirt-space-darker rounded-md overflow-hidden">
            <div className="grid grid-cols-2 gap-2 p-2">
              {requiredTables.map(table => (
                <div key={table} className="flex items-center justify-between bg-winshirt-space-light p-2 rounded-md">
                  <div className="flex items-center">
                    {getStorageStatusIcon(table)}
                    <span className="ml-2">{table}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {getStatusBadge(table)}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isConnected || isLoading[table]}
                      onClick={() => syncTable(table)}
                      className="h-7 px-2 border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                    >
                      {isLoading[table] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span>Sync</span>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Problèmes détectés */}
        {(missingTables.length > 0 || !isConnected) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-red-400 flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              Problèmes détectés
            </h3>
            <div className="bg-red-950/30 border border-red-500/30 p-3 rounded-md text-red-200">
              <ul className="list-disc ml-5">
                {!isConnected && <li>La connexion à Supabase a échoué</li>}
                {missingTables.length > 0 && <li>Des tables requises sont manquantes</li>}
              </ul>
              
              <div className="mt-4">
                <p className="font-medium">Instructions pour résoudre:</p>
                <ol className="list-decimal ml-5 mt-1">
                  <li>Vérifiez que l'URL Supabase est correcte: https://uwgclposhhdovfjnazlp.supabase.co</li>
                  <li>Assurez-vous que votre clé API Supabase est valide</li>
                  <li>Cliquez sur le bouton "Vérifier la connexion" ci-dessus</li>
                  <li>Si des tables sont manquantes, essayez de les créer avec le bouton ci-dessous</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={checkLocalStorageData}
            className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SyncDebugTool;

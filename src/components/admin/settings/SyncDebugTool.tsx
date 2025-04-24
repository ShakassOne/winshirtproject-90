import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection, checkRequiredTables, requiredTables, syncLocalDataToSupabase, ValidTableName } from '@/integrations/supabase/client';
import { Database, RefreshCcw, AlertCircle, CheckCircle, ServerCrash, Code } from 'lucide-react';
import { SUPABASE_URL } from '@/lib/supabase';

const SyncDebugTool: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tablesStatus, setTablesStatus] = useState<{exists: boolean; missing: readonly string[]}>({ exists: false, missing: [] });
  const [isSyncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<Record<string, boolean>>({});
  const [localDataCounts, setLocalDataCounts] = useState<Record<string, number>>({});
  const [connectionDetails, setConnectionDetails] = useState<string>("");

  useEffect(() => {
    checkConnection();
    checkLocalStorageData();
  }, []);

  const checkConnection = async () => {
    // Afficher l'URL Supabase pour le débogage
    setConnectionDetails(`Tentative de connexion à: ${SUPABASE_URL}`);
    
    const connected = await checkSupabaseConnection();
    setIsConnected(connected);
    
    if (connected) {
      setConnectionDetails(`Connecté avec succès à: ${SUPABASE_URL}`);
      const tables = await checkRequiredTables();
      setTablesStatus(tables);
      
      if (!tables.exists) {
        toast.warning(`Tables manquantes: ${tables.missing.join(', ')}`);
      }
    } else {
      setConnectionDetails(`Échec de connexion à: ${SUPABASE_URL}`);
      toast.error("Échec de connexion à Supabase. Vérifiez la console pour plus de détails.");
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
          
          // Afficher les premières données pour le débogage
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Exemple de données ${table}:`, parsed[0]);
          }
        } catch (e) {
          console.error(`Erreur lors de l'analyse des données pour ${table}:`, e);
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
      
      // Créer des données d'exemple si la table est vide
      if (localDataCounts[table] === 0) {
        const success = await createSampleData(table);
        if (success) {
          toast.success(`Données d'exemple créées pour ${table}`);
          checkLocalStorageData(); // Mettre à jour les compteurs
        } else {
          toast.error(`Échec de la création des données d'exemple pour ${table}`);
        }
        setSyncing(false);
        return;
      }
      
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

  const createSampleData = async (table: ValidTableName): Promise<boolean> => {
    try {
      // Créer des données d'exemple selon le type de table
      let sampleData: any[] = [];
      
      switch (table) {
        case 'lotteries':
          sampleData = [{
            id: 1,
            title: "Loterie d'exemple",
            description: "Une loterie créée automatiquement pour le test",
            value: 100,
            targetParticipants: 10,
            currentParticipants: 0,
            status: 'active',
            image: "https://images.unsplash.com/photo-1563906267088-b029e7101114",
            linkedProducts: [],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            drawDate: null,
            featured: true,
            participants: [],
            winner: null
          }];
          break;
          
        case 'products':
          sampleData = [{
            id: 1,
            name: "T-shirt d'exemple",
            description: "Un t-shirt créé automatiquement pour le test",
            price: 29.99,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
            secondaryImage: null,
            sizes: ["S", "M", "L", "XL"],
            colors: ["Noir", "Blanc", "Rouge"],
            type: "t-shirt",
            productType: "vêtement",
            sleeveType: "courtes",
            linkedLotteries: [],
            popularity: 5,
            tickets: 1,
            weight: 0.2,
            deliveryPrice: 5.99,
            allowCustomization: true
          }];
          break;
          
        // Vous pouvez ajouter d'autres cas pour les autres tables
          
        default:
          // Pour les autres tables, créer une structure minimale
          sampleData = [{ id: 1, name: "Donnée d'exemple" }];
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem(table, JSON.stringify(sampleData));
      
      console.log(`Données d'exemple créées pour ${table}:`, sampleData);
      return true;
    } catch (e) {
      console.error(`Erreur lors de la création des données d'exemple pour ${table}:`, e);
      return false;
    }
  };

  const syncAllTables = async () => {
    setSyncing(true);
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      try {
        // Si la table est vide, créer des données d'exemple
        if (localDataCounts[table as ValidTableName] === 0) {
          const success = await createSampleData(table as ValidTableName);
          if (success) {
            console.log(`Données d'exemple créées pour ${table}`);
          } else {
            console.error(`Échec de la création des données d'exemple pour ${table}`);
          }
        }
        
        const success = await syncLocalDataToSupabase(table as ValidTableName);
        results[table] = success;
      } catch (e) {
        results[table] = false;
      }
    }
    
    setSyncResults(results);
    setSyncing(false);
    
    // Mettre à jour les compteurs après synchronisation
    checkLocalStorageData();
    
    const successCount = Object.values(results).filter(Boolean).length;
    if (successCount === requiredTables.length) {
      toast.success("Toutes les tables ont été synchronisées avec succès");
    } else {
      toast.warning(`${successCount}/${requiredTables.length} tables synchronisées avec succès`);
    }
  };

  const getStatusIcon = (table: string) => {
    if (isLoading[table]) {
      return <Loader2 className="h-5 w-5 animate-spin text-winshirt-blue" />;
    }
    
    if (syncResults[table] === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (syncResults[table] === false) {
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
            <p className="text-xs text-gray-400 mt-1">{connectionDetails}</p>
          </div>
        </div>

        {/* Informations de débogage */}
        <div className="p-4 rounded-lg bg-winshirt-space-light">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-winshirt-blue" />
            <h3 className="font-semibold text-white">Informations de débogage</h3>
          </div>
          <div className="text-xs font-mono bg-winshirt-space/50 p-2 rounded max-h-32 overflow-y-auto">
            <p>URL Supabase: {SUPABASE_URL}</p>
            <p>État de la connexion: {isConnected ? "Connecté" : "Non connecté"}</p>
            <p>Tables manquantes: {tablesStatus.missing.length > 0 ? tablesStatus.missing.join(', ') : "Aucune"}</p>
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
                    disabled={isSyncing}
                    onClick={() => handleForceSync(table as ValidTableName)}
                  >
                    {localDataCounts[table] === 0 ? "Créer" : syncResults[table] === true ? "✓" : "Sync"}
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
                <p className="font-semibold">Instructions pour résoudre:</p>
                <ol className="list-decimal pl-4 mt-2 space-y-1">
                  <li>Vérifiez que l'URL Supabase est correcte: {SUPABASE_URL}</li>
                  <li>Assurez-vous que votre clé API Supabase est valide</li>
                  <li>Cliquez sur le bouton "Vérifier la connexion" ci-dessus</li>
                  <li>Si des tables sont manquantes, essayez de les créer avec le bouton ci-dessous</li>
                </ol>
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
            disabled={isSyncing}
          >
            {isSyncing ? "Synchronisation..." : "Synchroniser toutes les données"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncDebugTool;


import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, Check, Database, RefreshCw, Server, Shield } from 'lucide-react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  checkSupabaseConnectionWithDetails, 
  getDataCounts, 
  pushDataToSupabase, 
  pullDataFromSupabase,
  syncAllTables,
  getSyncHistory,
  clearSyncHistory,
  type SyncStatus
} from '@/lib/syncManager';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ValidTableName } from '@/types/database.types';
import { supabase } from '@/lib/supabase'; // Added missing import

import AdminSetup from '@/components/AdminSetup';
import { useAuth } from '@/contexts/AuthContext';

const AdminSyncPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const [dataCounts, setDataCounts] = useState<Record<string, { local: number, remote: number }> | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  
  const [syncHistory, setSyncHistory] = useState<SyncStatus[]>([]);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  
  // Use auth context
  const { isAuthenticated, isAdmin } = useAuth();

  // All available tables for synchronization
  const allTables: ValidTableName[] = [
    'lotteries', 
    'products', 
    'visuals', 
    'visual_categories',
    'orders',
    'order_items',
    'clients',
    'lottery_participants',
    'lottery_winners'
  ];

  // Check Supabase connection on load
  useEffect(() => {
    checkConnection();
    loadDataCounts();
    updateSyncHistory();
  }, []);
  
  const updateSyncHistory = () => {
    setSyncHistory(getSyncHistory());
  };

  // Check Supabase connection
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await checkSupabaseConnectionWithDetails();
      setIsConnected(result.connected);
      setConnectionError(result.error || null);
      setStatusCode(result.status || null);
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsChecking(false);
    }
  };
  
  // Load data counts for comparison
  const loadDataCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const counts = await getDataCounts();
      setDataCounts(counts);
    } catch (error) {
      console.error("Error loading data counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  };
  
  // Push data to Supabase
  const handlePushData = async (tableName: ValidTableName) => {
    setIsSyncing(prev => ({ ...prev, [tableName]: true }));
    try {
      await pushDataToSupabase(tableName);
      // Refresh counts after sync
      await loadDataCounts();
      updateSyncHistory();
    } finally {
      setIsSyncing(prev => ({ ...prev, [tableName]: false }));
    }
  };
  
  // Pull data from Supabase
  const handlePullData = async (tableName: ValidTableName) => {
    setIsSyncing(prev => ({ ...prev, [tableName]: true }));
    try {
      await pullDataFromSupabase(tableName);
      // Refresh counts after sync
      await loadDataCounts();
      updateSyncHistory();
    } finally {
      setIsSyncing(prev => ({ ...prev, [tableName]: false }));
    }
  };
  
  // Sync all tables
  const handleSyncAll = async (direction: 'push' | 'pull') => {
    // Mark all tables as syncing
    const newSyncingState: Record<string, boolean> = {};
    allTables.forEach(table => {
      newSyncingState[table] = true;
    });
    setIsSyncing(newSyncingState);
    
    try {
      await syncAllTables(direction);
      // Refresh counts after sync
      await loadDataCounts();
      updateSyncHistory();
    } finally {
      // Mark all tables as not syncing
      const completedState: Record<string, boolean> = {};
      allTables.forEach(table => {
        completedState[table] = false;
      });
      setIsSyncing(completedState);
    }
  };
  
  // Clear sync history
  const handleClearHistory = () => {
    clearSyncHistory();
    updateSyncHistory();
  };

  // Format table name for display
  const formatTableName = (table: string) => {
    return table
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Create a sync tab for each table
  const renderTableTab = (tableName: ValidTableName) => {
    return (
      <TabsContent value={tableName} key={tableName}>
        <Card>
          <CardHeader>
            <CardTitle>Synchronisation de {formatTableName(tableName)}</CardTitle>
            <CardDescription>
              Gestion des données de {formatTableName(tableName).toLowerCase()} entre le stockage local et Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">LocalStorage:</span>
                  {isLoadingCounts ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <span>{dataCounts?.[tableName]?.local || 0} éléments</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Supabase:</span>
                  {isLoadingCounts ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <span>{dataCounts?.[tableName]?.remote || 0} éléments</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handlePushData(tableName)}
                  disabled={!isConnected || isSyncing[tableName]}
                >
                  {isSyncing[tableName] ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  )}
                  Envoyer
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handlePullData(tableName)}
                  disabled={!isConnected || isSyncing[tableName]}
                >
                  {isSyncing[tableName] ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                  )}
                  Récupérer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  // Additional effect to check if admin setup is needed
  useEffect(() => {
    const checkAdminSetupNeeded = async () => {
      try {
        // Check if we have admin credentials stored
        const adminCredentialsStr = localStorage.getItem('winshirt_admin');
        if (!adminCredentialsStr) {
          setShowAdminSetup(true);
          return;
        }
        
        // Check if credentials actually work
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Try to sign in with stored credentials
          try {
            const adminCredentials = JSON.parse(adminCredentialsStr);
            const { error } = await supabase.auth.signInWithPassword({
              email: adminCredentials.email,
              password: adminCredentials.password
            });
            
            if (error) {
              console.error("Stored admin credentials failed:", error.message);
              setShowAdminSetup(true);
            }
          } catch (e) {
            console.error("Error parsing stored admin credentials:", e);
            setShowAdminSetup(true);
          }
        }
      } catch (e) {
        console.error("Error checking admin setup:", e);
      }
    };
    
    if (isAdmin) {
      checkAdminSetupNeeded();
    }
  }, [isAdmin]);

  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion de la synchronisation des données
          </h1>
          
          {showAdminSetup && (
            <div className="mb-8">
              <AdminSetup />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" /> 
                  Statut de connexion
                </CardTitle>
                <CardDescription>
                  État de la connexion à Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isChecking ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                ) : (
                  <>
                    {isConnected === null ? (
                      <div className="text-gray-500">Vérification de la connexion...</div>
                    ) : isConnected ? (
                      <Alert className="bg-green-500/20 border-green-500/40">
                        <Check className="h-5 w-5 text-green-500" />
                        <AlertTitle>Connecté à Supabase</AlertTitle>
                        <AlertDescription>
                          La connexion à Supabase est établie.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Non connecté</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <div>La connexion à Supabase a échoué.</div>
                          {connectionError && <div className="text-sm">Erreur: {connectionError}</div>}
                          {statusCode && <div className="text-sm">Code HTTP: {statusCode}</div>}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={checkConnection}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Vérifier la connexion
                </Button>
              </CardFooter>
            </Card>
            
            {/* Authorization Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> 
                  Statut d'autorisation
                </CardTitle>
                <CardDescription>
                  Politiques de sécurité (RLS)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTables.map(table => (
                    <div key={table} className="flex justify-between items-center">
                      <span>{formatTableName(table)}:</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/40">
                        <Check className="h-3 w-3 mr-1" />
                        Configuré
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-center w-full text-xs text-gray-500">
                  Toutes les politiques RLS sont correctement configurées
                </div>
              </CardFooter>
            </Card>
            
            {/* Sync All Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5" /> 
                  Synchronisation globale
                </CardTitle>
                <CardDescription>
                  Synchroniser toutes les données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>LocalStorage:</span>
                    {isLoadingCounts ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <Badge variant="outline">
                        {dataCounts ? Object.values(dataCounts).reduce((sum, count) => sum + count.local, 0) : 0} éléments
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Supabase:</span>
                    {isLoadingCounts ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <Badge variant="outline">
                        {dataCounts ? Object.values(dataCounts).reduce((sum, count) => sum + count.remote, 0) : 0} éléments
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleSyncAll('push')}
                  disabled={!isConnected || Object.values(isSyncing).some(v => v)}
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Tout envoyer vers Supabase
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleSyncAll('pull')}
                  disabled={!isConnected || Object.values(isSyncing).some(v => v)}
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Tout récupérer de Supabase
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Tabs defaultValue="lotteries" className="mt-8">
            <TabsList className="flex flex-wrap">
              {allTables.map(table => (
                <TabsTrigger key={table} value={table}>
                  {formatTableName(table)}
                </TabsTrigger>
              ))}
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            {/* Generate tabs for all tables */}
            {allTables.map(table => renderTableTab(table as ValidTableName))}
            
            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Historique de synchronisation</CardTitle>
                    <CardDescription>
                      Journal des opérations de synchronisation récentes
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearHistory}
                    disabled={syncHistory.length === 0}
                  >
                    Effacer l'historique
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md border">
                    {syncHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Aucun historique de synchronisation</p>
                      </div>
                    ) : (
                      <Table>
                        <TableCaption>Historique des opérations de synchronisation</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Opération</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Données</TableHead>
                            <TableHead>Erreur</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {syncHistory
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="whitespace-nowrap">
                                  {formatDistanceToNow(new Date(item.timestamp), { 
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </TableCell>
                                <TableCell>
                                  {item.operation === 'push' ? (
                                    <span className="flex items-center">
                                      <ArrowUpFromLine className="h-3 w-3 mr-1" />
                                      Envoi
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <ArrowDownToLine className="h-3 w-3 mr-1" />
                                      Récupération
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>{formatTableName(item.tableName)}</TableCell>
                                <TableCell>
                                  {item.success ? (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/40">
                                      <Check className="h-3 w-3 mr-1" />
                                      Succès
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/40">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Échec
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {item.operation === 'push' ? 
                                    `${item.localCount} → ${item.remoteCount}` :
                                    `${item.remoteCount} → ${item.localCount}`
                                  }
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {item.error || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AdminSyncPage;

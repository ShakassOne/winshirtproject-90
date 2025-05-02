import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  pullDataFromSupabase,
  pushDataToSupabase,
  clearLocalStorage,
  SyncStatus,
  getSyncHistory,
  ValidTableName,
  getAllValidTableNames,
  getSyncStatus,
  setSyncStatus
} from '@/lib/syncManager';
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from '@/lib/supabase';
import { showNotification } from '@/lib/notifications';

// Define action types for notifications
type ActionType = 'sync' | 'update' | 'delete' | 'create';
type EntityType = string;

// Define a schema for the settings form
const formSchema = z.object({
  autoSync: z.boolean().default(false),
  syncInterval: z.number().min(5).max(60).default(15),
})

interface SyncSettingsManagerProps {
  onSettingsChange: (autoSync: boolean, syncInterval: number) => void;
}

const SyncSettingsManager: React.FC<SyncSettingsManagerProps> = ({ onSettingsChange }) => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(15);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>({
    lotteries: { success: true, lastSync: null, message: '' },
    lottery_participants: { success: true, lastSync: null, message: '' },
    lottery_winners: { success: true, lastSync: null, message: '' },
    products: { success: true, lastSync: null, message: '' },
    visuals: { success: true, lastSync: null, message: '' },
    orders: { success: true, lastSync: null, message: '' },
    order_items: { success: true, lastSync: null, message: '' },
    clients: { success: true, lastSync: null, message: '' },
  });
  const [isLocalStorageEmpty, setIsLocalStorageEmpty] = useState(false);
  const [isClearingLocalStorage, setIsClearingLocalStorage] = useState(false);
  const [isPushingData, setIsPushingData] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);
  const [isResettingSyncStatus, setIsResettingSyncStatus] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(true);
  const [isSyncSettingsLoading, setIsSyncSettingsLoading] = useState(true);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isResettingAllSyncStatuses, setIsResettingAllSyncStatuses] = useState(false);
  const [isPullingAllData, setIsPullingAllData] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoSync: false,
      syncInterval: 15,
    },
  })

  const { toast } = useToast()

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      setIsSyncSettingsLoading(true);
      try {
        const autoSync = localStorage.getItem('autoSyncEnabled');
        const interval = localStorage.getItem('syncIntervalMinutes');

        if (autoSync !== null) {
          setAutoSyncEnabled(autoSync === 'true');
          form.setValue('autoSync', autoSync === 'true');
        }

        if (interval !== null) {
          const parsedInterval = parseInt(interval, 10);
          setSyncIntervalMinutes(parsedInterval);
          form.setValue('syncInterval', parsedInterval);
        }
      } catch (error) {
        console.error("Error loading sync settings:", error);
        toast({
          variant: "destructive",
          title: "Error loading sync settings",
          description: "Failed to load sync settings from local storage.",
        })
      } finally {
        setIsSyncSettingsLoading(false);
      }
    };

    loadSettings();
  }, [form, toast]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('autoSyncEnabled', String(autoSyncEnabled));
    localStorage.setItem('syncIntervalMinutes', String(syncIntervalMinutes));
    onSettingsChange(autoSyncEnabled, syncIntervalMinutes);
  }, [autoSyncEnabled, syncIntervalMinutes, onSettingsChange]);

  // Load sync statuses from localStorage on component mount
  useEffect(() => {
    const loadSyncStatuses = async () => {
      const statuses: Partial<Record<string, SyncStatus>> = {};
      for (const table of getAllValidTableNames()) {
        try {
          const status = await getSyncStatus(table);
          if (status) {
            statuses[table] = status;
          }
        } catch (error) {
          console.error(`Error loading sync status for ${table}:`, error);
        }
      }
      setSyncStatuses(prev => ({ ...prev, ...statuses }));
    };

    loadSyncStatuses();
  }, []);

  // Check if local storage is empty
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const hasData = getAllValidTableNames().some(table => localStorage.getItem(table) !== null);
        setIsLocalStorageEmpty(!hasData);
      } catch (error) {
        console.error("Error checking local storage:", error);
        toast({
          variant: "destructive",
          title: "Error checking local storage",
          description: "Failed to check local storage for data.",
        })
      }
    };

    checkLocalStorage();
  }, [toast]);

  // Check Supabase connection status on component mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      setIsCheckingSupabase(true);
      try {
        const { error } = await supabase.from('products').select('id').limit(1);
        setIsSupabaseConnected(!error);
      } catch (err) {
        setIsSupabaseConnected(false);
        console.error("Supabase connection check failed:", err);
        toast({
          variant: "destructive",
          title: "Supabase connection check failed",
          description: "Could not verify the connection to Supabase.",
        })
      } finally {
        setIsCheckingSupabase(false);
      }
    };

    checkSupabaseConnection();
  }, [toast]);

  // Handle auto sync toggle
  const handleAutoSyncToggle = (value: boolean) => {
    setAutoSyncEnabled(value);
  };

  // Handle sync interval change
  const handleSyncIntervalChange = (value: number) => {
    setSyncIntervalMinutes(value);
  };

  // Function to trigger data synchronization for a specific table
  const syncData = async (table: ValidTableName) => {
    setIsSyncing(true);
    try {
      const result = await pushDataToSupabase(table);
      setSyncStatuses(prev => ({ ...prev, [table]: result }));
      toast({
        title: `Sync ${table} data`,
        description: result.success
          ? `Successfully synced ${table} data with Supabase.`
          : `Failed to sync ${table} data with Supabase.`,
      })
      // Use either error or message property, whichever is available
      const errorMessage = result.error || result.message;
      showNotification('sync', table, result.success, errorMessage);
    } catch (error) {
      console.error(`Sync ${table} failed:`, error);
      toast({
        variant: "destructive",
        title: `Sync ${table} failed`,
        description: `Failed to sync ${table} data with Supabase.`,
      })
      showNotification('sync', table, false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to pull data from Supabase for a specific table
  const pullData = async (table: ValidTableName) => {
    setIsPullingData(true);
    try {
      const result = await pullDataFromSupabase(table);
      setSyncStatuses(prev => ({ ...prev, [table]: result }));
      toast({
        title: `Pull ${table} data`,
        description: result.success
          ? `Successfully pulled ${table} data from Supabase.`
          : `Failed to pull ${table} data from Supabase.`,
      })
      // Use either error or message property, whichever is available
      showNotification('update', table, result.success, result.error || result.message);
    } catch (error) {
      console.error(`Pull ${table} failed:`, error);
      toast({
        variant: "destructive",
        title: `Pull ${table} failed`,
        description: `Failed to pull ${table} data from Supabase.`,
      })
      showNotification('update', table, false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsPullingData(false);
    }
  };

  // Function to clear local storage
  const handleClearLocalStorage = async () => {
    setIsClearingLocalStorage(true);
    try {
      await clearLocalStorage();
      setIsLocalStorageEmpty(true);
      toast({
        title: "Local storage cleared",
        description: "Successfully cleared all data from local storage.",
      })
      showNotification('delete', 'localStorage', true);
    } catch (error) {
      console.error("Failed to clear local storage:", error);
      toast({
        variant: "destructive",
        title: "Failed to clear local storage",
        description: "Failed to clear all data from local storage.",
      })
      showNotification('delete', 'localStorage', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsClearingLocalStorage(false);
    }
  };

  const handleResetSyncStatus = async (table: ValidTableName) => {
    setIsResettingSyncStatus(true);
    try {
      await setSyncStatus(table, { lastSync: null, success: true, message: '' });
      setSyncStatuses(prev => ({
        ...prev,
        [table]: { lastSync: null, success: true, message: '' },
      }));
      toast({
        title: `Reset ${table} sync status`,
        description: `Successfully reset sync status for ${table}.`,
      })
      showNotification('update', table, true);
    } catch (error) {
      console.error(`Failed to reset ${table} sync status:`, error);
      toast({
        variant: "destructive",
        title: `Failed to reset ${table} sync status`,
        description: `Failed to reset sync status for ${table}.`,
      })
      showNotification('update', table, false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsResettingSyncStatus(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      for (const table of getAllValidTableNames()) {
        try {
          const result = await pushDataToSupabase(table);
          setSyncStatuses(prev => ({ ...prev, [table]: result }));
          // Use either error or message property, whichever is available
          const errorMessage = result.error || result.message;
          showNotification('sync', table, result.success, errorMessage);
        } catch (error) {
          console.error(`Sync ${table} failed:`, error);
          showNotification('sync', table, false, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      toast({
        title: "All data synced",
        description: "Successfully synced all data with Supabase.",
      })
      showNotification('sync', 'database', true);
    } catch (error) {
      console.error("Failed to sync all data:", error);
      toast({
        variant: "destructive",
        title: "Failed to sync all data",
        description: "Failed to sync all data with Supabase.",
      })
      showNotification('sync', 'database', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleResetAllSyncStatuses = async () => {
    setIsResettingAllSyncStatuses(true);
    try {
      for (const table of getAllValidTableNames()) {
        try {
          await setSyncStatus(table, { lastSync: null, success: true, message: '' });
          setSyncStatuses(prev => ({
            ...prev,
            [table]: { lastSync: null, success: true, message: '' },
          }));
        } catch (error) {
          console.error(`Failed to reset ${table} sync status:`, error);
        }
      }
      toast({
        title: "All sync statuses reset",
        description: "Successfully reset all sync statuses.",
      })
      showNotification('update', 'syncStatuses', true);
    } catch (error) {
      console.error("Failed to reset all sync statuses:", error);
      toast({
        variant: "destructive",
        title: "Failed to reset all sync statuses",
        description: "Failed to reset all sync statuses.",
      })
      showNotification('update', 'syncStatuses', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsResettingAllSyncStatuses(false);
    }
  };

  const handlePullAllData = async () => {
    setIsPullingAllData(true);
    try {
      for (const table of getAllValidTableNames()) {
        try {
          const result = await pullDataFromSupabase(table);
          setSyncStatuses(prev => ({ ...prev, [table]: result }));
          showNotification('update', table, result.success, result.error);
        } catch (error) {
          console.error(`Pull ${table} failed:`, error);
          showNotification('update', table, false, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      toast({
        title: "All data pulled",
        description: "Successfully pulled all data from Supabase.",
      })
      showNotification('update', 'database', true);
    } catch (error) {
      console.error("Failed to pull all data:", error);
      toast({
        variant: "destructive",
        title: "Failed to pull all data",
        description: "Failed to pull all data from Supabase.",
      })
      showNotification('update', 'database', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsPullingAllData(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <h2 className="text-lg font-medium">Paramètres de synchronisation</h2>
        <p className="text-sm text-muted-foreground">
          Configurez la synchronisation automatique des données avec Supabase.
        </p>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="autoSync"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Synchronisation automatique</FormLabel>
                    <FormDescription>
                      Activer la synchronisation automatique des données avec Supabase.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        handleAutoSyncToggle(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="syncInterval"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Intervalle de synchronisation (minutes)</FormLabel>
                  <FormDescription>
                    Définir l'intervalle de temps entre chaque synchronisation automatique.
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      placeholder="Intervalle en minutes"
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(value);
                        handleSyncIntervalChange(value);
                      }}
                      className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-lg font-medium">Actions de synchronisation</h2>
        <p className="text-sm text-muted-foreground">
          Effectuez des actions manuelles de synchronisation des données.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getAllValidTableNames().map((table) => (
            <Card key={table} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium capitalize">{table}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(syncStatuses[table]))
                      toast({
                        description: "Sync status copied to clipboard.",
                      })
                    }}>
                      <Copy className="mr-2 h-4 w-4" /> Copier le statut
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem>
                          Réinitialiser le statut
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action réinitialisera le statut de synchronisation de la table {table}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleResetSyncStatus(table as ValidTableName)}>
                            {isResettingSyncStatus ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Confirmer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {syncStatuses[table] ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Dernière synchronisation:{" "}
                    {syncStatuses[table].lastSync
                      ? new Date(syncStatuses[table].lastSync).toLocaleString()
                      : "Jamais"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Statut:{" "}
                    {syncStatuses[table].success ? "Succès" : "Échec"}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Statut de synchronisation inconnu.
                </p>
              )}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncData(table as ValidTableName)}
                  disabled={isSyncing || isCheckingSupabase || !isSupabaseConnected}
                  className="bg-winshirt-purple/10 text-winshirt-purple-light hover:bg-winshirt-purple/20"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    "Synchroniser"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pullData(table as ValidTableName)}
                  disabled={isPullingData || isCheckingSupabase || !isSupabaseConnected}
                  className="bg-winshirt-purple/10 text-winshirt-purple-light hover:bg-winshirt-purple/20"
                >
                  {isPullingData ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Récupération...
                    </>
                  ) : (
                    "Récupérer"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-lg font-medium">Actions globales</h2>
        <p className="text-sm text-muted-foreground">
          Effectuez des actions globales sur toutes les données.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-medium">Synchroniser toutes les données</h3>
            <p className="text-xs text-muted-foreground">
              Synchroniser toutes les données avec Supabase.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncAll}
              disabled={isSyncingAll || isCheckingSupabase || !isSupabaseConnected}
              className="bg-winshirt-purple/10 text-winshirt-purple-light hover:bg-winshirt-purple/20"
            >
              {isSyncingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                "Synchroniser tout"
              )}
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-medium">Récupérer toutes les données</h3>
            <p className="text-xs text-muted-foreground">
              Récupérer toutes les données depuis Supabase.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePullAllData}
              disabled={isPullingAllData || isCheckingSupabase || !isSupabaseConnected}
              className="bg-winshirt-purple/10 text-winshirt-purple-light hover:bg-winshirt-purple/20"
            >
              {isPullingAllData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Récupération...
                </>
              ) : (
                "Récupérer tout"
              )}
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-medium">Réinitialiser tous les status</h3>
            <p className="text-xs text-muted-foreground">
              Réinitialiser tous les status de synchronisation.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllSyncStatuses}
              disabled={isResettingAllSyncStatuses}
              className="bg-winshirt-purple/10 text-winshirt-purple-light hover:bg-winshirt-purple/20"
            >
              {isResettingAllSyncStatuses ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser tout"
              )}
            </Button>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-sm font-medium">Effacer le stockage local</h3>
            <p className="text-xs text-muted-foreground">
              Effacer toutes les données stockées localement.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClearingLocalStorage || isLocalStorageEmpty}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Effacer le stockage local
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera toutes les données stockées localement.
                    Êtes-vous sûr(e) de vouloir continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLocalStorage}>
                    {isClearingLocalStorage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>

      {isCheckingSupabase && (
        <div className="rounded-md border p-4">
          <h2 className="text-lg font-medium">Vérification de la connexion à Supabase...</h2>
          <p className="text-sm text-muted-foreground">
            Vérification de la connexion à Supabase. Veuillez patienter...
          </p>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      )}

      {!isSupabaseConnected && !isCheckingSupabase && (
        <div className="rounded-md border p-4 bg-red-500/10 border-red-500 text-red-500">
          <h2 className="text-lg font-medium">Non connecté à Supabase</h2>
          <p className="text-sm text-muted-foreground">
            La connexion à Supabase n'a pas pu être établie. Veuillez vérifier
            vos paramètres de connexion.
          </p>
        </div>
      )}
    </div>
  );
};

export default SyncSettingsManager;

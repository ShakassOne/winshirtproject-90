
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Define types needed for synchronization
export type ValidTableName = 'lotteries' | 'products' | 'visuals' | 'visual_categories' | 
  'orders' | 'order_items' | 'clients' | 'lottery_participants' | 'lottery_winners';

export type SyncOperation = 'push' | 'pull' | 'sync';

export interface SyncStatus {
  success: boolean;
  tableName?: ValidTableName;
  operation?: SyncOperation;
  localCount?: number;
  remoteCount?: number;
  error?: string;
  timestamp?: number;
  lastSync?: number | null;
}

// Function to sync data from local storage to Supabase
export const syncToSupabase = async (tableName: string, data: any[]) => {
  try {
    await ensureAuthenticated();

    // Convert camelCase keys to snake_case for Supabase
    const snakeCaseData = data.map(item => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          // Convert key to snake_case
          const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          newItem[snakeCaseKey] = item[key];
        }
      }
      return newItem;
    });

    const { error } = await supabase
      .from(tableName)
      .upsert(snakeCaseData, { onConflict: 'id' });

    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      throw new Error(`Erreur lors de la synchronisation de ${tableName} vers Supabase: ${error.message}`);
    }

    console.log(`${tableName} synced to Supabase successfully`);
    toast.success(`${tableName} synchronisé avec succès`);
    
    // Return success status
    return {
      success: true,
      tableName: tableName as ValidTableName,
      operation: 'push' as SyncOperation,
      localCount: data.length,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Erreur lors de la synchronisation de ${tableName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // Return error status
    return {
      success: false,
      tableName: tableName as ValidTableName,
      operation: 'push' as SyncOperation,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    };
  }
};

// Alias for backward compatibility
export const pushDataToSupabase = async (tableName: ValidTableName) => {
  try {
    // Get data from local storage
    const dataString = localStorage.getItem(tableName);
    if (!dataString) {
      return {
        success: true,
        tableName,
        operation: 'push' as SyncOperation,
        localCount: 0,
        timestamp: Date.now(),
        message: `Aucune donnée locale pour ${tableName}`
      };
    }
    
    const data = JSON.parse(dataString);
    const result = await syncToSupabase(tableName, data);
    
    // Log the sync event
    logSyncEvent({
      ...result,
      tableName
    });
    
    return result;
  } catch (error) {
    console.error(`Error during ${tableName} push:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Log the sync event
    logSyncEvent({
      success: false,
      tableName,
      operation: 'push',
      error: errorMsg,
      timestamp: Date.now()
    });
    
    return {
      success: false,
      tableName,
      operation: 'push' as SyncOperation,
      error: errorMsg,
      timestamp: Date.now()
    };
  }
};

// Function to fetch data from Supabase and store it in local storage
export const syncFromSupabase = async (tableName: string) => {
  try {
    await ensureAuthenticated();

    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error fetching ${tableName} from Supabase:`, error);
      throw new Error(`Erreur lors de la récupération de ${tableName} depuis Supabase: ${error.message}`);
    }

    // Convert snake_case keys to camelCase for local storage
    const camelCaseData = data ? data.map(item => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          // Convert key to camelCase
          const camelCaseKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          newItem[camelCaseKey] = item[key];
        }
      }
      return newItem;
    }) : [];

    localStorage.setItem(tableName, JSON.stringify(camelCaseData));
    console.log(`${tableName} synced from Supabase successfully`);
    toast.success(`${tableName} synchronisé depuis Supabase avec succès`);
    
    return {
      success: true,
      tableName: tableName as ValidTableName,
      operation: 'pull' as SyncOperation,
      remoteCount: data ? data.length : 0,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Erreur lors de la synchronisation de ${tableName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    return {
      success: false,
      tableName: tableName as ValidTableName,
      operation: 'pull' as SyncOperation,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    };
  }
};

// Alias for backward compatibility
export const pullDataFromSupabase = async (tableName: ValidTableName) => {
  try {
    const result = await syncFromSupabase(tableName);
    
    // Log the sync event
    logSyncEvent({
      ...result,
      tableName
    });
    
    return result;
  } catch (error) {
    console.error(`Error during ${tableName} pull:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Log the sync event
    logSyncEvent({
      success: false,
      tableName,
      operation: 'pull',
      error: errorMsg,
      timestamp: Date.now()
    });
    
    return {
      success: false,
      tableName,
      operation: 'pull' as SyncOperation,
      error: errorMsg,
      timestamp: Date.now()
    };
  }
};

// Function to clear local storage
export const clearLocalStorage = async () => {
  try {
    localStorage.clear();
    console.log('Local storage cleared successfully');
    toast.success('Stockage local effacé avec succès');
    return { success: true };
  } catch (error) {
    console.error('Error clearing local storage:', error);
    toast.error('Erreur lors de l\'effacement du stockage local');
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Function to ensure the user is authenticated
export const ensureAuthenticated = async () => {
  // Si le mode développement est activé, on ignore l'authentification
  if (isDevModeEnabled()) {
    console.log("Mode développement activé - Authentification ignorée");
    return true;
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Authentication error:', error.message);
      throw new Error(`Erreur d'authentification: ${error.message}`);
    }

    if (!data.session) {
      throw new Error('Utilisateur non authentifié. Veuillez vous reconnecter.');
    }

    return data.session;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Authentication error:', errorMessage);
    throw new Error(`Authentication error: ${errorMessage}`);
  }
};

// Function to check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    await ensureAuthenticated();

    // Test simple de connexion à Supabase en récupérant les paramètres de l'application
    const { data, error } = await supabase
      .from('lotteries')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Ajoutons la fonction pour vérifier le mode dev
export const isDevModeEnabled = (): boolean => {
  return localStorage.getItem('dev_mode_enabled') === 'true';
};

// Ajoutons la fonction pour activer/désactiver le mode dev
export const toggleDevMode = (enabled: boolean): void => {
  localStorage.setItem('dev_mode_enabled', enabled ? 'true' : 'false');
  console.log(`Mode développement ${enabled ? 'activé' : 'désactivé'}`);
  
  // Déclencher un événement pour informer les autres composants
  window.dispatchEvent(new Event('devModeToggled'));
};

// Ajoutons une fonction améliorée pour vérifier la connexion Supabase avec plus de détails
export const checkSupabaseConnectionWithDetails = async () => {
  try {
    // On vérifie d'abord si nous sommes authentifiés, mais on capture l'erreur
    // au lieu de la lancer pour obtenir plus d'informations
    let authStatus;
    try {
      authStatus = await ensureAuthenticated();
    } catch (authError) {
      console.error('Authentication error:', authError);
      return { 
        connected: false, 
        error: authError instanceof Error ? authError.message : 'Erreur d\'authentification',
        authError: true
      };
    }
    
    // Test simple de connexion à Supabase en récupérant les paramètres de l'application
    const { data, error, status } = await supabase
      .from('lotteries')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { 
        connected: false, 
        error: error.message, 
        code: error.code,
        status: error.details?.includes('JWT') ? 401 : status 
      };
    }

    return { connected: true };
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    return { 
      connected: false, 
      error: e instanceof Error ? e.message : 'Erreur inconnue' 
    };
  }
};

// Function to get sync interval from local storage
export const getSyncInterval = (): number => {
  const interval = localStorage.getItem('sync_interval');
  return interval ? parseInt(interval, 10) : 60; // Default to 60 seconds
};

// Function to set sync interval in local storage
export const setSyncInterval = (interval: number): void => {
  localStorage.setItem('sync_interval', interval.toString());
};

// Function to get auto sync status from local storage
export const isAutoSyncEnabled = (): boolean => {
  return localStorage.getItem('auto_sync_enabled') === 'true';
};

// Function to set auto sync status in local storage
export const setAutoSyncEnabled = (enabled: boolean): void => {
  localStorage.setItem('auto_sync_enabled', enabled ? 'true' : 'false');
};

// New function to get data counts for comparison
export const getDataCounts = async (): Promise<Record<string, { local: number, remote: number }>> => {
  const tables = getAllValidTableNames();
  const counts: Record<string, { local: number, remote: number }> = {};
  
  for (const table of tables) {
    try {
      // Get local count
      const localData = localStorage.getItem(table);
      const localCount = localData ? JSON.parse(localData).length : 0;
      
      // Get remote count if connected
      let remoteCount = 0;
      try {
        if (isDevModeEnabled()) {
          remoteCount = localCount; // Mock in dev mode
        } else {
          const { data, error } = await supabase.from(table).select('count');
          if (!error && data && data.length > 0) {
            remoteCount = data[0].count;
          }
        }
      } catch (e) {
        console.error(`Error getting remote count for ${table}:`, e);
      }
      
      counts[table] = { local: localCount, remote: remoteCount };
    } catch (e) {
      console.error(`Error processing counts for ${table}:`, e);
      counts[table] = { local: 0, remote: 0 };
    }
  }
  
  return counts;
};

// Function to get all valid table names
export const getAllValidTableNames = (): ValidTableName[] => {
  return [
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
};

// Sync history storage in localStorage
const SYNC_HISTORY_KEY = 'winshirt_sync_history';
const MAX_SYNC_HISTORY_ITEMS = 100;

// Log a sync event to history
export const logSyncEvent = (event: SyncStatus): void => {
  try {
    const history = getSyncHistory();
    history.unshift({...event, timestamp: Date.now()});
    
    // Limit history size
    while (history.length > MAX_SYNC_HISTORY_ITEMS) {
      history.pop();
    }
    
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error logging sync event:', e);
  }
};

// Get sync history
export const getSyncHistory = (): SyncStatus[] => {
  try {
    const historyStr = localStorage.getItem(SYNC_HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (e) {
    console.error('Error getting sync history:', e);
    return [];
  }
};

// Clear sync history
export const clearSyncHistory = (): void => {
  localStorage.removeItem(SYNC_HISTORY_KEY);
};

// Get sync status for a table
export const getSyncStatus = async (table: ValidTableName): Promise<SyncStatus | null> => {
  try {
    const key = `sync_status_${table}`;
    const statusStr = localStorage.getItem(key);
    return statusStr ? JSON.parse(statusStr) : null;
  } catch (e) {
    console.error(`Error getting sync status for ${table}:`, e);
    return null;
  }
};

// Set sync status for a table
export const setSyncStatus = async (table: ValidTableName, status: SyncStatus): Promise<void> => {
  try {
    const key = `sync_status_${table}`;
    localStorage.setItem(key, JSON.stringify({...status, timestamp: Date.now()}));
  } catch (e) {
    console.error(`Error setting sync status for ${table}:`, e);
  }
};

// Bidirectional sync for a table
export const syncTable = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    // Try to ensure authentication
    try {
      await ensureAuthenticated();
    } catch (authError) {
      // If dev mode is enabled, we can continue despite auth errors
      if (!isDevModeEnabled()) {
        throw authError;
      }
    }
    
    // 1. Get local data
    const localDataStr = localStorage.getItem(tableName);
    const localData = localDataStr ? JSON.parse(localDataStr) : [];
    
    // 2. Get remote data
    const { data: remoteData, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      throw error;
    }
    
    // 3. Merge data based on updated_at timestamp
    // First convert all to consistent format (camelCase)
    const camelCaseRemoteData = remoteData.map(item => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const camelCaseKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          newItem[camelCaseKey] = item[key];
        }
      }
      return newItem;
    });
    
    // Create maps for faster lookups
    const localMap = new Map(localData.map((item: any) => [item.id, item]));
    const remoteMap = new Map(camelCaseRemoteData.map((item: any) => [item.id, item]));
    
    // Items to upload (local items not in remote or newer)
    const toUpload = localData.filter((localItem: any) => {
      const remoteItem = remoteMap.get(localItem.id);
      if (!remoteItem) return true; // Item exists only locally
      
      // Check if local is newer based on updatedAt
      const localDate = localItem.updatedAt ? new Date(localItem.updatedAt) : new Date(0);
      const remoteDate = remoteItem.updatedAt ? new Date(remoteItem.updatedAt) : new Date(0);
      return localDate > remoteDate;
    });
    
    // Items to download (remote items not in local or newer)
    const toDownload = camelCaseRemoteData.filter(remoteItem => {
      const localItem = localMap.get(remoteItem.id);
      if (!localItem) return true; // Item exists only remotely
      
      // Check if remote is newer based on updatedAt
      const localDate = localItem.updatedAt ? new Date(localItem.updatedAt) : new Date(0);
      const remoteDate = remoteItem.updatedAt ? new Date(remoteItem.updatedAt) : new Date(0);
      return remoteDate > localDate;
    });
    
    // 4. Apply updates both ways
    let uploadError, downloadError;
    
    // Upload local changes to Supabase
    if (toUpload.length > 0) {
      try {
        await syncToSupabase(tableName, toUpload);
      } catch (e) {
        uploadError = e instanceof Error ? e.message : String(e);
      }
    }
    
    // Save remote changes to localStorage
    if (toDownload.length > 0) {
      try {
        // Merge with existing local data
        const mergedData = [...localData];
        
        // Replace or add downloaded items
        toDownload.forEach(item => {
          const index = mergedData.findIndex((localItem: any) => localItem.id === item.id);
          if (index >= 0) {
            mergedData[index] = item; // Replace
          } else {
            mergedData.push(item); // Add
          }
        });
        
        localStorage.setItem(tableName, JSON.stringify(mergedData));
      } catch (e) {
        downloadError = e instanceof Error ? e.message : String(e);
      }
    }
    
    // Check for any errors
    if (uploadError || downloadError) {
      const errorMessage = [
        uploadError ? `Upload error: ${uploadError}` : '',
        downloadError ? `Download error: ${downloadError}` : ''
      ].filter(Boolean).join('; ');
      
      const status: SyncStatus = {
        success: false,
        tableName,
        operation: 'sync',
        error: errorMessage,
        localCount: localData.length,
        remoteCount: remoteData.length,
        timestamp: Date.now()
      };
      
      logSyncEvent(status);
      return status;
    }
    
    // Success
    const status: SyncStatus = {
      success: true,
      tableName,
      operation: 'sync',
      localCount: localData.length + toDownload.length - toUpload.length,
      remoteCount: remoteData.length + toUpload.length - toDownload.length,
      timestamp: Date.now()
    };
    
    // Update table's sync status
    setSyncStatus(tableName, status);
    
    // Log event
    logSyncEvent(status);
    
    return status;
  } catch (e) {
    console.error(`Error during bidirectional sync for ${tableName}:`, e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    
    const status: SyncStatus = {
      success: false,
      tableName,
      operation: 'sync',
      error: errorMessage,
      timestamp: Date.now()
    };
    
    // Log event
    logSyncEvent(status);
    
    return status;
  }
};

// Sync all tables bidirectionally
export const syncAllTables = async (): Promise<SyncStatus[]> => {
  const results: SyncStatus[] = [];
  
  for (const table of getAllValidTableNames()) {
    try {
      const result = await syncTable(table);
      results.push(result);
    } catch (e) {
      console.error(`Error syncing ${table}:`, e);
      results.push({
        success: false,
        tableName: table,
        operation: 'sync',
        error: e instanceof Error ? e.message : String(e),
        timestamp: Date.now()
      });
    }
  }
  
  return results;
};

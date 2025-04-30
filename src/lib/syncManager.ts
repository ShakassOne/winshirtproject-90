
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { snakeToCamel, camelToSnake } from '@/lib/supabase';
import type { ValidTableName } from '@/integrations/supabase/client';

/**
 * Interface for defining synchronization status
 */
export interface SyncStatus {
  success: boolean;
  tableName: string;
  localCount: number;
  remoteCount: number;
  operation: 'push' | 'pull';
  error?: string;
  httpCode?: number;
  timestamp: number;
}

// Track the history of synchronizations
const syncHistory: SyncStatus[] = [];

/**
 * Log a synchronization event
 */
const logSyncEvent = (status: SyncStatus): void => {
  syncHistory.push(status);
  // Limit history to last 100 entries
  if (syncHistory.length > 100) {
    syncHistory.shift();
  }
};

/**
 * Get synchronization history
 */
export const getSyncHistory = (): SyncStatus[] => {
  return [...syncHistory];
};

/**
 * Clear synchronization history
 */
export const clearSyncHistory = (): void => {
  syncHistory.length = 0;
};

/**
 * Test connection to Supabase
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing Supabase connection...");
    const { data, error, status } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      console.error("HTTP Status:", status);
      return false;
    }
    
    console.log("Supabase connection successful!");
    return true;
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return false;
  }
};

/**
 * Get data counts for local and remote storage
 */
export const getDataCounts = async (): Promise<Record<string, { local: number, remote: number }>> => {
  const tables: ValidTableName[] = [
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
  
  const results: Record<string, { local: number, remote: number }> = {};

  for (const table of tables) {
    // Get local count
    const localData = localStorage.getItem(table);
    const localCount = localData ? JSON.parse(localData).length : 0;
    
    // Get remote count
    let remoteCount = 0;
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        remoteCount = count;
      }
    } catch (e) {
      console.error(`Error getting remote count for ${table}:`, e);
    }
    
    results[table] = { local: localCount, remote: remoteCount };
  }

  return results;
};

/**
 * Push data from local storage to Supabase using upsert
 */
export const pushDataToSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    console.log(`Starting synchronization: pushing ${tableName} to Supabase...`);
    
    // Check connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      const error = "Unable to connect to Supabase";
      toast.error(`Sync failed: ${error}`, { position: "bottom-right" });
      
      const status: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'push',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(status);
      return status;
    }
    
    // Get local data
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      const error = `No local ${tableName} data to sync`;
      toast.warning(error, { position: "bottom-right" });
      
      const status: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'push',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(status);
      return status;
    }
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      const error = `No ${tableName} data to sync`;
      toast.warning(error, { position: "bottom-right" });
      
      const status: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'push',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(status);
      return status;
    }
    
    // Convert data from camelCase to snake_case for Supabase with special handling for visuals table
    const supabaseData = parsedData.map(item => {
      // Special handling for visuals table
      if (tableName === 'visuals') {
        const processedItem = { ...item };
        if (processedItem.image) {
          processedItem.image_url = processedItem.image;
          delete processedItem.image;
        }
        return camelToSnake(processedItem);
      }
      return camelToSnake(item);
    });
    
    console.log(`Prepared ${supabaseData.length} items for Supabase in table ${tableName}`);
    
    // Use upsert instead of delete+insert to preserve IDs and related references
    // Fix: Remove the select('count') that was causing the error
    const { error, status } = await supabase
      .from(tableName)
      .upsert(supabaseData, { 
        onConflict: 'id', // Use 'id' as the conflict resolution column
        ignoreDuplicates: false // Update existing records
      });
      
    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      console.error("HTTP Status:", status);
      
      toast.error(`Sync failed: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
      
      const syncStatus: SyncStatus = {
        success: false,
        tableName,
        localCount: parsedData.length,
        remoteCount: 0,
        operation: 'push',
        error: error.message,
        httpCode: status,
        timestamp: Date.now()
      };
      logSyncEvent(syncStatus);
      return syncStatus;
    }
    
    // Get updated remote count in a separate query
    const { count: remoteCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    toast.success(`Successfully synced ${parsedData.length} ${tableName} to Supabase`, { position: "bottom-right" });
    
    const syncStatus: SyncStatus = {
      success: true,
      tableName,
      localCount: parsedData.length,
      remoteCount: remoteCount || 0,
      operation: 'push',
      timestamp: Date.now()
    };
    logSyncEvent(syncStatus);
    return syncStatus;
  } catch (error: any) {
    console.error(`Error during ${tableName} sync:`, error);
    
    toast.error(`Sync error: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
    
    const syncStatus: SyncStatus = {
      success: false,
      tableName,
      localCount: 0,
      remoteCount: 0,
      operation: 'push',
      error: error.message || 'Unknown error',
      timestamp: Date.now()
    };
    logSyncEvent(syncStatus);
    return syncStatus;
  }
};

/**
 * Pull data from Supabase to local storage
 */
export const pullDataFromSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    console.log(`Starting synchronization: pulling ${tableName} from Supabase...`);
    
    // Check connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      const error = "Unable to connect to Supabase";
      toast.error(`Sync failed: ${error}`, { position: "bottom-right" });
      
      const status: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'pull',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(status);
      return status;
    }
    
    // Get data from Supabase
    const { data, error, status } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      console.error(`Error fetching ${tableName} from Supabase:`, error);
      console.error("HTTP Status:", status);
      
      toast.error(`Sync failed: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
      
      const syncStatus: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'pull',
        error: error.message,
        httpCode: status,
        timestamp: Date.now()
      };
      logSyncEvent(syncStatus);
      return syncStatus;
    }
    
    if (!data || data.length === 0) {
      const warning = `No ${tableName} found in Supabase`;
      toast.warning(warning, { position: "bottom-right" });
      
      const syncStatus: SyncStatus = {
        success: true,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'pull',
        timestamp: Date.now()
      };
      logSyncEvent(syncStatus);
      return syncStatus;
    }
    
    // Convert data from snake_case to camelCase for local storage
    // with special handling for visuals table
    const localData = data.map(item => {
      if (tableName === 'visuals') {
        // Convert from Supabase format to local app format
        const camelItem = snakeToCamel(item);
        if (camelItem.imageUrl && !camelItem.image) {
          camelItem.image = camelItem.imageUrl;
          delete camelItem.imageUrl;
        }
        return camelItem;
      }
      return snakeToCamel(item);
    });
    
    // Save to localStorage
    localStorage.setItem(tableName, JSON.stringify(localData));
    
    // Dispatch event to notify components of the update
    const event = new Event('storageUpdate');
    window.dispatchEvent(event);
    
    toast.success(`Successfully pulled ${data.length} ${tableName} from Supabase`, { position: "bottom-right" });
    
    const syncStatus: SyncStatus = {
      success: true,
      tableName,
      localCount: localData.length,
      remoteCount: data.length,
      operation: 'pull',
      timestamp: Date.now()
    };
    logSyncEvent(syncStatus);
    return syncStatus;
  } catch (error: any) {
    console.error(`Error during ${tableName} sync:`, error);
    
    toast.error(`Sync error: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
    
    const syncStatus: SyncStatus = {
      success: false,
      tableName,
      localCount: 0,
      remoteCount: 0,
      operation: 'pull',
      error: error.message || 'Unknown error',
      timestamp: Date.now()
    };
    logSyncEvent(syncStatus);
    return syncStatus;
  }
};

/**
 * Sync all tables data between local storage and Supabase
 */
export const syncAllTables = async (direction: 'push' | 'pull'): Promise<SyncStatus[]> => {
  const tables: ValidTableName[] = [
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
  
  const results: SyncStatus[] = [];
  
  for (const table of tables) {
    const result = direction === 'push' 
      ? await pushDataToSupabase(table)
      : await pullDataFromSupabase(table);
    results.push(result);
  }
  
  return results;
};

/**
 * Wrapper for checking Supabase connection with better error handling
 */
export const checkSupabaseConnectionWithDetails = async (): Promise<{
  connected: boolean;
  error?: string;
  status?: number;
}> => {
  try {
    const { data, error, status } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        connected: false,
        error: error.message,
        status
      };
    }
    
    return { connected: true };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Unknown error'
    };
  }
};

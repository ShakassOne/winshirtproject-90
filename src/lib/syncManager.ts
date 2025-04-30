
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { snakeToCamel, camelToSnake } from '@/lib/supabase';
import type { ValidTableName } from '@/types/database.types';

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
 * Create a mock user session for anonymous operations if needed
 */
const ensureAuthSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log("No authenticated session found, attempting to sign in as admin...");
    
    try {
      // Try to sign in with a stored admin user if available
      const adminCredentials = localStorage.getItem('winshirt_admin');
      if (adminCredentials) {
        const { email, password } = JSON.parse(adminCredentials);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!error) {
          console.log("Successfully signed in with stored admin credentials");
          return true;
        }
      }
      
      // If admin sign-in failed, try with the hardcoded admin
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@winshirt.com",
        password: "admin123"
      });
      
      if (!error) {
        console.log("Successfully signed in with default admin credentials");
        return true;
      }
      
      console.error("Failed to authenticate with admin credentials");
      return false;
    } catch (error) {
      console.error("Error during authentication attempt:", error);
      return false;
    }
  }
  
  return true;
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
    
    // Make sure we have an authenticated session
    // CRITICAL FIX: Ensure we're authenticated before attempting data ops
    const isAuthenticated = await ensureAuthSession();
    
    if (!isAuthenticated) {
      const error = "Authentication failed. Cannot sync data without a valid session.";
      toast.error(error, { position: "bottom-right" });
      
      const status: SyncStatus = {
        success: false,
        tableName,
        localCount: parsedData.length,
        remoteCount: 0, 
        operation: 'push',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(status);
      return status;
    }
    
    // Convert data from camelCase to snake_case for Supabase with special handling for specific tables
    const supabaseData = parsedData.map(item => {
      // Special handling for clients table - structure the address field correctly
      if (tableName === 'clients') {
        const processedItem = { ...item };
        
        // Ensure we have a valid address object
        if (typeof processedItem.address === 'string') {
          // If address is a string, convert it to an object
          processedItem.address = {
            address: processedItem.address,
            city: processedItem.city || null,
            postal_code: processedItem.postalCode || null,
            country: processedItem.country || null
          };
          
          // Remove separate fields that are now part of address
          delete processedItem.city;
          delete processedItem.postalCode;
          delete processedItem.country;
        } else if (!processedItem.address) {
          // If no address, create an empty one with the fields from the client
          processedItem.address = {
            address: '',
            city: processedItem.city || null,
            postal_code: processedItem.postalCode || null,
            country: processedItem.country || null
          };
          
          // Remove separate fields that are now part of address
          delete processedItem.city;
          delete processedItem.postalCode;
          delete processedItem.country;
        }
        
        return camelToSnake(processedItem);
      }
      // Special handling for visuals table
      else if (tableName === 'visuals') {
        const processedItem = { ...item };
        if (processedItem.image) {
          processedItem.image_url = processedItem.image;
          delete processedItem.image;
        }
        return camelToSnake(processedItem);
      }
      
      // Default case - just convert camelCase to snake_case
      return camelToSnake(item);
    });
    
    console.log(`Prepared ${supabaseData.length} items for Supabase in table ${tableName}`);

    // Upsert the data using the authenticated session
    const { error, status } = await supabase
      .from(tableName)
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
    
    // Make sure we have an authenticated session for tables that need it
    // CRITICAL FIX: Ensure we're authenticated before attempting data ops
    const isAuthenticated = await ensureAuthSession();
    
    if (!isAuthenticated && ['clients', 'orders', 'order_items'].includes(tableName)) {
      const error = "Authentication failed. Cannot pull protected data without a valid session.";
      toast.error(error, { position: "bottom-right" });
      
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
      
      toast.error(`Sync failed: ${error.message || 'Unknown error'}`, { position: "top-right" });
      
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
      toast.warning(warning, { position: "top-right" });
      
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
    const localData = data.map(item => {
      // Special handling for specific tables
      if (tableName === 'clients') {
        // Convert Supabase client format to local app format
        const camelItem = snakeToCamel(item);
        
        // Extract address fields if they exist
        if (camelItem.address && typeof camelItem.address === 'object') {
          camelItem.city = camelItem.address.city || '';
          camelItem.postalCode = camelItem.address.postal_code || camelItem.address.postalCode || '';
          camelItem.country = camelItem.address.country || '';
          // Keep address as the street address string
          if (typeof camelItem.address.address === 'string') {
            camelItem.address = camelItem.address.address;
          }
        }
        
        return camelItem;
      }
      else if (tableName === 'visuals') {
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
    
    toast.success(`Successfully pulled ${data.length} ${tableName} from Supabase`, { position: "top-right" });
    
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
    
    toast.error(`Sync error: ${error.message || 'Unknown error'}`, { position: "top-right" });
    
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

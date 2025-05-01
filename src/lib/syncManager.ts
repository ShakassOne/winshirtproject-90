import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { snakeToCamel, camelToSnake as importedCamelToSnake } from '@/lib/utils';

/**
 * Define valid table names for type safety
 */
export type ValidTableName = 'lotteries' | 'lottery_participants' | 'lottery_winners' | 
                            'products' | 'visuals' | 'visual_categories' | 'orders' | 
                            'order_items' | 'clients';

/**
 * Interface for defining synchronization status
 */
export interface SyncStatus {
  success: boolean;
  tableName?: string;
  localCount?: number;
  remoteCount?: number;
  operation?: 'push' | 'pull';
  error?: string;
  httpCode?: number;
  timestamp?: number;
  lastSync?: number | null;
}

// Type definitions for special cases
interface ClientItem {
  address?: string | {
    address?: string;
    city?: string;
    postal_code?: string;
    postalCode?: string;
    country?: string;
  };
  city?: string;
  postalCode?: string;
  country?: string;
  [key: string]: any;
}

interface VisualItem {
  imageUrl?: string;
  image?: string;
  [key: string]: any;
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
 * Get all valid table names
 */
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

/**
 * Clear local storage
 */
export const clearLocalStorage = async (): Promise<void> => {
  try {
    getAllValidTableNames().forEach(tableName => {
      localStorage.removeItem(tableName);
    });
    console.log("Local storage cleared");
    return Promise.resolve();
  } catch (error) {
    console.error("Error clearing local storage:", error);
    return Promise.reject(error);
  }
};

/**
 * Get sync status for a table
 */
export const getSyncStatus = async (table: ValidTableName): Promise<SyncStatus> => {
  try {
    const statusKey = `sync_status_${table}`;
    const statusStr = localStorage.getItem(statusKey);
    if (statusStr) {
      return JSON.parse(statusStr);
    }
    return { success: true, lastSync: null };
  } catch (error) {
    console.error(`Error getting sync status for ${table}:`, error);
    return { success: true, lastSync: null };
  }
};

/**
 * Set sync status for a table
 */
export const setSyncStatus = async (table: ValidTableName, status: SyncStatus): Promise<void> => {
  try {
    const statusKey = `sync_status_${table}`;
    localStorage.setItem(statusKey, JSON.stringify(status));
    return Promise.resolve();
  } catch (error) {
    console.error(`Error setting sync status for ${table}:`, error);
    return Promise.reject(error);
  }
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
 * Check if user is authenticated with Supabase
 */
const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Attempt to sign in with admin credentials if available
 */
const signInWithAdmin = async (): Promise<boolean> => {
  try {
    console.log("Checking authentication status...");
    
    // Check if we already have an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("User already authenticated:", session.user?.email);
      return true;
    }
    
    // First try to sign in with a stored admin user
    const adminCredentialsStr = localStorage.getItem('winshirt_admin');
    if (adminCredentialsStr) {
      try {
        const adminCredentials = JSON.parse(adminCredentialsStr);
        if (adminCredentials?.email && adminCredentials?.password) {
          console.log(`Attempting to sign in with stored admin credentials: ${adminCredentials.email}`);
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: adminCredentials.email,
            password: adminCredentials.password
          });
          
          if (!error && data.user) {
            console.log("Successfully signed in with stored admin credentials");
            return true;
          } else {
            console.error("Stored admin credentials failed:", error?.message);
            toast.error(`Erreur d'authentification: ${error?.message}`, { 
              position: "top-right",
              duration: 5000
            });
            // Don't remove credentials here, they might be valid but the server is down
          }
        }
      } catch (e) {
        console.error("Error parsing stored admin credentials:", e);
        localStorage.removeItem('winshirt_admin');
      }
    }
    
    // Try to use session from auth state if available
    const authState = localStorage.getItem('supabase.auth.token');
    if (authState) {
      console.log("Trying to use existing auth state");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("Successfully authenticated with existing session");
        return true;
      }
    }
    
    console.log("No valid credentials available. Authentication required.");
    return false;
  } catch (error) {
    console.error("Error during authentication attempt:", error);
    return false;
  }
};

/**
 * Create a mock user session for anonymous operations if needed
 * Returns true if already authenticated or successfully authenticated
 */
const ensureAuthSession = async (): Promise<boolean> => {
  // First check if we're already authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log("Already authenticated as:", session.user.email);
      return true;
    }
  } catch (e) {
    console.error("Error checking session:", e);
  }
  
  // Only try once to sign in to avoid infinite loops
  const authSuccess = await signInWithAdmin();
  
  if (!authSuccess) {
    toast.error("Authentification requise. Veuillez vous connecter pour synchroniser les données.", { 
      position: "top-right",
      duration: 5000
    });
    
    // Redirect to login or show login dialog
    const event = new CustomEvent('needAuthentication', {
      detail: { reason: 'sync' }
    });
    window.dispatchEvent(event);
  }
  
  // Return authentication status
  return authSuccess;
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
    
    let parsedData;
    try {
      parsedData = JSON.parse(localData);
      
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
    } catch (e) {
      console.error(`Error parsing local ${tableName} data:`, e);
      const error = `Error parsing local ${tableName} data`;
      toast.error(error, { position: "bottom-right" });
      
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
    
    // Make sure we have an authenticated session - Force authentication check
    console.log("Ensuring authenticated session before sync...");
    const isAuthenticated = await ensureAuthSession();
    
    if (!isAuthenticated) {
      const error = "Authentication required. Please log in to sync data.";
      
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
    
    console.log(`Successfully authenticated, proceeding with ${tableName} sync...`);
    
    // Convert data from camelCase to snake_case for Supabase with special handling for specific tables
    const supabaseData = parsedData.map((item: any) => {
      // Safety check to ensure item is not null or undefined
      if (!item) return item;
      
      // Special handling for clients table - structure the address field correctly
      if (tableName === 'clients') {
        const processedItem = { ...item } as ClientItem;
        
        // Ensure we have a valid address object
        if (processedItem.address && typeof processedItem.address === 'object') {
            // Address is already an object, no need to change the structure
        } else if (processedItem.address && typeof processedItem.address === 'string') {
          // If address is a string, convert it to an object
          const addressStr = processedItem.address;
          processedItem.address = {
            address: addressStr,
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
        
        // Fix: Use camelToSnakeObject instead of camelToSnake for objects
        return camelToSnakeObject(processedItem);
      }
      // Special handling for visuals table
      else if (tableName === 'visuals') {
        const processedItem = { ...item } as VisualItem;
        if (processedItem.image && typeof processedItem.image === 'string' && !processedItem.imageUrl) {
          processedItem.image_url = processedItem.image;
          delete processedItem.image;
        } else if (processedItem.imageUrl && !processedItem.image) {
          processedItem.image_url = processedItem.imageUrl;
          delete processedItem.imageUrl;
        }
        // Fix: Use camelToSnakeObject instead of camelToSnake for objects
        return camelToSnakeObject(processedItem);
      }
      
      // Default case - just convert camelCase to snake_case
      // Add a type check to ensure we only call camelToSnake on objects
      return typeof item === 'object' ? importedCamelToSnake(item) : item;
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
      toast.error(`Sync failed: ${error}`, { position: "top-right" });
      
      const syncStatus: SyncStatus = {
        success: false,
        tableName,
        localCount: 0,
        remoteCount: 0,
        operation: 'pull',
        error,
        timestamp: Date.now()
      };
      logSyncEvent(syncStatus);
      return syncStatus;
    }
    
    // Make sure we have an authenticated session for tables that need it
    const needsAuth = ['clients', 'orders', 'order_items'].includes(tableName);
    if (needsAuth) {
      const isAuthenticated = await ensureAuthSession();
      
      if (!isAuthenticated) {
        const error = "Authentication required. Please log in to sync data.";
        // No toast needed here as ensureAuthSession already shows one
        
        const syncStatus: SyncStatus = {
          success: false,
          tableName,
          localCount: 0,
          remoteCount: 0,
          operation: 'pull',
          error,
          timestamp: Date.now()
        };
        logSyncEvent(syncStatus);
        return syncStatus;
      }
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
        
        // Type assertion for better type safety
        const clientItem = camelItem as unknown as ClientItem;
        
        // Extract address fields if they exist
        if (clientItem.address && typeof clientItem.address === 'object') {
          // Type assertion for nested address object
          const addressObj = clientItem.address as { 
            city?: string; 
            postal_code?: string; 
            postalCode?: string;
            country?: string; 
            address?: string;
          };
          
          // Extract address fields to top-level properties
          clientItem.city = addressObj.city || '';
          clientItem.postalCode = addressObj.postal_code || addressObj.postalCode || '';
          clientItem.country = addressObj.country || '';
          
          // Set address to just the street address string
          if (addressObj.address && typeof addressObj.address === 'string') {
            clientItem.address = addressObj.address;
          } else {
            clientItem.address = '';
          }
        }
        
        return clientItem;
      }
      else if (tableName === 'visuals') {
        // Convert from Supabase format to local app format
        const camelItem = snakeToCamel(item);
        
        // Type assertion for visual items
        const visualItem = camelItem as unknown as VisualItem;
        
        // Handle image field conversion
        if (visualItem.imageUrl && !visualItem.image) {
          visualItem.image = visualItem.imageUrl;
          delete visualItem.imageUrl;
        }
        
        return visualItem;
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

/**
 * Helper function for object conversion: Converts an object with camelCase keys to snake_case keys
 * @param obj The object with camelCase keys
 * @returns The object with snake_case keys
 */
function camelToSnakeObject<T extends object>(obj: T): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnakeObject(item));
  }
  
  return Object.keys(obj).reduce((result, key) => {
    // Safe type check for key
    if (typeof key !== 'string') {
      result[key] = obj[key as keyof T];
      return result;
    }
    
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const value = obj[key as keyof T];
    result[snakeKey] = typeof value === 'object' && value !== null ? camelToSnakeObject(value) : value;
    return result;
  }, {} as any);
}

/**
 * Fixed version of camelToSnake that checks for type safety
 */
function camelToSnake(obj: any): any {
  // If not an object or null/undefined, return as is
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  return Object.keys(obj).reduce((result: any, key: string) => {
    // Create safe snake-cased key only if the key is a string
    const snakeKey = typeof key === 'string' ? key.replace(/([A-Z])/g, (k) => `_${k.toLowerCase()}`) : key;
    
    // Copy the value without transformation
    result[snakeKey] = obj[key];
    return result;
  }, {});
}

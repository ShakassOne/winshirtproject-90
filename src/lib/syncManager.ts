import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { validateVisualCategories } from '@/lib/syncValidator';

// Define the valid table names
export type ValidTableName = 'clients' | 'lotteries' | 'lottery_participants' | 
  'lottery_winners' | 'orders' | 'order_items' | 'products' | 
  'user_roles' | 'visuals' | 'visual_categories';

// Sync status interface
export interface SyncStatus {
  success: boolean;
  lastSync: string | null;
  error?: string;
  remoteCount?: number;
  localCount?: number;
  timestamp?: number; // Add timestamp
  operation?: 'push' | 'pull'; // Add operation
  tableName?: string; // Add tableName
}

// Get all valid table names
export const getAllValidTableNames = (): ValidTableName[] => {
  return [
    'clients', 
    'lotteries', 
    'lottery_participants', 
    'lottery_winners', 
    'orders', 
    'order_items', 
    'products', 
    'user_roles', 
    'visuals', 
    'visual_categories'
  ];
};

// Push data to Supabase
export const pushDataToSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    // Get data from localStorage
    const localData = localStorage.getItem(tableName);
    
    if (!localData) {
      return {
        success: false,
        lastSync: null,
        error: `No local data found for ${tableName}`,
        timestamp: Date.now(),
        operation: 'push',
        tableName
      };
    }
    
    const data = JSON.parse(localData);
    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: true,
        lastSync: new Date().toISOString(),
        localCount: 0,
        remoteCount: 0,
        timestamp: Date.now(),
        operation: 'push',
        tableName
      };
    }
    
    // Upsert data to Supabase
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(data, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      return {
        success: false,
        lastSync: null,
        error: error.message,
        localCount: data.length,
        timestamp: Date.now(),
        operation: 'push',
        tableName
      };
    }
    
    // Update sync status
    const status: SyncStatus = {
      success: true,
      lastSync: new Date().toISOString(),
      localCount: data.length,
      remoteCount: result ? result.length : 0,
      timestamp: Date.now(),
      operation: 'push',
      tableName
    };
    
    setSyncStatus(tableName, status);
    return status;
    
  } catch (error) {
    console.error(`Error in pushDataToSupabase for ${tableName}:`, error);
    return {
      success: false,
      lastSync: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      operation: 'push',
      tableName
    };
  }
};

// Pull data from Supabase
export const pullDataFromSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    // Get data from Supabase
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      console.error(`Error fetching ${tableName} from Supabase:`, error);
      return {
        success: false,
        lastSync: null,
        error: error.message,
        timestamp: Date.now(),
        operation: 'pull',
        tableName
      };
    }
    
    if (!data || data.length === 0) {
      // No data in Supabase
      return {
        success: true,
        lastSync: new Date().toISOString(),
        remoteCount: 0,
        timestamp: Date.now(),
        operation: 'pull',
        tableName
      };
    }
    
    // Store in localStorage
    localStorage.setItem(tableName, JSON.stringify(data));
    
    // Update sync status
    const status: SyncStatus = {
      success: true,
      lastSync: new Date().toISOString(),
      remoteCount: data.length,
      localCount: data.length,
      timestamp: Date.now(),
      operation: 'pull',
      tableName
    };
    
    setSyncStatus(tableName, status);
    
    // Trigger an event to notify other parts of the app
    const event = new Event('storageUpdate');
    window.dispatchEvent(event);
    
    return status;
    
  } catch (error) {
    console.error(`Error in pullDataFromSupabase for ${tableName}:`, error);
    return {
      success: false,
      lastSync: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      operation: 'pull',
      tableName
    };
  }
};

// Clear local storage for a specific table or all tables
export const clearLocalStorage = async (tableName?: ValidTableName): Promise<boolean> => {
  try {
    if (tableName) {
      localStorage.removeItem(tableName);
      return true;
    } else {
      // Clear all tables
      getAllValidTableNames().forEach(table => {
        localStorage.removeItem(table);
      });
      return true;
    }
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

// Sync all tables
export const syncAllTables = async (direction: 'push' | 'pull' = 'push'): Promise<Record<string, SyncStatus>> => {
  const results: Record<string, SyncStatus> = {};
  
  for (const tableName of getAllValidTableNames()) {
    if (direction === 'push') {
      results[tableName] = await pushDataToSupabase(tableName);
    } else {
      results[tableName] = await pullDataFromSupabase(tableName);
    }
  }
  
  return results;
};

// Get sync status for a table
export const getSyncStatus = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    const statusJson = localStorage.getItem(`sync_status_${tableName}`);
    if (statusJson) {
      return JSON.parse(statusJson);
    }
    return { 
      success: true, 
      lastSync: null,
      timestamp: Date.now(),
      tableName,
    };
  } catch (error) {
    console.error(`Error getting sync status for ${tableName}:`, error);
    return { 
      success: false, 
      lastSync: null,
      timestamp: Date.now(),
      tableName,
    };
  }
};

// Set sync status for a table
export const setSyncStatus = async (tableName: ValidTableName, status: SyncStatus): Promise<void> => {
  try {
    localStorage.setItem(`sync_status_${tableName}`, JSON.stringify(status));
  } catch (error) {
    console.error(`Error setting sync status for ${tableName}:`, error);
  }
};

// Get sync history
export const getSyncHistory = async (): Promise<SyncStatus[]> => {
  const history: SyncStatus[] = [];
  
  for (const tableName of getAllValidTableNames()) {
    const status = await getSyncStatus(tableName);
    if (status.lastSync) { // Only add entries that have synced before
      history.push(status);
    }
  }
  
  return history;
};

// Clear sync history
export const clearSyncHistory = async (): Promise<boolean> => {
  try {
    getAllValidTableNames().forEach(table => {
      localStorage.removeItem(`sync_status_${table}`);
    });
    return true;
  } catch (error) {
    console.error("Error clearing sync history:", error);
    return false;
  }
};

// Check Supabase connection with details
export const checkSupabaseConnectionWithDetails = async (): Promise<{
  connected: boolean;
  error?: string;
  tables?: { exists: boolean; missing: string[] };
}> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      return {
        connected: false,
        error: error.message
      };
    }
    
    // Check tables
    const tableResult = await import('@/lib/supabase').then(m => m.checkRequiredTables());
    
    return {
      connected: true,
      tables: tableResult
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get data counts from local storage and Supabase
export const getDataCounts = async (): Promise<Record<string, {
  local: number;
  remote: number;
  synced: boolean;
}>> => {
  const counts: Record<string, {
    local: number;
    remote: number;
    synced: boolean;
  }> = {};
  
  for (const tableName of getAllValidTableNames()) {
    try {
      // Get local count
      const localData = localStorage.getItem(tableName);
      const localCount = localData ? JSON.parse(localData).length : 0;
      
      // Get remote count
      const { data, error } = await supabase.from(tableName).select('count');
      const remoteCount = error || !data ? 0 : data[0]?.count || 0;
      
      counts[tableName] = {
        local: localCount,
        remote: Number(remoteCount),
        synced: localCount === Number(remoteCount)
      };
    } catch (error) {
      console.error(`Error getting counts for ${tableName}:`, error);
      counts[tableName] = { local: 0, remote: 0, synced: false };
    }
  }
  
  return counts;
};

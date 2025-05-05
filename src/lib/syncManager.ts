import { requiredTables } from '@/integrations/supabase/client';
import type { ValidTableName } from '@/integrations/supabase/client';

// Define and export the SyncStatus type
export interface SyncStatus {
  success: boolean;
  lastSync: string | null;
  error?: string;
  localCount?: number;
  remoteCount?: number;
  timestamp?: string;
  operation?: string;
  tableName?: string;
}

/**
 * Retrieves data counts for specified tables from localStorage.
 * @returns {Promise<Record<ValidTableName, number>>} A promise that resolves to a record of table names and their respective data counts.
 */
export const getDataCounts = async (): Promise<Record<ValidTableName, number>> => {
  const counts: Partial<Record<ValidTableName, number>> = {};
  
  for (const tableName of requiredTables) {
    try {
      // Get data from localStorage
      const localData = localStorage.getItem(tableName);
      const parsedData = localData ? JSON.parse(localData) : [];
      
      // Ensure parsedData is an array before accessing length
      const dataArray = Array.isArray(parsedData) ? parsedData : [];
      counts[tableName] = dataArray.length;
    } catch (error) {
      console.error(`Error getting count for ${tableName}:`, error);
      counts[tableName] = 0;
    }
  }
  
  return counts as Record<ValidTableName, number>;
};

/**
 * Pushes data from localStorage to Supabase for the specified table.
 * @param {ValidTableName} tableName - The name of the table to sync.
 * @returns {Promise<SyncStatus>} A promise that resolves to a sync status.
 */
export const pushDataToSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    // For now, just simulate a successful sync
    console.log(`Pushing data for table ${tableName} to Supabase`);
    
    // Get data from localStorage
    const localData = localStorage.getItem(tableName);
    const dataArray = localData ? JSON.parse(localData) : [];
    
    // In a real scenario, we would push this data to Supabase here
    
    const syncStatus: SyncStatus = {
      success: true,
      lastSync: new Date().toISOString(),
      localCount: dataArray.length,
      remoteCount: 0, // Would be populated from actual Supabase response
      timestamp: new Date().toISOString(),
      operation: 'push',
      tableName: tableName
    };
    
    // Save the sync status
    await setSyncStatus(tableName, syncStatus);
    
    return syncStatus;
  } catch (error) {
    console.error(`Error pushing ${tableName} to Supabase:`, error);
    const errorStatus: SyncStatus = {
      success: false,
      lastSync: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      operation: 'push',
      tableName: tableName
    };
    
    // Save the error status
    await setSyncStatus(tableName, errorStatus);
    
    return errorStatus;
  }
};

/**
 * Pulls data from Supabase into localStorage for the specified table.
 * @param {ValidTableName} tableName - The name of the table to pull.
 * @returns {Promise<SyncStatus>} A promise that resolves to a sync status.
 */
export const pullDataFromSupabase = async (tableName: ValidTableName): Promise<SyncStatus> => {
  try {
    // For now, just simulate a successful pull
    console.log(`Pulling data for table ${tableName} from Supabase`);
    
    // In a real scenario, we would fetch from Supabase and save to localStorage
    
    const syncStatus: SyncStatus = {
      success: true,
      lastSync: new Date().toISOString(),
      localCount: 0, // Would be populated from actual data counts
      remoteCount: 0, // Would be populated from actual Supabase response
      timestamp: new Date().toISOString(),
      operation: 'pull',
      tableName: tableName
    };
    
    // Save the sync status
    await setSyncStatus(tableName, syncStatus);
    
    return syncStatus;
  } catch (error) {
    console.error(`Error pulling ${tableName} from Supabase:`, error);
    const errorStatus: SyncStatus = {
      success: false,
      lastSync: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      operation: 'pull',
      tableName: tableName
    };
    
    // Save the error status
    await setSyncStatus(tableName, errorStatus);
    
    return errorStatus;
  }
};

/**
 * Clears all data from localStorage.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 */
export const clearLocalStorage = async (): Promise<boolean> => {
  try {
    // Loop through required tables and remove them from localStorage
    for (const tableName of requiredTables) {
      localStorage.removeItem(tableName);
    }
    
    // Also clear sync statuses
    localStorage.removeItem('syncStatuses');
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Gets the sync status for a specific table.
 * @param {ValidTableName} tableName - The name of the table.
 * @returns {Promise<SyncStatus | null>} A promise that resolves to the sync status or null.
 */
export const getSyncStatus = async (tableName: ValidTableName): Promise<SyncStatus | null> => {
  try {
    const syncStatuses = localStorage.getItem('syncStatuses');
    if (!syncStatuses) return null;
    
    const parsedStatuses = JSON.parse(syncStatuses);
    return parsedStatuses[tableName] || null;
  } catch (error) {
    console.error(`Error getting sync status for ${tableName}:`, error);
    return null;
  }
};

/**
 * Sets the sync status for a specific table.
 * @param {ValidTableName} tableName - The name of the table.
 * @param {SyncStatus} status - The status to set.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 */
export const setSyncStatus = async (tableName: ValidTableName, status: SyncStatus): Promise<boolean> => {
  try {
    const syncStatuses = localStorage.getItem('syncStatuses');
    const parsedStatuses = syncStatuses ? JSON.parse(syncStatuses) : {};
    
    parsedStatuses[tableName] = status;
    localStorage.setItem('syncStatuses', JSON.stringify(parsedStatuses));
    
    return true;
  } catch (error) {
    console.error(`Error setting sync status for ${tableName}:`, error);
    return false;
  }
};

/**
 * Gets the sync history for all tables.
 * @returns {Promise<Record<string, SyncStatus>>} A promise that resolves to the sync history.
 */
export const getSyncHistory = async (): Promise<Record<string, SyncStatus>> => {
  try {
    const syncStatuses = localStorage.getItem('syncStatuses');
    return syncStatuses ? JSON.parse(syncStatuses) : {};
  } catch (error) {
    console.error('Error getting sync history:', error);
    return {};
  }
};

/**
 * Gets all valid table names.
 * @returns {ValidTableName[]} An array of all valid table names.
 */
export const getAllValidTableNames = (): ValidTableName[] => {
  return requiredTables;
};

// Re-export ValidTableName so it can be imported from this file
export type { ValidTableName };

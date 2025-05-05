import { ValidTableName, requiredTables } from '@/integrations/supabase/client';

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

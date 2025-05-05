
import { supabase as supabaseClient, requiredTables, ValidTableName, checkSupabaseConnection as checkConnection } from '@/integrations/supabase/client';

// Re-export the supabase client
export const supabase = supabaseClient;

// Check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  return checkConnection();
};

// Helper to verify initialization
export const isSupabaseInitialized = async (): Promise<boolean> => {
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) return false;
  
  // Check if required tables exist
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('count').limit(1);
      if (error) {
        console.error(`Table check failed for ${tableName}:`, error);
        return false;
      }
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
  }
  
  return true;
};

export { requiredTables, ValidTableName };

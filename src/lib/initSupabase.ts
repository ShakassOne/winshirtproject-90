
import { supabase } from '@/integrations/supabase/client';
import { ValidTableName, requiredTables } from '@/lib/supabase';
import { toast } from '@/lib/toast';

// Check if all required tables exist
export const checkRequiredTables = async (): Promise<boolean> => {
  try {
    for (const tableName of requiredTables) {
      // Use the specific typed tables
      const { data, error } = await supabase.from(tableName as ValidTableName).select('count').limit(1);
      if (error) {
        console.error(`Table check failed for ${tableName}:`, error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking required tables:", error);
    return false;
  }
};

// Initialize Supabase client and test connection
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    // Test connection by trying to get the authenticated user
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Authentication error in Supabase initialization:", error);
      // Non-fatal for anonymous usage
    }
    
    // Check if required tables exist
    const tablesExist = await checkRequiredTables();
    if (!tablesExist) {
      console.warn("Some required tables do not exist or are inaccessible");
      // This could be a warning rather than an error depending on your app's requirements
    }
    
    console.log("Supabase initialized", { user: data?.user ? "Logged in" : "Anonymous" });
    return true;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    toast.error("Erreur de connexion à la base de données");
    return false;
  }
};

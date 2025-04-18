
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://phasprgawmnctyavtygh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYXNwcmdhd21uY3R5YXZ0eWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjYzNDcsImV4cCI6MjA1OTE0MjM0N30.0T6RCsUlV5bIMc6-K7XKJp-AV72gOpR73SSMT_Wk98U';

// Create a Supabase client with the URL and anonymous key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Add function to check if Supabase is connected
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    console.log("Supabase connection check result:", { data, error });
    
    // Si erreur, mais que c'est une erreur 404 (table n'existe pas), considérer quand même comme connecté
    if (error) {
      if (error.code === "PGRST116") {
        console.log("Table lotteries n'existe pas encore, mais connexion réussie");
        return true;
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
};

// Tables required for the application
export const requiredTables = [
  'lotteries', 
  'lottery_participants', 
  'lottery_winners', 
  'products',
  'visuals',
  'orders',
  'order_items',
  'clients'
];

// Check if all required tables exist
export const checkRequiredTables = async (): Promise<{exists: boolean, missing: string[]}> => {
  try {
    // Get all tables from Supabase
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error("Error checking tables:", error);
      return { exists: false, missing: requiredTables };
    }
    
    // Extract table names
    const existingTables = data?.map(t => t.tablename) || [];
    
    // Find missing tables
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    return {
      exists: missingTables.length === 0,
      missing: missingTables
    };
  } catch (error) {
    console.error("Error checking required tables:", error);
    return { exists: false, missing: requiredTables };
  }
};

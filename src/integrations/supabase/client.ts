
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
  },
  global: {
    fetch: (...args) => {
      // Set a shorter timeout to detect connection issues faster
      const controller = new AbortController();
      const { signal } = controller;
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      // @ts-ignore
      return fetch(...args, { signal })
        .finally(() => clearTimeout(timeoutId));
    }
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
    return !error;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
};

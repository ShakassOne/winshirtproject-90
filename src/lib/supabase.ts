
import { supabase as supabaseClient, requiredTables, ValidTableName, checkSupabaseConnection as checkConnection, checkRequiredTables as checkTables } from '@/integrations/supabase/client';

// Re-export the supabase client
export const supabase = supabaseClient;

// Re-export types and constants
export { requiredTables };
export type { ValidTableName };

// Re-export utilities for Supabase connection
export const checkSupabaseConnection = checkConnection;
export const checkRequiredTables = checkTables;
export const forceSupabaseConnection = async (): Promise<boolean> => {
  // Implementation of force connection
  try {
    const connected = await checkConnection();
    localStorage.setItem('supabase_connected', connected ? 'true' : 'false');
    return connected;
  } catch (error) {
    console.error("Error forcing Supabase connection:", error);
    return false;
  }
};

// Safe string conversion utilities that handle non-string values
export const snakeToCamel = (str: any): any => {
  // Return original value if not a string
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/(_\w)/g, (k) => k[1].toUpperCase());
};

export const camelToSnake = (str: any): any => {
  // Return original value if not a string
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/([A-Z])/g, (k) => `_${k.toLowerCase()}`);
};

// Add a function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  // Check if Supabase is configured
  const storedState = localStorage.getItem('supabase_connected');
  return storedState === 'true';
};

// Create a schema function that is referenced but missing
export const ensureDatabaseSchema = async (): Promise<boolean> => {
  try {
    const { exists, missing } = await checkTables();
    console.log("Database schema check:", exists ? "All tables exist" : `Missing tables: ${missing.join(', ')}`);
    return exists;
  } catch (error) {
    console.error("Error ensuring database schema:", error);
    return false;
  }
};

// Add FTP configuration
export const ftpConfig = {
  enabled: false,
  uploadEndpoint: '',
  baseUrl: '',
};

// Add HomeIntro related types and functions
export interface SlideType {
  id: number;
  title: string;
  subtitle?: string;
  image: string; // This is required
  link?: string;
  // Additional properties needed based on error messages
  backgroundImage?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  order?: number;
}

export interface HomeIntroConfig {
  slides: SlideType[];
  autoplay: boolean;
  interval: number;
  // Additional properties needed based on error messages
  showButtons?: boolean;
  showIndicators?: boolean;
  transitionTime?: number;
  autoPlay?: boolean; // Duplicate to handle both naming conventions
}

export const getHomeIntroConfig = (): HomeIntroConfig => {
  try {
    const storedConfig = localStorage.getItem('homeIntroConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    return getDefaultHomeIntroConfig();
  } catch (error) {
    console.error("Error getting home intro config:", error);
    return getDefaultHomeIntroConfig();
  }
};

// Add missing function that was referenced
export const getDefaultHomeIntroConfig = (): HomeIntroConfig => {
  return {
    slides: [],
    autoplay: true,
    autoPlay: true, // For compatibility
    interval: 5000,
    showButtons: true,
    showIndicators: true,
    transitionTime: 500
  };
};

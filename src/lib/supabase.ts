
import { supabase as supabaseClient, requiredTables, ValidTableName, checkSupabaseConnection as checkConnection } from '@/integrations/supabase/client';

// Re-export the supabase client
export const supabase = supabaseClient;

// Check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  return checkConnection();
};

// Implement the forceSupabaseConnection function that was missing
export const forceSupabaseConnection = async (): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      // Try to re-establish connection
      console.log("Connection not established, trying to reconnect...");
      return await checkConnection();
    }
    return isConnected;
  } catch (error) {
    console.error("Error forcing Supabase connection:", error);
    return false;
  }
};

// Check required tables with improved return type
export const checkRequiredTables = async (): Promise<{ exists: boolean; missing: string[] }> => {
  try {
    const missingTables: string[] = [];
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase.from(tableName).select('count').limit(1);
        if (error) {
          console.error(`Table check failed for ${tableName}:`, error);
          missingTables.push(tableName);
        }
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error);
        missingTables.push(tableName);
      }
    }
    
    return { 
      exists: missingTables.length === 0,
      missing: missingTables
    };
  } catch (error) {
    console.error("Error checking required tables:", error);
    return { exists: false, missing: requiredTables };
  }
};

// Helper to verify initialization
export const isSupabaseInitialized = async (): Promise<boolean> => {
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) return false;
  
  // Check if required tables exist
  const tables = await checkRequiredTables();
  return tables.exists;
};

// Add utility for checking if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  try {
    // Check if we have the necessary environment variables or localStorage settings
    return !!supabaseClient && true;
  } catch (error) {
    console.error("Error checking Supabase configuration:", error);
    return false;
  }
};

// Export types and functions for Home Intro
export interface SlideType {
  id: number;
  title: string;
  subtitle: string;
  order: number;
  backgroundImage: string;
  textColor: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface HomeIntroConfig {
  autoPlay: boolean;
  transitionTime: number;
  showButtons: boolean;
  showIndicators: boolean;
  slides: SlideType[];
}

// Function to get home intro configuration from storage or Supabase
export const getHomeIntroConfig = async (): Promise<HomeIntroConfig> => {
  try {
    // First try to get from localStorage
    const storedConfig = localStorage.getItem('homeIntroConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    
    // If not in localStorage, return default
    return getDefaultHomeIntroConfig();
  } catch (error) {
    console.error("Error getting home intro config:", error);
    return getDefaultHomeIntroConfig();
  }
};

// Default home intro configuration
export const getDefaultHomeIntroConfig = (): HomeIntroConfig => {
  return {
    autoPlay: true,
    transitionTime: 5000,
    showButtons: true,
    showIndicators: true,
    slides: [
      {
        id: 1,
        title: "Des vêtements uniques",
        subtitle: "Découvrez notre collection exclusive",
        order: 1,
        backgroundImage: "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbiUyMHNob3d8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
        textColor: "#ffffff"
      },
      {
        id: 2,
        title: "Gagnez des cadeaux incroyables",
        subtitle: "Participez à nos loteries en achetant nos produits",
        order: 2,
        backgroundImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Z2lmdHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
        textColor: "#ffffff",
        buttonText: "Voir les loteries",
        buttonLink: "/lotteries"
      }
    ]
  };
};

// Save home intro configuration
export const saveHomeIntroConfig = async (config: HomeIntroConfig): Promise<boolean> => {
  try {
    localStorage.setItem('homeIntroConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error("Error saving home intro config:", error);
    return false;
  }
};

// Upload image utility for home intro slides
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // For now, just create a URL for the file - in a real app, this would upload to storage
    return URL.createObjectURL(file);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

// FTP configuration
export const ftpConfig = {
  enabled: false,
  uploadEndpoint: '',
  baseUrl: ''
};

// Helper for ensuring database schema
export const ensureDatabaseSchema = async (): Promise<boolean> => {
  try {
    // Check connection
    const connected = await checkSupabaseConnection();
    if (!connected) return false;
    
    // Check required tables
    const tables = await checkRequiredTables();
    return tables.exists;
  } catch (error) {
    console.error("Error ensuring database schema:", error);
    return false;
  }
};

// Export types using export type for isolatedModules requirement
export type { ValidTableName };
export { requiredTables };

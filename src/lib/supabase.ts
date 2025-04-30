
import { supabase as supabaseClient, requiredTables, ValidTableName, checkSupabaseConnection as checkConnection, checkRequiredTables as checkTables } from '@/integrations/supabase/client';
import { snakeToCamel as snakeToC, camelToSnake as camelToS } from '@/lib/utils';

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

// Make sure data conversion utilities are exported
export const snakeToCamel = snakeToC;
export const camelToSnake = camelToS;

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

export const getDefaultHomeIntroConfig = (): HomeIntroConfig => {
  return {
    slides: [
      {
        id: 1,
        title: "Gagnez des t-shirts exclusifs",
        subtitle: "Participez à nos loteries pour gagner des produits uniques",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842717?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
        link: "/lotteries",
        backgroundImage: "https://images.unsplash.com/photo-1576566588028-4147f3842717?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
        textColor: "#FFFFFF",
        buttonText: "Participer",
        buttonLink: "/lotteries",
        order: 1
      },
      {
        id: 2,
        title: "Designs personnalisés",
        subtitle: "Créez votre t-shirt sur mesure",
        image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=654&q=80",
        link: "/customize",
        backgroundImage: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=654&q=80",
        textColor: "#FFFFFF",
        buttonText: "Personnaliser",
        buttonLink: "/customize",
        order: 2
      },
    ],
    autoplay: true,
    interval: 5000,
    transitionTime: 5000,
    showButtons: true,
    showIndicators: true,
    autoPlay: true // Include both naming conventions for compatibility
  };
};

export const saveHomeIntroConfig = (config: HomeIntroConfig): void => {
  try {
    localStorage.setItem('homeIntroConfig', JSON.stringify(config));
  } catch (error) {
    console.error("Error saving home intro config:", error);
  }
};

// Add image upload utility
export const uploadImage = async (file: File, folder: string = 'slides'): Promise<string> => {
  try {
    // Simulating image upload
    return URL.createObjectURL(file);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Add specific field mapping function for known entity conversions
export const applySpecialFieldMappings = (entity: any, tableName: string, direction: 'toSupabase' | 'fromSupabase'): any => {
  // Create a copy of the entity to avoid mutating the original
  const result = { ...entity };
  
  if (tableName === 'visuals') {
    if (direction === 'toSupabase') {
      // Convert from frontend format to Supabase format
      if (result.image) {
        result.image_url = result.image;
        delete result.image;
      }
      if (result.categoryId) {
        result.category_id = result.categoryId;
        delete result.categoryId;
      }
      if (result.categoryName) {
        result.category_name = result.categoryName;
        delete result.categoryName;
      }
    } else {
      // Convert from Supabase format to frontend format
      if (result.image_url) {
        result.image = result.image_url;
        delete result.image_url;
      }
      if (result.category_id) {
        result.categoryId = result.category_id;
        delete result.category_id;
      }
      if (result.category_name) {
        result.categoryName = result.category_name;
        delete result.category_name;
      }
    }
  }
  
  return result;
};

// Enhanced syncLocalDataToSupabase function with improved handling
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    console.log(`Syncing ${tableName} data to Supabase`);
    
    // Get local data from localStorage
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      console.log(`No local data found for ${tableName}`);
      return false;
    }
    
    let localItems = JSON.parse(localData);
    if (!Array.isArray(localItems) || localItems.length === 0) {
      console.log(`No items found in local data for ${tableName}`);
      return false;
    }
    
    console.log(`Found ${localItems.length} items in local data for ${tableName}`);
    
    // Apply special field mappings before snake_case conversion
    localItems = localItems.map(item => applySpecialFieldMappings(item, tableName, 'toSupabase'));
    
    // Convert camelCase properties to snake_case for Supabase
    const snakeCaseItems = localItems.map(item => camelToSnake(item));
    
    console.log(`Prepared ${snakeCaseItems.length} items for upload to Supabase`);
    
    // Use upsert to add/update the records
    const { error } = await supabase
      .from(tableName)
      .upsert(snakeCaseItems, { 
        onConflict: 'id', 
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      return false;
    }
    
    console.log(`Successfully synced ${tableName} to Supabase`);
    return true;
  } catch (error) {
    console.error(`Error syncing ${tableName} to Supabase:`, error);
    return false;
  }
};

// Enhanced fetchDataFromSupabase function with improved field mapping
export const fetchDataFromSupabase = async (tableName: ValidTableName): Promise<any[]> => {
  try {
    console.log(`Fetching ${tableName} data from Supabase`);
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // First convert from snake_case to camelCase
    const camelCaseItems = data.map(item => snakeToCamel(item));
    
    // Then apply any special field mappings specific to this entity
    const processedItems = camelCaseItems.map(item => applySpecialFieldMappings(item, tableName, 'fromSupabase'));
    
    console.log(`Successfully retrieved and processed ${processedItems.length} items from ${tableName}`);
    return processedItems;
  } catch (error) {
    console.error(`Error fetching ${tableName} from Supabase:`, error);
    return [];
  }
};

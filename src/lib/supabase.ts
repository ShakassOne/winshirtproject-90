
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { Json } from '@/integrations/supabase/types';

// Vérification de la configuration Supabase
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(1);
    
    return !error && data && data.length > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification de Supabase:", error);
    return false;
  }
};

// Fonction pour vérifier si les tables requises existent
export const checkRequiredTables = async (): Promise<{ exists: boolean; missing: string[] }> => {
  try {
    const requiredTables = ['clients', 'products', 'lotteries', 'orders', 'visuals', 'lottery_participants', 'lottery_winners', 'order_items', 'site_settings'];
    
    // Get all tables in the public schema
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Erreur lors de la vérification des tables requises:', error);
      return { exists: false, missing: requiredTables };
    }
    
    // Extract table names
    const existingTables = data.map(row => row.tablename);
    
    // Find missing tables
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    return {
      exists: missingTables.length === 0,
      missing: missingTables
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des tables requises:', error);
    return { exists: false, missing: ['clients', 'products', 'lotteries', 'orders', 'visuals'] };
  }
};

// Convertir les clés camelCase en snake_case pour Supabase
export const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
    
    // Récursivement convertir les valeurs qui sont des objets
    const newValue = value !== null && typeof value === 'object' 
      ? camelToSnake(value) 
      : value;
    
    return { ...acc, [snakeKey]: newValue };
  }, {});
};

// Convertir les clés snake_case en camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Récursivement convertir les valeurs qui sont des objets
    const newValue = value !== null && typeof value === 'object' 
      ? snakeToCamel(value) 
      : value;
    
    return { ...acc, [camelKey]: newValue };
  }, {});
};

// Re-export supabase from client to maintain compatibility
export { supabase } from '@/integrations/supabase/client';

// Types for HomeIntroManager and related components
export interface SlideType {
  id: number; // Changed from string to number
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  // Additional properties used in HomeIntroManager
  order?: number;
  backgroundImage?: string;
  textColor?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface HomeIntroConfig {
  slides: SlideType[];
  showArrows: boolean;
  autoplay: boolean; // Consistent naming
  interval: number;
  showIndicators?: boolean;
  showButtons?: boolean; // Added missing property
  transitionTime?: number; // Added missing property
}

export const getDefaultHomeIntroConfig = (): HomeIntroConfig => ({
  slides: [
    {
      id: 1, // Changed from string to number
      title: 'Bienvenue sur WinShirt',
      description: 'Découvrez nos loteries et produits exclusifs',
      imageUrl: 'https://placehold.co/600x400/png?text=WinShirt',
      ctaText: 'Voir les loteries',
      ctaLink: '/lotteries',
      backgroundImage: 'https://placehold.co/600x400/png?text=WinShirt', 
      textColor: '#FFFFFF',
      subtitle: 'Découvrez nos loteries et produits exclusifs',
      buttonText: 'Voir les loteries',
      buttonLink: '/lotteries',
      order: 1
    }
  ],
  showArrows: true,
  autoplay: true,
  interval: 5000,
  showButtons: true,
  showIndicators: true,
  transitionTime: 5000
});

export const getHomeIntroConfig = async (): Promise<HomeIntroConfig> => {
  try {
    const isConnected = await isSupabaseConfigured();
    if (!isConnected) {
      const storedConfig = localStorage.getItem('homeIntroConfig');
      return storedConfig ? JSON.parse(storedConfig) : getDefaultHomeIntroConfig();
    }
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'home_intro_config')
      .single();
    
    if (error || !data) {
      console.error('Error fetching home intro config:', error);
      return getDefaultHomeIntroConfig();
    }
    
    // Cast the data.value to HomeIntroConfig after known structure validation
    const rawValue = data.value as any;
    // Validate that it has the minimum required structure
    if (rawValue && Array.isArray(rawValue.slides)) {
      return rawValue as HomeIntroConfig;
    }
    
    return getDefaultHomeIntroConfig();
  } catch (error) {
    console.error('Error in getHomeIntroConfig:', error);
    return getDefaultHomeIntroConfig();
  }
};

export const saveHomeIntroConfig = async (config: HomeIntroConfig): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    if (!isConnected) {
      localStorage.setItem('homeIntroConfig', JSON.stringify(config));
      return true;
    }
    
    // Check if the config already exists
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'home_intro_config')
      .maybeSingle();
    
    if (existing) {
      // Update existing config
      const { error } = await supabase
        .from('site_settings')
        .update({ value: config as unknown as Json })
        .eq('key', 'home_intro_config');
      
      if (error) {
        console.error('Error updating home intro config:', error);
        return false;
      }
    } else {
      // Insert new config
      const { error } = await supabase
        .from('site_settings')
        .insert({ key: 'home_intro_config', value: config as unknown as Json });
      
      if (error) {
        console.error('Error inserting home intro config:', error);
        return false;
      }
    }
    
    // Update localStorage as backup
    localStorage.setItem('homeIntroConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error in saveHomeIntroConfig:', error);
    return false;
  }
};

export const uploadImage = async (file: File, folder?: string): Promise<string> => {
  // This is a placeholder function that would normally handle image uploads
  // Since we don't have actual storage implementation yet, we'll return a placeholder
  return URL.createObjectURL(file);
};

// Default FTP configuration value
export const defaultFtpConfig = {
  host: '',
  port: 21,
  username: '',
  password: '',
  secure: true,
  basePath: '/',
  enabled: false,
  uploadEndpoint: '',
  baseUrl: ''
};

// FTP Config interface for FtpSettingsManager
export interface FtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  basePath: string;
  enabled: boolean;
  uploadEndpoint: string;
  baseUrl: string;
}

// Create an instance of the config to use as a value
export const ftpConfigInstance = { ...defaultFtpConfig };

export const getDefaultFtpConfig = (): FtpConfig => ({
  ...defaultFtpConfig
});

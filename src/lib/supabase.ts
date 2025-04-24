
import { createClient } from '@supabase/supabase-js';
import { toast } from './toast';

export const SUPABASE_URL = "https://flifjrvtjphhnxcqtxwx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaWZqcnZ0anBoaG54Y3F0eHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5OTg5OTgsImV4cCI6MjA2MDU3NDk5OH0.SfYrS-mK9plEcoutKnfpth40T-TAlu_88wdv39fLbUo";

// Configuration explicite pour assurer la persistance de la session
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Type definition for FTP configuration
export const ftpConfig = {
  enabled: false,
  uploadEndpoint: '',
  baseUrl: ''
};

// Type definitions for HomeIntro configurations
export interface SlideType {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  textColor: string;
  order: number;
}

export interface HomeIntroConfig {
  autoPlay: boolean;
  showButtons: boolean;
  showIndicators: boolean;
  transitionTime: number;
  slides: SlideType[];
}

// Vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY;
};

// Fonction pour vérifier la connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    toast.error("Supabase n'est pas configuré correctement");
    return false;
  }

  try {
    const { data, error } = await supabase.from('pg_tables').select('tablename').limit(1);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      toast.error("Impossible de se connecter à Supabase: " + error.message);
      return false;
    }

    console.log("Connexion Supabase réussie");
    return true;
  } catch (error) {
    console.error("Exception lors de la vérification Supabase:", error);
    toast.error("Erreur de connexion à Supabase");
    return false;
  }
};

// Get HomeIntro configuration from localStorage or default
export const getHomeIntroConfig = async (): Promise<HomeIntroConfig> => {
  try {
    // Try to load from localStorage first
    const storedConfig = localStorage.getItem('homeIntroConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    
    // If not in localStorage, return default
    return getDefaultHomeIntroConfig();
  } catch (error) {
    console.error("Error loading home intro config:", error);
    return getDefaultHomeIntroConfig();
  }
};

// Default HomeIntro configuration
export const getDefaultHomeIntroConfig = (): HomeIntroConfig => {
  return {
    autoPlay: true,
    showButtons: true,
    showIndicators: true,
    transitionTime: 5000, // 5 seconds
    slides: [
      {
        id: 1,
        title: "Bienvenue sur WinShirt",
        subtitle: "Achetez des vêtements et gagnez des lots exceptionnels",
        buttonText: "Voir les produits",
        buttonLink: "/products",
        backgroundImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        textColor: "#FFFFFF",
        order: 1
      },
      {
        id: 2,
        title: "Découvrez nos loteries",
        subtitle: "Participez et tentez de remporter des prix incroyables",
        buttonText: "Voir les loteries",
        buttonLink: "/lotteries",
        backgroundImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
        textColor: "#FFFFFF",
        order: 2
      }
    ]
  };
};

// Save HomeIntro configuration
export const saveHomeIntroConfig = async (config: HomeIntroConfig): Promise<boolean> => {
  try {
    // Save to localStorage
    localStorage.setItem('homeIntroConfig', JSON.stringify(config));
    
    // In a real implementation, we would also save to Supabase
    // For now, just simulate success
    return true;
  } catch (error) {
    console.error("Error saving home intro config:", error);
    return false;
  }
};

// Upload image and return URL
export const uploadImage = async (file: File, folder: string): Promise<string | null> => {
  try {
    // For now, create a local URL (this would normally upload to Supabase storage)
    const localUrl = URL.createObjectURL(file);
    
    // In a real implementation with Supabase:
    // const { data, error } = await supabase.storage
    //   .from('images')
    //   .upload(`${folder}/${file.name}`, file);
    
    // if (error) {
    //   throw error;
    // }
    
    // return supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl;
    
    // For now, just return the local URL
    return localUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

// Fonction utilitaire pour convertir les clés snake_case en camelCase
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

// Fonction utilitaire pour convertir les clés camelCase en snake_case
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

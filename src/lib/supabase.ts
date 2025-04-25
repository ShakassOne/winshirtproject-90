
import { createClient } from '@supabase/supabase-js';
import { toast } from './toast';

// Utiliser les mêmes informations que dans src/integrations/supabase/client.ts
export const SUPABASE_URL = "https://uwgclposhhdovfjnazlp.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Z2NscG9zaGhkb3Zmam5hemxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTA4MzEsImV4cCI6MjA2MTA2NjgzMX0.wZBdCERqRHdWQMCZvFSbJBSMoXQHvpK49Jz_m4dx4cc";

// Configuration explicite pour assurer la persistance de la session et garantir un client unique
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
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
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Fonction pour vérifier la connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error("Supabase n'est pas configuré correctement");
    toast.error("Supabase n'est pas configuré correctement", { position: "top-right" });
    return false;
  }

  try {
    console.log("Vérification de la connexion à Supabase...");
    
    // Requête simple pour vérifier la connexion
    // On utilise une requête directe au lieu de pg_tables qui cause des problèmes
    const { data, error } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Si l'erreur est que la table n'existe pas, on est quand même connecté
        console.log("Connexion Supabase réussie mais la table lotteries n'existe pas");
        return true;
      }
      
      console.error("Erreur de connexion Supabase:", error);
      toast.error("Impossible de se connecter à Supabase: " + error.message, { position: "top-right" });
      return false;
    }

    console.log("Connexion Supabase réussie");
    return true;
  } catch (error) {
    console.error("Exception lors de la vérification Supabase:", error);
    toast.error("Erreur de connexion à Supabase", { position: "top-right" });
    return false;
  }
};

// Fonction pour forcer la connexion à Supabase et créer les tables si nécessaire
export const forceSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Tentative de connexion à Supabase...");
    
    if (!isSupabaseConfigured()) {
      toast.error("Configuration Supabase manquante", { position: "top-right" });
      return false;
    }
    
    // Tentative de connexion simple
    const { data, error } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') {
      console.error("Erreur de connexion:", error);
      toast.error(`Erreur de connexion: ${error.message}`, { position: "top-right" });
      return false;
    }
    
    toast.success("Connexion à Supabase établie!", { position: "top-right" });
    console.log("Connexion à Supabase réussie");
    
    // Mise à jour du localStorage pour signaler la connexion
    localStorage.setItem('supabase_connected', 'true');
    return true;
  } catch (error) {
    console.error("Exception lors de la connexion:", error);
    toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "top-right" });
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

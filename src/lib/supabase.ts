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
    toast.error("Supabase n'est pas configuré correctement", { position: "bottom-right" });
    return false;
  }

  try {
    console.log("Vérification de la connexion à Supabase...");
    
    // Essayons une requête plus simple et directe
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      toast.error("Impossible de se connecter à Supabase: " + error.message, { position: "bottom-right" });
      localStorage.setItem('supabase_connected', 'false');
      return false;
    }

    console.log("Connexion Supabase réussie");
    localStorage.setItem('supabase_connected', 'true');
    return true;
  } catch (error) {
    console.error("Exception lors de la vérification Supabase:", error);
    toast.error("Erreur de connexion à Supabase", { position: "bottom-right" });
    localStorage.setItem('supabase_connected', 'false');
    return false;
  }
};

// Fonction pour forcer la connexion à Supabase et créer les tables si nécessaire
export const forceSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Tentative de connexion à Supabase...");
    
    if (!isSupabaseConfigured()) {
      toast.error("Configuration Supabase manquante", { position: "bottom-right" });
      return false;
    }
    
    // Tentative de connexion simple
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
      
    if (error) {
      // Si l'erreur indique que la table n'existe pas, nous devons peut-être la créer
      console.error("Erreur de connexion:", error);
      
      if (error.code === '42P01') { // Table doesn't exist
        try {
          // Tenter de créer les tables nécessaires
          const { error: createError } = await supabase.rpc('create_required_tables');
          if (createError) {
            console.error("Erreur lors de la création des tables:", createError);
            toast.error("Impossible de créer les tables: " + createError.message, { position: "bottom-right" });
            localStorage.setItem('supabase_connected', 'false');
            return false;
          }
          toast.success("Tables créées avec succès", { position: "bottom-right" });
        } catch (e) {
          console.error("Exception lors de la création des tables:", e);
        }
      } else {
        toast.error(`Erreur de connexion: ${error.message}`, { position: "bottom-right" });
        localStorage.setItem('supabase_connected', 'false');
        return false;
      }
    }
    
    toast.success("Connexion à Supabase établie!", { position: "bottom-right" });
    console.log("Connexion à Supabase réussie");
    
    // Mise à jour du localStorage pour signaler la connexion
    localStorage.setItem('supabase_connected', 'true');
    return true;
  } catch (error) {
    console.error("Exception lors de la connexion:", error);
    toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    localStorage.setItem('supabase_connected', 'false');
    return false;
  }
};

// Fonction de synchronisation des données locales vers Supabase
export const syncLocalDataToSupabase = async (tableName: string): Promise<boolean> => {
  try {
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      toast.warning(`Pas de données locales pour ${tableName}`, { position: "bottom-right" });
      return false;
    }

    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      toast.warning(`Données invalides pour ${tableName}`, { position: "bottom-right" });
      return false;
    }

    // Nous allons tenter d'utiliser upsert pour éviter les conflits
    const { error } = await supabase.from(tableName).upsert(
      parsedData.map(item => camelToSnake(item)),
      { onConflict: 'id' }
    );

    if (error) {
      console.error(`Erreur lors de la synchronisation de ${tableName}:`, error);
      toast.error(`Erreur de synchronisation: ${error.message}`, { position: "bottom-right" });
      return false;
    }

    // Synchronisation réussie
    toast.success(`${tableName} synchronisé avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation de ${tableName}:`, error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Fonction pour obtenir les données Supabase et les mettre à jour en local
export const fetchDataFromSupabase = async (tableName: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      console.error(`Erreur lors de la récupération des données pour ${tableName}:`, error);
      toast.error(`Erreur: ${error.message}`, { position: "bottom-right" });
      return [];
    }
    
    if (data && Array.isArray(data)) {
      // Conversion des données snake_case en camelCase
      const camelCaseData = data.map(item => snakeToCamel(item));
      
      // Mise à jour du localStorage
      localStorage.setItem(tableName, JSON.stringify(camelCaseData));
      
      return camelCaseData;
    }
    
    return [];
  } catch (error) {
    console.error(`Exception lors de la récupération des données pour ${tableName}:`, error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return [];
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

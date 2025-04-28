
import { camelToSnake, snakeToCamel } from './utils'; // Import from utils instead
import { toast } from './toast';
import { supabase as supabaseInstance, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';
import { ValidTableName, requiredTables } from '@/integrations/supabase/client';

// Re-export the Supabase instance
export const supabase = supabaseInstance;

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

// Export camelToSnake and snakeToCamel from here as well for backward compatibility
export { camelToSnake, snakeToCamel };

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
      console.error("Erreur de connexion:", error);
      toast.error(`Erreur de connexion: ${error.message}`, { position: "bottom-right" });
      localStorage.setItem('supabase_connected', 'false');
      return false;
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

// Fonction plus robuste pour synchroniser les données locales vers Supabase
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      toast.warning(`Impossible de synchroniser ${tableName} - Mode hors-ligne`, { position: "bottom-right" });
      return false;
    }

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

    console.log(`Synchronisation de ${parsedData.length} éléments pour ${tableName}...`);

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
    
    // Récupérer les données après synchronisation pour assurer la cohérence
    await fetchDataFromSupabase(tableName);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation de ${tableName}:`, error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Fonction améliorée pour obtenir les données Supabase et les mettre à jour en local
export const fetchDataFromSupabase = async (tableName: ValidTableName): Promise<any[]> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      const localData = localStorage.getItem(tableName);
      console.log(`Mode hors-ligne - Utilisation des données locales pour ${tableName}`);
      if (localData) {
        return JSON.parse(localData);
      }
      return [];
    }
    
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
      console.log(`Données de ${tableName} mises à jour: ${camelCaseData.length} éléments`);
      
      return camelCaseData;
    }
    
    return [];
  } catch (error) {
    console.error(`Exception lors de la récupération des données pour ${tableName}:`, error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    
    // En cas d'erreur, essayer d'utiliser les données locales
    const localData = localStorage.getItem(tableName);
    if (localData) {
      return JSON.parse(localData);
    }
    
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

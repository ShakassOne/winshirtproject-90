
// Import the supabase client and required types directly
import { supabase } from '@/integrations/supabase/client';
// Re-export the required types and functions from client
export { supabase, checkSupabaseConnection, requiredTables } from '@/integrations/supabase/client';
export type { ValidTableName } from '@/integrations/supabase/client';

// HomeIntro related types and functions
export type SlideType = {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  textColor: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
};

export interface HomeIntroConfig {
  slides: SlideType[];
  autoPlay: boolean;
  transitionTime: number;
  showButtons: boolean;
  showIndicators: boolean;
}

// Default configuration for home intro
export const getDefaultHomeIntroConfig = (): HomeIntroConfig => ({
  slides: [
    {
      id: 1,
      title: "Achetez des vêtements, Gagnez des cadeaux incroyables",
      subtitle: "WinShirt révolutionne le shopping en ligne avec nos loteries exclusives",
      backgroundImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
      textColor: "#ffffff",
      buttonText: "Voir les produits",
      buttonLink: "/products",
      order: 0
    },
    {
      id: 2,
      title: "Découvrez nos loteries exclusives",
      subtitle: "Tentez votre chance et gagnez des prix exceptionnels",
      backgroundImage: "https://images.unsplash.com/photo-1592991538534-36a434169a8a?w=1200",
      textColor: "#ffffff",
      buttonText: "Voir les loteries",
      buttonLink: "/lotteries",
      order: 1
    }
  ],
  autoPlay: true,
  transitionTime: 5000,
  showButtons: true,
  showIndicators: true
});

// FTP configuration for image uploads
export const ftpConfig = {
  enabled: false,
  uploadEndpoint: '',
  baseUrl: ''
};

// Function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  try {
    const connected = localStorage.getItem('supabase_connected');
    return connected === 'true';
  } catch (e) {
    console.error("Error checking Supabase configuration:", e);
    return false;
  }
};

// Helper function to get home intro configuration
export const getHomeIntroConfig = async (): Promise<HomeIntroConfig> => {
  try {
    // First check if we have a configuration in localStorage
    const localConfig = localStorage.getItem('homeIntroConfig');
    if (localConfig) {
      return JSON.parse(localConfig);
    }

    // If no local config, check if we have a connection to Supabase
    const isConnected = await checkSupabaseConnection();
    if (isConnected) {
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('app_config')
          .select('*')
          .eq('key', 'home_intro')
          .single();
          
        if (!error && data && data.value) {
          const config = data.value as HomeIntroConfig;
          localStorage.setItem('homeIntroConfig', JSON.stringify(config));
          return config;
        }
      } catch (e) {
        console.error("Error retrieving config from Supabase:", e);
      }
    }
    
    // If everything fails, return the default config
    const defaultConfig = getDefaultHomeIntroConfig();
    localStorage.setItem('homeIntroConfig', JSON.stringify(defaultConfig));
    return defaultConfig;
  } catch (e) {
    console.error("Error loading home intro config:", e);
    return getDefaultHomeIntroConfig();
  }
};

// Save home intro configuration
export const saveHomeIntroConfig = async (config: HomeIntroConfig): Promise<boolean> => {
  try {
    // Always save to localStorage
    localStorage.setItem('homeIntroConfig', JSON.stringify(config));
    
    // Check if we have a connection to Supabase
    const isConnected = await checkSupabaseConnection();
    if (isConnected) {
      try {
        // Try to save to Supabase
        const { error } = await supabase
          .from('app_config')
          .upsert({ 
            key: 'home_intro',
            value: config,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
          
        if (error) {
          console.error("Error saving config to Supabase:", error);
          return false;
        }
        return true;
      } catch (e) {
        console.error("Error saving config to Supabase:", e);
        return false;
      }
    }
    
    return true;
  } catch (e) {
    console.error("Error saving home intro config:", e);
    return false;
  }
};

// Upload image function for FTP or Supabase storage
export const uploadImage = async (file: File, folder: string = 'general'): Promise<string | null> => {
  try {
    // Check if FTP is enabled
    if (ftpConfig.enabled && ftpConfig.uploadEndpoint && ftpConfig.baseUrl) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      const response = await fetch(ftpConfig.uploadEndpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      return `${ftpConfig.baseUrl}/${folder}/${result.filename}`;
    } else {
      // Fall back to Supabase storage
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (error) {
          console.error("Error uploading to Supabase Storage:", error);
          throw error;
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        return urlData.publicUrl;
      } else {
        // If not connected to Supabase, store locally (temporary)
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  } catch (e) {
    console.error("Error uploading image:", e);
    toast.error(`Upload failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return null;
  }
};

// Force Supabase connection
export const forceSupabaseConnection = async (): Promise<boolean> => {
  try {
    const result = await checkSupabaseConnection();
    if (result) {
      localStorage.setItem('supabase_connected', 'true');
    } else {
      localStorage.setItem('supabase_connected', 'false');
    }
    return result;
  } catch (e) {
    console.error("Error forcing Supabase connection:", e);
    localStorage.setItem('supabase_connected', 'false');
    return false;
  }
};

// Function to create tables or fix schema issues if needed
export const ensureDatabaseSchema = async (): Promise<boolean> => {
  try {
    console.log("Vérification et mise à jour du schéma de la base de données...");
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase");
      return false;
    }

    // Create functions to help with schema management
    await supabase.rpc('create_schema_helper_functions');
    
    // Add category_name column to visuals table if it doesn't exist
    await addCategoryNameColumn();
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du schéma:", error);
    return false;
  }
};

// Ajouter la colonne manquante 'category_name' à la table 'visuals' dans Supabase
export const addCategoryNameColumn = async (): Promise<boolean> => {
  try {
    console.log("Vérification et ajout de la colonne category_name à la table visuals...");
    
    // Vérifier d'abord si la connexion à Supabase est établie
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase");
      return false;
    }

    // Vérifier si la colonne existe déjà
    const { data: columns, error: columnError } = await supabase
      .rpc('get_column_info', { 
        p_table_name: 'visuals',
        p_column_name: 'category_name'
      });
    
    if (columnError) {
      console.error("Erreur lors de la vérification de la colonne:", columnError);
      return false;
    }
    
    // Si la colonne existe déjà, ne rien faire
    if (columns && columns.length > 0) {
      console.log("La colonne 'category_name' existe déjà dans la table 'visuals'");
      return true;
    }
    
    // Ajouter la colonne si elle n'existe pas
    const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
      p_table_name: 'visuals',
      p_column_name: 'category_name',
      p_column_type: 'text'
    });
    
    if (alterError) {
      console.error("Erreur lors de l'ajout de la colonne:", alterError);
      return false;
    }

    console.log("Colonne 'category_name' ajoutée avec succès à la table 'visuals'");
    
    // Mettre à jour les données existantes pour ajouter le category_name
    const { data: visuals, error: visualsError } = await supabase
      .from('visuals')
      .select('id, category_id');
    
    if (visualsError) {
      console.error("Erreur lors de la récupération des visuels:", visualsError);
      return false;
    }
    
    // Récupérer les catégories pour obtenir les noms
    const { data: categories, error: categoriesError } = await supabase
      .from('visual_categories')
      .select('id, name');
    
    if (categoriesError) {
      console.error("Erreur lors de la récupération des catégories:", categoriesError);
      return false;
    }
    
    // Mettre à jour chaque visuel avec le nom de sa catégorie
    if (visuals && categories) {
      for (const visual of visuals) {
        const category = categories.find(c => c.id === visual.category_id);
        if (category) {
          await supabase
            .from('visuals')
            .update({ category_name: category.name })
            .eq('id', visual.id);
        }
      }
      console.log("Données de category_name mises à jour avec succès");
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne category_name:", error);
    return false;
  }
};

// Fonction utilitaire pour convertir de snake_case à camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Fonction utilitaire pour convertir de camelCase à snake_case
export const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

// Fetch data from Supabase for a specific table
export const fetchDataFromSupabase = async (tableName: ValidTableName): Promise<any[]> => {
  try {
    console.log(`Récupération des données depuis Supabase pour ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erreur lors de la récupération des données de ${tableName}:`, error);
      throw error;
    }
    
    if (data) {
      const camelCaseData = data.map(item => snakeToCamel(item));
      localStorage.setItem(tableName, JSON.stringify(camelCaseData));
      console.log(`Données de ${tableName} mises à jour: ${camelCaseData.length} éléments`);
      return camelCaseData;
    }
    
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de ${tableName}:`, error);
    
    // Récupérer depuis localStorage en cas d'erreur
    const localData = localStorage.getItem(tableName);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        console.log(`Données récupérées depuis localStorage pour ${tableName}: ${parsedData.length} éléments`);
        return parsedData;
      } catch (parseError) {
        console.error(`Erreur lors de l'analyse des données locales:`, parseError);
      }
    }
    
    return [];
  }
};

// Synchronize local data to Supabase
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    console.log(`Synchronisation des données locales vers Supabase pour ${tableName}...`);
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase, impossible de synchroniser");
      return false;
    }
    
    // Récupérer les données locales
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      console.log(`Aucune donnée locale à synchroniser pour ${tableName}`);
      return false;
    }
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.log(`Données locales invalides pour ${tableName}`);
      return false;
    }
    
    // Convertir en snake_case pour Supabase
    const snakeCaseData = parsedData.map(item => camelToSnake(item));
    
    // Supprimer toutes les données existantes
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .gte('id', 0);  // Supprime toutes les lignes avec un ID >= 0
    
    if (deleteError) {
      console.error(`Erreur lors de la suppression des données de ${tableName}:`, deleteError);
      return false;
    }
    
    // Insérer les nouvelles données
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(snakeCaseData);
    
    if (insertError) {
      console.error(`Erreur lors de l'insertion des données dans ${tableName}:`, insertError);
      return false;
    }
    
    console.log(`Données de ${tableName} synchronisées avec succès`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation des données de ${tableName}:`, error);
    return false;
  }
};

import { toast } from './toast';

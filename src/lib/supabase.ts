import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { snakeToCamel, camelToSnake } from '@/lib/utils';
import type { ValidTableName } from '@/integrations/supabase/client';

/**
 * Fonction pour vérifier la connexion à Supabase
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Vérification de la connexion Supabase...");
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      console.error("Erreur de connexion à Supabase:", error);
      return false;
    }
    
    console.log("Connexion à Supabase établie avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de la connexion à Supabase:", error);
    return false;
  }
};

/**
 * Fonction pour récupérer des données depuis Supabase
 */
export const fetchDataFromSupabase = async (tableName: ValidTableName): Promise<any[]> => {
  try {
    console.log(`Récupération des données depuis Supabase pour ${tableName}...`);
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.log(`Mode hors-ligne, récupération des données depuis localStorage pour ${tableName}`);
      const localData = localStorage.getItem(tableName);
      return localData ? JSON.parse(localData) : [];
    }
    
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      console.error(`Erreur lors de la récupération des données depuis Supabase pour ${tableName}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`Aucune donnée trouvée dans Supabase pour ${tableName}`);
      return [];
    }
    
    // Convertir les données de snake_case à camelCase
    const camelCaseData = data.map(item => snakeToCamel(item));
    
    console.log(`Données de ${tableName} récupérées depuis Supabase:`, camelCaseData.length, "éléments");
    
    // Mettre à jour localStorage
    localStorage.setItem(tableName, JSON.stringify(camelCaseData));
    
    return camelCaseData;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis Supabase pour ${tableName}:`, error);
    
    // Fallback aux données locales
    const localData = localStorage.getItem(tableName);
    if (localData) {
      try {
        console.log(`Utilisation des données locales pour ${tableName}`);
        return JSON.parse(localData);
      } catch (e) {
        console.error(`Erreur lors du parsing des données locales pour ${tableName}:`, e);
      }
    }
    
    return [];
  }
};

/**
 * Fonction pour synchroniser les données locales vers Supabase
 */
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    console.log(`Début de la synchronisation des données locales vers Supabase pour ${tableName}...`);
    const localData = localStorage.getItem(tableName);
    
    if (!localData) {
      console.log(`Aucune donnée locale à synchroniser pour ${tableName}`);
      toast.warning(`Aucune donnée locale à synchroniser pour ${tableName}`, { position: "bottom-right" });
      return false;
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(localData);
    } catch (e) {
      console.error(`Erreur lors du parsing des données locales pour ${tableName}:`, e);
      toast.error(`Erreur lors du parsing des données locales pour ${tableName}`, { position: "bottom-right" });
      return false;
    }
    
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.log(`Aucune donnée valide à synchroniser pour ${tableName}`);
      toast.warning(`Aucune donnée valide à synchroniser pour ${tableName}`, { position: "bottom-right" });
      return false;
    }
    
    // Convertir les données de camelCase à snake_case pour Supabase
    const snakeCaseData = parsedData.map(item => camelToSnake(item));
    console.log(`Données préparées pour Supabase (${tableName}):`, snakeCaseData.length, "éléments");
    
    // Utiliser upsert pour insérer ou mettre à jour
    const { error } = await supabase
      .from(tableName)
      .upsert(snakeCaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Mettre à jour les enregistrements existants
      });
    
    if (error) {
      console.error(`Erreur lors de la synchronisation vers Supabase pour ${tableName}:`, error);
      toast.error(`Erreur lors de la synchronisation: ${error.message || 'Erreur inconnue'}`, { position: "bottom-right" });
      return false;
    }
    
    console.log(`Synchronisation réussie pour ${tableName}`);
    toast.success(`Synchronisation réussie pour ${tableName} (${parsedData.length} éléments)`, { position: "bottom-right" });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation des données vers Supabase pour ${tableName}:`, error);
    toast.error(`Erreur de synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

/**
 * Test connection to Supabase
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing Supabase connection...");
    const { data, error, status } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      console.error("HTTP Status:", status);
      return false;
    }
    
    console.log("Supabase connection successful!");
    return true;
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return false;
  }
};

/**
 * Get data counts for local and remote storage
 */
export const getDataCounts = async (): Promise<Record<string, { local: number, remote: number }>> => {
  const tables: ValidTableName[] = ['lotteries', 'products', 'visuals'];
  const results: Record<string, { local: number, remote: number }> = {};

  for (const table of tables) {
    // Get local count
    const localData = localStorage.getItem(table);
    const localCount = localData ? JSON.parse(localData).length : 0;
    
    // Get remote count
    let remoteCount = 0;
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        remoteCount = count;
      }
    } catch (e) {
      console.error(`Error getting remote count for ${table}:`, e);
    }
    
    results[table] = { local: localCount, remote: remoteCount };
  }

  return results;
};

/**
 * Push data from local storage to Supabase using upsert
 */
export const pushDataToSupabase = async (tableName: ValidTableName): Promise<any> => {
  try {
    console.log(`Starting synchronization: pushing ${tableName} to Supabase...`);
    
    // Check connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      throw new Error("Unable to connect to Supabase");
    }
    
    // Get local data
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      throw new Error(`No local ${tableName} data to sync`);
    }
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error(`No ${tableName} data to sync`);
    }
    
    // Convert data from camelCase to snake_case for Supabase
    const supabaseData = parsedData.map(item => camelToSnake(item));
    
    // Use upsert instead of delete+insert to preserve IDs and related references
    // This will update existing records and insert new ones
    const { error } = await supabase
      .from(tableName)
      .upsert(supabaseData, { 
        onConflict: 'id', // Use 'id' as the conflict resolution column
        ignoreDuplicates: false // Update existing records
      });
      
    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      throw error;
    }
    
    console.log(`Successfully synced ${parsedData.length} ${tableName} to Supabase`);
    return { success: true, tableName, localCount: parsedData.length };
  } catch (error: any) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Sync error: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
    return { success: false, tableName, error: error.message || 'Unknown error' };
  }
};

/**
 * Pull data from Supabase to local storage
 */
export const pullDataFromSupabase = async (tableName: ValidTableName): Promise<any> => {
  try {
    console.log(`Starting synchronization: pulling ${tableName} from Supabase...`);
    
    // Check connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      throw new Error("Unable to connect to Supabase");
    }
    
    // Get data from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      console.error(`Error fetching ${tableName} from Supabase:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn(`No ${tableName} found in Supabase`);
      return { success: true, tableName, message: `No ${tableName} found in Supabase` };
    }
    
    // Convert data from snake_case to camelCase for local storage
    const localData = data.map(item => snakeToCamel(item));
    
    // Save to localStorage
    localStorage.setItem(tableName, JSON.stringify(localData));
    
    // Dispatch event to notify components of the update
    const event = new Event('storageUpdate');
    window.dispatchEvent(event);
    
    console.log(`Successfully pulled ${data.length} ${tableName} from Supabase`);
    return { success: true, tableName, remoteCount: data.length };
  } catch (error: any) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Sync error: ${error.message || 'Unknown error'}`, { position: "bottom-right" });
    return { success: false, tableName, error: error.message || 'Unknown error' };
  }
};

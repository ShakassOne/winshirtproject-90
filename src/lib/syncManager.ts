import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Function to sync data from local storage to Supabase
export const syncToSupabase = async (tableName: string, data: any[]) => {
  try {
    await ensureAuthenticated();

    // Convert camelCase keys to snake_case for Supabase
    const snakeCaseData = data.map(item => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          // Convert key to snake_case
          const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          newItem[snakeCaseKey] = item[key];
        }
      }
      return newItem;
    });

    const { error } = await supabase
      .from(tableName)
      .upsert(snakeCaseData, { onConflict: 'id' });

    if (error) {
      console.error(`Error syncing ${tableName} to Supabase:`, error);
      throw new Error(`Erreur lors de la synchronisation de ${tableName} vers Supabase: ${error.message}`);
    }

    console.log(`${tableName} synced to Supabase successfully`);
    toast.success(`${tableName} synchronisé avec succès`);
  } catch (error) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Erreur lors de la synchronisation de ${tableName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error; // Re-throw to allow the calling function to handle it
  }
};

// Function to fetch data from Supabase and store it in local storage
export const syncFromSupabase = async (tableName: string) => {
  try {
    await ensureAuthenticated();

    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error fetching ${tableName} from Supabase:`, error);
      throw new Error(`Erreur lors de la récupération de ${tableName} depuis Supabase: ${error.message}`);
    }

    // Convert snake_case keys to camelCase for local storage
    const camelCaseData = data ? data.map(item => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          // Convert key to camelCase
          const camelCaseKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          newItem[camelCaseKey] = item[key];
        }
      }
      return newItem;
    }) : [];

    localStorage.setItem(tableName, JSON.stringify(camelCaseData));
    console.log(`${tableName} synced from Supabase successfully`);
    toast.success(`${tableName} synchronisé depuis Supabase avec succès`);
  } catch (error) {
    console.error(`Error during ${tableName} sync:`, error);
    toast.error(`Erreur lors de la synchronisation de ${tableName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error; // Re-throw to allow the calling function to handle it
  }
};

// Function to clear local storage
export const clearLocalStorage = async () => {
  try {
    localStorage.clear();
    console.log('Local storage cleared successfully');
    toast.success('Stockage local effacé avec succès');
  } catch (error) {
    console.error('Error clearing local storage:', error);
    toast.error('Erreur lors de l\'effacement du stockage local');
    throw error; // Re-throw to allow the calling function to handle it
  }
};

// Function to ensure the user is authenticated
export const ensureAuthenticated = async () => {
  // Si le mode développement est activé, on ignore l'authentification
  if (isDevModeEnabled()) {
    console.log("Mode développement activé - Authentification ignorée");
    return true;
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Authentication error:', error.message);
      throw new Error(`Erreur d'authentification: ${error.message}`);
    }

    if (!data.session) {
      throw new Error('Utilisateur non authentifié. Veuillez vous reconnecter.');
    }

    return data.session;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Authentication error:', errorMessage);
    throw new Error(`Authentication error: ${errorMessage}`);
  }
};

// Function to check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    await ensureAuthenticated();

    // Test simple de connexion à Supabase en récupérant les paramètres de l'application
    const { data, error } = await supabase
      .from('lotteries')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Ajoutons la fonction pour vérifier le mode dev
export const isDevModeEnabled = (): boolean => {
  return localStorage.getItem('dev_mode_enabled') === 'true';
};

// Ajoutons la fonction pour activer/désactiver le mode dev
export const toggleDevMode = (enabled: boolean): void => {
  localStorage.setItem('dev_mode_enabled', enabled ? 'true' : 'false');
  console.log(`Mode développement ${enabled ? 'activé' : 'désactivé'}`);
  
  // Déclencher un événement pour informer les autres composants
  window.dispatchEvent(new Event('devModeToggled'));
};

// Ajoutons une fonction améliorée pour vérifier la connexion Supabase avec plus de détails
export const checkSupabaseConnectionWithDetails = async () => {
  try {
    // On vérifie d'abord si nous sommes authentifiés, mais on capture l'erreur
    // au lieu de la lancer pour obtenir plus d'informations
    let authStatus;
    try {
      authStatus = await ensureAuthenticated();
    } catch (authError) {
      console.error('Authentication error:', authError);
      return { 
        connected: false, 
        error: authError instanceof Error ? authError.message : 'Erreur d\'authentification',
        authError: true
      };
    }
    
    // Test simple de connexion à Supabase en récupérant les paramètres de l'application
    const { data, error, status } = await supabase
      .from('lotteries')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { 
        connected: false, 
        error: error.message, 
        code: error.code,
        status: error.details?.includes('JWT') ? 401 : status 
      };
    }

    return { connected: true };
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    return { 
      connected: false, 
      error: e instanceof Error ? e.message : 'Erreur inconnue' 
    };
  }
};

// Function to get sync interval from local storage
export const getSyncInterval = (): number => {
  const interval = localStorage.getItem('sync_interval');
  return interval ? parseInt(interval, 10) : 60; // Default to 60 seconds
};

// Function to set sync interval in local storage
export const setSyncInterval = (interval: number): void => {
  localStorage.setItem('sync_interval', interval.toString());
};

// Function to get auto sync status from local storage
export const isAutoSyncEnabled = (): boolean => {
  return localStorage.getItem('auto_sync_enabled') === 'true';
};

// Function to set auto sync status in local storage
export const setAutoSyncEnabled = (enabled: boolean): void => {
  localStorage.setItem('auto_sync_enabled', enabled ? 'true' : 'false');
};

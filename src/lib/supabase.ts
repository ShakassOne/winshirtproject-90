
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

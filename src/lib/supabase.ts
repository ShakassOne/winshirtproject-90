
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

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

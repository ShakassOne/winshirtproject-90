import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { TableName } from '@/hooks/useSyncData';

// Convertir les clés camelCase en snake_case
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

export const syncTableToSupabase = async (tableName: TableName): Promise<boolean> => {
  try {
    // Récupérer les données locales
    const storedData = localStorage.getItem(tableName);
    if (!storedData) {
      toast.warning(`Pas de données locales à synchroniser pour ${tableName}`);
      return false;
    }
    
    const localData = JSON.parse(storedData);
    console.log(`Synchronisation de ${localData.length} éléments pour ${tableName}`);
    
    if (!Array.isArray(localData) || localData.length === 0) {
      toast.warning(`Pas de données valides pour ${tableName}`);
      return false;
    }

    try {
      // Convertir en snake_case pour Supabase
      const snakeCaseData = localData.map(item => camelToSnake(item));
      
      // Supprimer données existantes pour cette table
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .gt('id', 0);
        
      if (deleteError) {
        console.error(`Erreur lors de la suppression des données: ${deleteError.message}`);
        toast.error(`Échec de la suppression: ${deleteError.message}`);
        return false;
      }
      
      // Insérer par lots de 20
      const batchSize = 20;
      let success = true;
      
      for (let i = 0; i < snakeCaseData.length; i += batchSize) {
        const batch = snakeCaseData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(batch);
          
        if (insertError) {
          console.error(`Erreur lors de l'insertion: ${insertError.message}`);
          toast.error(`Échec de l'insertion: ${insertError.message}`);
          success = false;
          break;
        }
      }
      
      if (success) {
        toast.success(`Synchronisation réussie pour ${tableName}`);
        return true;
      }
    } catch (error) {
      console.error(`Erreur interne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      toast.error(`Erreur interne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return false;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation de ${tableName}:`, error);
    toast.error(`Erreur de synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

export const syncAllTablesToSupabase = async (): Promise<boolean> => {
  const tables: TableName[] = [
    'lotteries',
    'products',
    'lottery_participants',
    'lottery_winners',
    'orders',
    'order_items',
    'clients',
    'visuals',
    'site_settings'
  ];
  
  let allSuccess = true;
  
  for (const table of tables) {
    const success = await syncTableToSupabase(table);
    if (!success) allSuccess = false;
  }
  
  if (allSuccess) {
    toast.success("Toutes les tables ont été synchronisées avec succès");
  } else {
    toast.warning("Certaines tables n'ont pas pu être synchronisées");
  }
  
  return allSuccess;
};

// Vérifier la connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Checking Supabase connection...");
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);
      
    if (error) {
      console.error("Erreur lors de la vérification Supabase:", error);
      return false;
    }
    
    console.log("Supabase connection check successful:", data);
    return true;
  } catch (error) {
    console.error("Erreur de connexion à Supabase:", error);
    return false;
  }
};

// Récupérer des statistiques sur les données
export const getDataStatistics = async (): Promise<Record<TableName, { local: number; supabase: number }>> => {
  const tables: TableName[] = [
    'lotteries',
    'products',
    'lottery_participants',
    'lottery_winners',
    'orders',
    'order_items',
    'clients',
    'visuals',
    'site_settings'
  ];
  
  const stats: Record<TableName, { local: number; supabase: number }> = {} as any;
  
  for (const table of tables) {
    // Compter les données locales
    const storedData = localStorage.getItem(table);
    const localCount = storedData ? JSON.parse(storedData).length : 0;
    
    // Compter les données Supabase
    let supabaseCount = 0;
    
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (!error) {
        supabaseCount = count || 0;
      }
    } catch (error) {
      console.error(`Erreur lors du comptage pour ${table}:`, error);
    }
    
    stats[table] = {
      local: localCount,
      supabase: supabaseCount
    };
  }
  
  return stats;
};

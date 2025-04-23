
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export type TableName = 
  | 'lotteries'
  | 'lottery_participants'
  | 'lottery_winners'
  | 'products'
  | 'visuals'
  | 'orders'
  | 'order_items'
  | 'clients'
  | 'site_settings';

export const useSyncData = () => {
  const [syncStatus, setSyncStatus] = useState<Record<TableName, 'idle' | 'loading' | 'success' | 'error'>>({
    lotteries: 'idle',
    lottery_participants: 'idle',
    lottery_winners: 'idle',
    products: 'idle',
    visuals: 'idle',
    orders: 'idle',
    order_items: 'idle',
    clients: 'idle',
    site_settings: 'idle'
  });

  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log("Vérification de la connexion Supabase...");
      const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
      if (error) {
        console.error("Erreur de connexion:", error);
        return false;
      }
      console.log("Connexion Supabase établie:", data);
      return true;
    } catch (error) {
      console.error("Exception lors de la vérification de connexion:", error);
      return false;
    }
  };

  const getLocalData = (tableName: TableName): any[] => {
    try {
      const storedData = localStorage.getItem(tableName);
      if (!storedData) return [];
      const parsedData = JSON.parse(storedData);
      console.log(`Données locales pour ${tableName}:`, parsedData);
      return parsedData;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données locales pour ${tableName}:`, error);
      return [];
    }
  };

  const getSupabaseData = async (tableName: TableName): Promise<{data: any[] | null; count: number}> => {
    try {
      console.log(`Récupération des données Supabase pour ${tableName}...`);
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error(`Erreur Supabase pour ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Données Supabase pour ${tableName}:`, data);
      return { data, count: count || 0 };
    } catch (error) {
      console.error(`Erreur lors de la récupération des données Supabase pour ${tableName}:`, error);
      return { data: null, count: 0 };
    }
  };

  // Convertir les clés camelCase en snake_case pour Supabase
  const camelToSnake = (obj: any): any => {
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

  const syncToSupabase = async (tableName: TableName): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, [tableName]: 'loading' }));
    
    try {
      // Récupérer les données locales
      const localData = getLocalData(tableName);
      
      if (!localData.length) {
        console.log(`Pas de données locales à synchroniser pour ${tableName}`);
        toast.warning(`Pas de données locales à synchroniser pour ${tableName}`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'idle' }));
        return false;
      }
      
      console.log(`Synchronisation de ${localData.length} éléments pour ${tableName}`);
      
      // Vérifier la connexion avant de continuer
      const isConnected = await checkConnection();
      if (!isConnected) {
        console.error("Pas de connexion à Supabase");
        toast.error("Impossible de se connecter à Supabase");
        setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
        return false;
      }
      
      // Convertir les données en format snake_case pour Supabase
      const snakeCaseData = localData.map(item => camelToSnake(item));
      
      console.log(`Données converties pour ${tableName}:`, snakeCaseData);
      
      // Supprimer les données existantes dans Supabase
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .gt('id', 0);
      
      if (deleteError) {
        console.error(`Erreur lors de la suppression des données pour ${tableName}:`, deleteError);
        toast.error(`Échec de la suppression des données existantes: ${deleteError.message}`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
        return false;
      }
      
      // Insérer les nouvelles données par lots de 20
      const batchSize = 20;
      let allSuccess = true;
      
      for (let i = 0; i < snakeCaseData.length; i += batchSize) {
        const batch = snakeCaseData.slice(i, i + batchSize);
        console.log(`Insertion du lot ${i/batchSize + 1} pour ${tableName}:`, batch);
        
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(batch);
        
        if (insertError) {
          console.error(`Erreur lors de l'insertion:`, insertError);
          toast.error(`Échec de l'insertion: ${insertError.message}`);
          allSuccess = false;
          break;
        }
      }
      
      if (allSuccess) {
        toast.success(`Synchronisation réussie pour ${tableName} (${localData.length} éléments)`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'success' }));
        return true;
      } else {
        setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de ${tableName}:`, error);
      toast.error(`Erreur lors de la synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
      return false;
    }
  };

  // Convertir les clés snake_case en camelCase
  const snakeToCamel = (obj: any): any => {
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

  const syncFromSupabase = async (tableName: TableName): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, [tableName]: 'loading' }));
    
    try {
      // Vérifier la connexion avant de continuer
      const isConnected = await checkConnection();
      if (!isConnected) {
        console.error("Pas de connexion à Supabase");
        toast.error("Impossible de se connecter à Supabase");
        setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
        return false;
      }
      
      // Récupérer les données de Supabase
      console.log(`Récupération des données depuis Supabase pour ${tableName}...`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        console.error(`Erreur lors de la récupération des données depuis Supabase pour ${tableName}:`, error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        toast.warning(`Pas de données Supabase à synchroniser pour ${tableName}`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'idle' }));
        return false;
      }
      
      console.log(`Données récupérées depuis Supabase pour ${tableName}:`, data);
      
      // Convertir les données en format camelCase pour le localStorage
      const camelCaseData = data.map(item => snakeToCamel(item));
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(tableName, JSON.stringify(camelCaseData));
      console.log(`Données locales mises à jour pour ${tableName}:`, camelCaseData);
      
      toast.success(`Synchronisation locale réussie pour ${tableName} (${data.length} éléments)`);
      setSyncStatus(prev => ({ ...prev, [tableName]: 'success' }));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation locale de ${tableName}:`, error);
      toast.error(`Erreur lors de la synchronisation locale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
      return false;
    }
  };

  const syncAllToSupabase = async (): Promise<boolean> => {
    toast.info("Synchronisation de toutes les tables vers Supabase...");
    
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
      console.log(`Synchronisation de la table ${table} vers Supabase...`);
      const success = await syncToSupabase(table);
      if (!success) {
        console.error(`Échec de la synchronisation de ${table}`);
        allSuccess = false;
      }
    }
    
    if (allSuccess) {
      toast.success("Toutes les données ont été synchronisées avec succès");
    } else {
      toast.warning("Certaines tables n'ont pas pu être synchronisées");
    }
    
    return allSuccess;
  };

  return {
    syncStatus,
    checkConnection,
    getLocalData,
    getSupabaseData,
    syncToSupabase,
    syncFromSupabase,
    syncAllToSupabase
  };
};

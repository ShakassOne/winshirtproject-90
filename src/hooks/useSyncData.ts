
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { camelToSnake, snakeToCamel } from '@/lib/supabase';

export type TableName = 
  | 'lotteries'
  | 'lottery_participants'
  | 'lottery_winners'
  | 'products'
  | 'visuals'
  | 'orders'
  | 'order_items'
  | 'clients';

export const useSyncData = () => {
  const [syncStatus, setSyncStatus] = useState<Record<TableName, 'idle' | 'loading' | 'success' | 'error'>>({
    lotteries: 'idle',
    lottery_participants: 'idle',
    lottery_winners: 'idle',
    products: 'idle',
    visuals: 'idle',
    orders: 'idle',
    order_items: 'idle',
    clients: 'idle'
  });

  const checkConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
      return !error;
    } catch (error) {
      console.error("Erreur lors de la vérification de connexion:", error);
      return false;
    }
  };

  const getLocalData = (tableName: TableName): any[] => {
    try {
      const storedData = localStorage.getItem(tableName);
      if (!storedData) return [];
      return JSON.parse(storedData);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données locales pour ${tableName}:`, error);
      return [];
    }
  };

  const getSupabaseData = async (tableName: TableName): Promise<{data: any[] | null; count: number}> => {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      return { data, count: count || 0 };
    } catch (error) {
      console.error(`Erreur lors de la récupération des données Supabase pour ${tableName}:`, error);
      return { data: null, count: 0 };
    }
  };

  const syncToSupabase = async (tableName: TableName): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, [tableName]: 'loading' }));
    
    try {
      // Récupérer les données locales
      const localData = getLocalData(tableName);
      
      if (!localData.length) {
        toast.warning(`Pas de données locales à synchroniser pour ${tableName}`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'error' }));
        return false;
      }
      
      // Convertir les données en format snake_case pour Supabase
      const snakeCaseData = localData.map(item => camelToSnake(item));
      
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
      
      // Insérer les nouvelles données par lots de 25
      const batchSize = 25;
      let allSuccess = true;
      
      for (let i = 0; i < snakeCaseData.length; i += batchSize) {
        const batch = snakeCaseData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(batch);
        
        if (insertError) {
          console.error(`Erreur lors de l'insertion des données pour ${tableName}:`, insertError);
          toast.error(`Échec de l'insertion des données: ${insertError.message}`);
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

  const syncFromSupabase = async (tableName: TableName): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, [tableName]: 'loading' }));
    
    try {
      // Récupérer les données de Supabase
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.warning(`Pas de données Supabase à synchroniser pour ${tableName}`);
        setSyncStatus(prev => ({ ...prev, [tableName]: 'idle' }));
        return false;
      }
      
      // Convertir les données en format camelCase pour le localStorage
      const camelCaseData = data.map(item => snakeToCamel(item));
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(tableName, JSON.stringify(camelCaseData));
      
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
      'visuals'
    ];
    
    let allSuccess = true;
    
    for (const table of tables) {
      const success = await syncToSupabase(table);
      if (!success) allSuccess = false;
    }
    
    if (allSuccess) {
      toast.success("Toutes les données ont été synchronisées avec succès");
    } else {
      toast.error("Certaines tables n'ont pas pu être synchronisées");
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

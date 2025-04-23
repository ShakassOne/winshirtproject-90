// Importation correcte pour le type TableName
import { TableName } from '@/hooks/useSyncData';
import { supabase } from '@/integrations/supabase/client';

// Fonction pour formater le prix en euros
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// Fonction pour supprimer toutes les données de l'application
export const clearAllData = async (): Promise<boolean> => {
  try {
    const tables: TableName[] = [
      'orders',
      'order_items',
      'lottery_winners',
      'lottery_participants',
      'lotteries',
      'products',
      'visuals',
      'clients',
      'site_settings'
    ];
    
    // Effacer les données de Supabase
    for (const table of tables) {
      console.log(`Suppression des données de la table ${table} dans Supabase...`);
      const { error } = await supabase
        .from(table as any) // Utiliser une assertion de type pour éviter l'erreur TypeScript
        .delete()
        .gt('id', 0);
        
      if (error) {
        console.error(`Erreur lors de la suppression des données de ${table}:`, error);
        // Continuer avec les autres tables même s'il y a une erreur
      }
    }
    
    // Effacer les données du localStorage
    for (const table of tables) {
      console.log(`Suppression des données de la table ${table} dans localStorage...`);
      localStorage.removeItem(table);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de toutes les données:", error);
    return false;
  }
};

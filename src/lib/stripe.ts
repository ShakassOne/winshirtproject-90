
// Importation correcte pour le type TableName
import { TableName } from '@/hooks/useSyncData';
import { supabase } from '@/integrations/supabase/client';
import { StripeCheckoutResult } from '@/types/checkout';
import { toast } from '@/lib/toast';

// Fonction pour formater le prix en euros
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

/**
 * Initie un checkout avec Stripe
 * @param items Les articles à payer
 * @returns L'URL de redirection ou une erreur
 */
export const initiateStripeCheckout = async (items: any[]): Promise<StripeCheckoutResult> => {
  try {
    // Simuler un appel Stripe réussi pour le moment
    // Dans une implémentation réelle, vous appelleriez une fonction Edge Supabase
    // qui créerait une session Stripe et renverrait l'URL
    
    console.log("Initialisation du checkout Stripe pour:", items);
    
    // Retourner une URL simulée (redirection vers la page de confirmation)
    return {
      success: true,
      url: '/confirmation'
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation du checkout Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de paiement inconnue"
    };
  }
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
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .gt('id', 0);
          
        if (error) {
          console.error(`Erreur lors de la suppression des données de ${table}:`, error);
          toast.error(`Erreur Supabase: ${error.message}`);
          // Continuer avec les autres tables même s'il y a une erreur
        } else {
          toast.success(`Table ${table} nettoyée dans Supabase`);
        }
      } catch (tableError) {
        console.error(`Exception lors de la suppression des données de ${table}:`, tableError);
        // Continuer avec les autres tables
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
    toast.error(`Erreur globale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

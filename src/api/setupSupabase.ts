
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

/**
 * Crée ou met à jour les politiques RLS nécessaires pour les tables
 * Cette fonction doit être appelée lors de l'initialisation de l'application
 */
export const setupRLSPolicies = async (): Promise<boolean> => {
  try {
    // Désactiver temporairement RLS pour permettre la configuration
    const { error: disableRLSError } = await supabase.rpc('disable_rls_temporarily');
    
    if (disableRLSError) {
      console.error("Erreur lors de la désactivation temporaire de RLS:", disableRLSError);
      return false;
    }
    
    // Créer une politique pour permettre toutes les opérations (temporairement pour le développement)
    const { error: policyError } = await supabase.rpc('create_development_policies');
    
    if (policyError) {
      console.error("Erreur lors de la création des politiques:", policyError);
      return false;
    }
    
    toast.success("Politiques RLS configurées avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la configuration RLS:", error);
    toast.error(`Erreur de configuration RLS: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

/**
 * Vérifie si les fonctions RPC nécessaires existent dans Supabase
 */
export const checkRPCFunctions = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rpc_functions');
    
    if (error) {
      console.error("Les fonctions RPC nécessaires n'existent pas:", error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error("Erreur lors de la vérification des fonctions RPC:", error);
    return false;
  }
};

/**
 * Initialise la configuration Supabase complète
 */
export const initializeSupabase = async (): Promise<boolean> => {
  // Vérifier d'abord si les fonctions RPC nécessaires existent
  const rpcsExist = await checkRPCFunctions();
  
  if (!rpcsExist) {
    toast.error("Les fonctions RPC nécessaires n'existent pas dans Supabase", {
      description: "Veuillez exécuter le script SQL d'initialisation",
      position: "bottom-right"
    });
    return false;
  }
  
  // Configurer les politiques RLS
  const rlsConfigured = await setupRLSPolicies();
  
  if (!rlsConfigured) {
    toast.error("Échec de la configuration des politiques RLS", {
      position: "bottom-right"
    });
    return false;
  }
  
  return true;
};

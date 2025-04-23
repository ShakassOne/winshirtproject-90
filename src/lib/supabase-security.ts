
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { TableName } from '@/hooks/useSyncData';

/**
 * Vérifie si la sécurité RLS est activée pour les tables
 * @returns Tableau des tables sans RLS activé
 */
export const checkRLSStatus = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public');
      
    if (error) {
      console.error("Erreur lors de la vérification du statut RLS:", error);
      return [];
    }
    
    // Filtrer les tables qui n'ont pas RLS activé
    const tablesWithoutRLS = data
      .filter(table => !table.rowsecurity)
      .map(table => table.tablename);
    
    return tablesWithoutRLS;
  } catch (error) {
    console.error("Erreur lors de la vérification du statut RLS:", error);
    return [];
  }
};

/**
 * Vérifie les problèmes de sécurité Supabase courants
 */
export const checkSupabaseSecurityIssues = async () => {
  try {
    // Vérifier le RLS
    const tablesWithoutRLS = await checkRLSStatus();
    
    if (tablesWithoutRLS.length > 0) {
      toast.warning(`${tablesWithoutRLS.length} table(s) sans RLS activé: ${tablesWithoutRLS.join(', ')}`);
    } else {
      toast.success('Toutes les tables ont RLS activé');
    }
    
    // Autres vérifications de sécurité peuvent être ajoutées ici
    
  } catch (error) {
    console.error("Erreur lors des vérifications de sécurité:", error);
  }
};

/**
 * Corrige les problèmes de recherche mutable dans les fonctions SQL
 * Note: Nécessite des droits d'administrateur
 */
export const fixMutableSearchPaths = async (): Promise<boolean> => {
  try {
    // Cette opération nécessite des droits d'administration
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: "ALTER FUNCTION public.exec_sql(text) SET search_path = 'public';"
    });
    
    if (error) {
      console.error("Erreur lors de la correction du chemin de recherche:", error);
      return false;
    }
    
    toast.success("Le chemin de recherche de la fonction a été corrigé");
    return true;
  } catch (error) {
    console.error("Erreur lors de la correction du chemin de recherche:", error);
    return false;
  }
};

/**
 * Vérifie et active le RLS pour les tables publiques
 * Note: Nécessite des droits d'administrateur
 */
export const enableRLSForAllTables = async (): Promise<{ success: boolean; tables: string[] }> => {
  try {
    // Récupérer les tables sans RLS activé
    const tablesWithoutRLS = await checkRLSStatus();
    
    if (tablesWithoutRLS.length === 0) {
      return { success: true, tables: [] };
    }
    
    const enabledTables: string[] = [];
    
    // Activer le RLS pour chaque table
    for (const table of tablesWithoutRLS) {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      if (!error) {
        enabledTables.push(table);
      } else {
        console.error(`Erreur lors de l'activation du RLS pour ${table}:`, error);
      }
    }
    
    if (enabledTables.length > 0) {
      toast.success(`RLS activé pour ${enabledTables.length} table(s)`);
    }
    
    return {
      success: enabledTables.length === tablesWithoutRLS.length,
      tables: enabledTables
    };
  } catch (error) {
    console.error("Erreur lors de l'activation du RLS:", error);
    return { success: false, tables: [] };
  }
};

/**
 * Vérifie et corrige les problèmes de sécurité Supabase
 */
export const fixSupabaseSecurityIssues = async (): Promise<boolean> => {
  try {
    // Vérifier et activer le RLS
    await enableRLSForAllTables();
    
    // Corriger les chemins de recherche mutables
    await fixMutableSearchPaths();
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la correction des problèmes de sécurité:", error);
    return false;
  }
};

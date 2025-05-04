
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Initialisation de la base de données Supabase
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    // On s'assure que la connexion est bien établie
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      return false;
    }

    // Vérifier et créer l'utilisateur admin si nécessaire
    const adminEmail = 'alan@shakass.com';
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Erreur lors de la vérification des utilisateurs:", userError);
      // Continue with other initialization steps
    } else {
      // Check if admin user exists
      // Fix the type issue by checking if userData and userData.users exist before accessing
      const adminExists = userData?.users && 
        Array.isArray(userData.users) && 
        userData.users.some(user => user.email === adminEmail);
      
      if (!adminExists) {
        console.log("L'utilisateur admin n'existe pas, tentative de création...");
        // Note: Admin user creation typically requires server-side API access
        // For security reasons, this is usually done via a secure backend API or dashboard
      }
    }

    // Créer la fonction increment_lottery_participants si elle n'existe pas déjà
    const { error: fnError } = await supabase.rpc('create_increment_function');
    if (fnError) {
      console.log("La fonction d'incrément existe déjà ou n'a pas pu être créée:", fnError);
      
      // Si l'erreur est due à une fonction déjà existante, ce n'est pas un problème
      if (!fnError.message.includes("already exists")) {
        console.error("Erreur lors de la création de la fonction d'incrément:", fnError);
      }
    }

    // Create or update RLS policies for lotteries table
    try {
      // First disable RLS if it's enabled so we can adjust policies
      await supabase.rpc('disable_rls_for_lotteries');
      console.log("RLS temporairement désactivé pour mettre à jour les politiques");
      
      // Then create public access policies
      await supabase.rpc('create_lottery_public_policies');
      console.log("Politiques d'accès public créées avec succès");
      
      // Re-enable RLS with our new policies
      await supabase.rpc('enable_rls_for_lotteries');
      console.log("RLS réactivé avec nouvelles politiques");
      
    } catch (rlsError) {
      console.log("Les politiques RLS existent peut-être déjà:", rlsError);
      // Non-fatal error, continue
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Supabase:", error);
    toast.error("Erreur lors de l'initialisation de Supabase");
    return false;
  }
};

// Fonction pour vérifier directement une connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error("Erreur lors de la vérification de connexion Supabase:", error);
    return false;
  }
};

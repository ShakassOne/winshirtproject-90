
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

    // Créer la fonction increment_lottery_participants si elle n'existe pas déjà
    const { error: fnError } = await supabase.rpc('create_increment_function');
    if (fnError) {
      console.log("La fonction d'incrément existe déjà ou n'a pas pu être créée:", fnError);
      
      // Si l'erreur est due à une fonction déjà existante, ce n'est pas un problème
      if (!fnError.message.includes("already exists")) {
        console.error("Erreur lors de la création de la fonction d'incrément:", fnError);
      }
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

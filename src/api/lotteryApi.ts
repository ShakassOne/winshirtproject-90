
import { ExtendedLottery } from "@/types/lottery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { snakeToCamel } from "@/lib/utils";

// Fonction pour récupérer les loteries depuis Supabase ou localStorage
export const fetchLotteries = async (forceRefresh = false): Promise<ExtendedLottery[]> => {
  try {
    // Tester la connexion à Supabase
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      console.log("Supabase connecté, récupération des loteries depuis Supabase");
      
      // Récupérer les données depuis Supabase
      const { data, error } = await supabase.from('lotteries').select('*');
      
      if (error) {
        console.error("Erreur lors de la récupération des loteries depuis Supabase:", error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }
      
      if (data) {
        // Conversion des données snake_case en camelCase
        const camelCaseData = data.map(item => snakeToCamel(item)) as ExtendedLottery[];
        
        // Mettre à jour localStorage pour la cohérence
        try {
          localStorage.setItem('lotteries', JSON.stringify(camelCaseData));
        } catch (e) {
          console.error("Erreur lors de la mise à jour du localStorage:", e);
        }
        
        return camelCaseData;
      }
    }
    
    // Fallback à localStorage si Supabase n'est pas disponible
    console.log("Fallback à localStorage pour les loteries");
    const storedData = localStorage.getItem('lotteries');
    
    if (!storedData) {
      console.log("Aucune donnée de loterie en localStorage");
      return [];
    }
    
    try {
      const parsedData = JSON.parse(storedData) as ExtendedLottery[];
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
      console.error("Erreur lors de l'analyse des loteries du localStorage:", e);
      return [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des loteries:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // En cas d'erreur, essayer de récupérer depuis localStorage
    try {
      const storedData = localStorage.getItem('lotteries');
      if (storedData) {
        const parsedData = JSON.parse(storedData) as ExtendedLottery[];
        return Array.isArray(parsedData) ? parsedData : [];
      }
    } catch (e) {
      console.error("Fallback localStorage échoué:", e);
    }
    
    return [];
  }
};

// Fonction pour récupérer une loterie spécifique par ID
export const fetchLotteryById = async (id: number): Promise<ExtendedLottery | null> => {
  try {
    // Tester la connexion à Supabase
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      // Récupérer les données depuis Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erreur lors de la récupération de la loterie ${id} depuis Supabase:`, error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }
      
      if (data) {
        // Conversion des données snake_case en camelCase
        return snakeToCamel(data) as ExtendedLottery;
      }
    }
    
    // Fallback à localStorage si Supabase n'est pas disponible
    console.log(`Fallback à localStorage pour la loterie ${id}`);
    const storedData = localStorage.getItem('lotteries');
    
    if (!storedData) {
      console.log("Aucune donnée de loterie en localStorage");
      return null;
    }
    
    try {
      const parsedData = JSON.parse(storedData) as ExtendedLottery[];
      return parsedData.find(lottery => lottery.id === id) || null;
    } catch (e) {
      console.error("Erreur lors de l'analyse des loteries du localStorage:", e);
      return null;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de la loterie ${id}:`, error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // En cas d'erreur, essayer de récupérer depuis localStorage
    try {
      const storedData = localStorage.getItem('lotteries');
      if (storedData) {
        const parsedData = JSON.parse(storedData) as ExtendedLottery[];
        return parsedData.find(lottery => lottery.id === id) || null;
      }
    } catch (e) {
      console.error("Fallback localStorage échoué:", e);
    }
    
    return null;
  }
};

// Fonction pour tester la connexion à Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Vérifier si une valeur est stockée dans localStorage
    const storedConnectionState = localStorage.getItem('supabase_connected');
    
    // Si forceRefresh est false et qu'on a déjà un état stocké, on l'utilise
    if (storedConnectionState === 'false') {
      console.log("Connexion Supabase: utilisation de l'état stocké (false)");
      return false;
    }
    
    if (storedConnectionState === 'true') {
      console.log("Connexion Supabase: utilisation de l'état stocké (true)");
      // Faisons quand même une vérification rapide
      try {
        const { error } = await supabase.from('lotteries').select('count').limit(1);
        if (!error) {
          console.log("Connexion Supabase vérifiée: OK");
          return true;
        }
      } catch (e) {
        // Ignorer cette erreur et continuer avec la vérification complète
      }
    }
    
    // Vérification complète
    console.log("Test complet de connexion à Supabase");
    
    // Essai d'une requête simple
    const { error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      console.error("Erreur de connexion à Supabase:", error);
      localStorage.setItem('supabase_connected', 'false');
      return false;
    }
    
    // Connexion réussie
    console.log("Connexion à Supabase réussie");
    localStorage.setItem('supabase_connected', 'true');
    return true;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    localStorage.setItem('supabase_connected', 'false');
    return false;
  }
};

// Fonction pour ajouter un participant à une loterie
export const addLotteryParticipant = async (lotteryId: number, participant: {
  userId: number;
  name?: string;
  email?: string;
  avatar?: string;
}): Promise<boolean> => {
  try {
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      // Ajouter le participant dans Supabase
      const { error } = await supabase
        .from('lottery_participants')
        .insert({
          lottery_id: lotteryId,
          user_id: participant.userId,
          name: participant.name || null,
          email: participant.email || null,
          avatar: participant.avatar || null
        });
      
      if (error) {
        console.error("Erreur lors de l'ajout d'un participant:", error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }
      
      // Incrémenter le nombre de participants actuels dans la loterie
      const { error: updateError } = await supabase
        .from('lotteries')
        .update({ current_participants: supabase.rpc('increment', { inc: 1 }) })
        .eq('id', lotteryId);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du nombre de participants:", updateError);
      }
      
      // Mise à jour réussie
      return true;
    }
    
    // Mode hors ligne: mise à jour locale
    console.log("Mode hors ligne: ajout d'un participant en local");
    
    // Récupérer les participants actuels
    const storedParticipants = localStorage.getItem('lottery_participants');
    const participants = storedParticipants ? JSON.parse(storedParticipants) : [];
    
    // Ajouter le nouveau participant
    const newParticipant = {
      id: participants.length > 0 ? Math.max(...participants.map((p: any) => p.id)) + 1 : 1,
      lotteryId: lotteryId,
      userId: participant.userId,
      name: participant.name || null,
      email: participant.email || null,
      avatar: participant.avatar || null,
      createdAt: new Date().toISOString()
    };
    
    participants.push(newParticipant);
    
    // Mettre à jour le localStorage
    localStorage.setItem('lottery_participants', JSON.stringify(participants));
    
    // Mettre à jour le nombre de participants dans la loterie
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const lotteries = JSON.parse(storedLotteries);
      const updatedLotteries = lotteries.map((lottery: any) => {
        if (lottery.id === lotteryId) {
          return {
            ...lottery,
            currentParticipants: (lottery.currentParticipants || 0) + 1
          };
        }
        return lottery;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un participant:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Fonction pour s'assurer que les tables de loteries existent
export const ensureLotteryTablesExist = async (): Promise<boolean> => {
  try {
    // Vérifier si la table lotteries existe
    const { error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      // La table n'existe pas, nous devons la créer
      console.log("Table 'lotteries' n'existe pas, tentative de création...");
      
      // Dans une vraie implémentation, nous appellerions une RPC 
      // ou exécuterions un script SQL pour créer la table
      // Pour l'instant, nous allons juste signaler l'erreur
      toast.error("Les tables nécessaires n'existent pas dans Supabase", { 
        description: "Veuillez contacter l'administrateur pour créer les tables requises", 
        position: "bottom-right" 
      });
      
      return false;
    }
    
    if (error) {
      console.error("Erreur lors de la vérification de la table:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception lors de la vérification des tables:", error);
    return false;
  }
};

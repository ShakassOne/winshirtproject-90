import { useState, useEffect } from 'react';
import { ExtendedLottery, Lottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchDataFromSupabase, syncLocalDataToSupabase, checkSupabaseConnection } from '@/lib/supabase';
import { mockLotteries } from '@/data/mockData';

/**
 * Helper to convert Lottery to ExtendedLottery with proper participants array
 */
const convertToExtendedLottery = (lottery: Lottery): ExtendedLottery => {
  // Create empty participants array based on current_participants count
  const participants: Participant[] = [];
  for (let i = 0; i < (lottery.current_participants || 0); i++) {
    participants.push({
      id: -i, // Temporary negative IDs to distinguish mock participants
      name: `Participant ${i+1}`,
      avatar: null
    });
  }
  
  return {
    ...lottery,
    participants
  } as ExtendedLottery;
};

/**
 * Hook pour récupérer les loteries avec gestion d'état
 */
export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadLotteries = async () => {
    try {
      setIsLoading(true);
      console.log("lotteryService: Chargement des loteries...");
      
      // Essayer d'abord de récupérer depuis Supabase
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        const supabaseLotteries = await fetchDataFromSupabase('lotteries') as Lottery[];
        
        if (supabaseLotteries && supabaseLotteries.length > 0) {
          console.log("lotteryService: Loteries récupérées depuis Supabase:", supabaseLotteries.length);
          
          // Convertir en ExtendedLottery
          const extendedLotteries = supabaseLotteries.map(lottery => convertToExtendedLottery(lottery));
          
          setLotteries(extendedLotteries);
          localStorage.setItem('lotteries', JSON.stringify(supabaseLotteries));
          return;
        }
      }
      
      // Si aucune loterie n'est trouvée dans Supabase, utiliser les données locales
      const localData = localStorage.getItem('lotteries');
      if (localData) {
        const localLotteries = JSON.parse(localData) as Lottery[];
        if (Array.isArray(localLotteries) && localLotteries.length > 0) {
          console.log("lotteryService: Loteries récupérées depuis localStorage:", localLotteries.length);
          
          // Convertir en ExtendedLottery
          const extendedLotteries = localLotteries.map(lottery => convertToExtendedLottery(lottery));
          
          setLotteries(extendedLotteries);
          
          // Tenter de synchroniser avec Supabase
          if (isConnected) {
            await syncLocalDataToSupabase('lotteries');
          }
          return;
        }
      }
      
      // Si aucune donnée n'est trouvée, utiliser les données mock
      console.log("lotteryService: Utilisation des données mock");
      
      // Convertir en ExtendedLottery
      const extendedLotteries = mockLotteries.map(lottery => convertToExtendedLottery(lottery));
      
      setLotteries(extendedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(mockLotteries));
      
      // Tenter de synchroniser les données mock avec Supabase
      if (isConnected) {
        await syncLocalDataToSupabase('lotteries');
      }
      
    } catch (err) {
      console.error("lotteryService: Erreur lors du chargement des loteries:", err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      
      // En cas d'erreur, charger les données mock
      const extendedLotteries = mockLotteries.map(lottery => convertToExtendedLottery(lottery));
      
      setLotteries(extendedLotteries);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadLotteries();
  }, []);

  // Set up real-time subscription for lotteries
  useEffect(() => {
    const channel = supabase
      .channel('public:lotteries')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lotteries' }, 
        async (payload) => {
          console.log("lotteryService: Mise à jour en temps réel détectée", payload);
          await loadLotteries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { 
    lotteries, 
    isLoading, 
    loading: isLoading, // Alias pour compatibilité avec le reste du code
    error, 
    refreshLotteries: loadLotteries // Méthode pour rafraîchir les loteries
  };
};

// Récupérer toutes les loteries
export const getAllLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*');
    
    if (error) throw error;
    
    return data ? data.map(lottery => ({
      ...lottery,
      participants: [] // Initialize with an empty array
    })) : [];
  } catch (error) {
    console.error("lotteryService: Erreur lors de la récupération des loteries:", error);
    toast.error("Impossible de récupérer les loteries", { position: "bottom-right" });
    return [];
  }
};

// Créer une loterie
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id' | 'participants'>): Promise<ExtendedLottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .insert([lottery])
      .select();
    
    if (error) throw error;
    
    toast.success("Loterie créée avec succès", { position: "bottom-right" });
    return data ? {
      ...data[0],
      participants: [] // Initialize with an empty array
    } : null;
  } catch (error) {
    console.error("lotteryService: Erreur lors de la création de la loterie:", error);
    toast.error("Erreur lors de la création de la loterie", { position: "bottom-right" });
    return null;
  }
};

// Mettre à jour une loterie
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .update(lottery)
      .eq('id', lottery.id)
      .select();
    
    if (error) throw error;
    
    toast.success("Loterie mise à jour avec succès", { position: "bottom-right" });
    return data ? {
      ...data[0],
      participants: [] // Initialize with an empty array
    } : null;
  } catch (error) {
    console.error("lotteryService: Erreur lors de la mise à jour de la loterie:", error);
    toast.error("Erreur lors de la mise à jour de la loterie", { position: "bottom-right" });
    return null;
  }
};

// Supprimer une loterie
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Loterie supprimée avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error("lotteryService: Erreur lors de la suppression de la loterie:", error);
    toast.error("Erreur lors de la suppression de la loterie", { position: "bottom-right" });
    return false;
  }
};


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
  for (let i = 0; i < (lottery.currentParticipants || 0); i++) {
    participants.push({
      id: -i, // Temporary negative IDs to distinguish mock participants
      name: `Participant ${i+1}`,
      email: "participant@example.com",
      avatar: undefined
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
        const supabaseLotteries = await fetchDataFromSupabase('lotteries') as any[];
        
        if (supabaseLotteries && supabaseLotteries.length > 0) {
          console.log("lotteryService: Loteries récupérées depuis Supabase:", supabaseLotteries.length);
          
          // Convertir les données brutes en objets de type Lottery puis ExtendedLottery
          const lotteryObjects = supabaseLotteries.map(rawLottery => ({
            id: rawLottery.id,
            title: rawLottery.title,
            description: rawLottery.description || '',
            value: rawLottery.value,
            participants: rawLottery.current_participants || 0, // Pour satisfaire l'interface Lottery
            targetParticipants: rawLottery.target_participants,
            currentParticipants: rawLottery.current_participants || 0,
            status: rawLottery.status,
            image: rawLottery.image || '',
            linkedProducts: rawLottery.linked_products || [],
            // Use the correct format for endDate mapping from end_date
            endDate: rawLottery.end_date || new Date().toISOString(), // Fixed to match the Lottery interface
            drawDate: rawLottery.draw_date,
            featured: rawLottery.featured || false
          } as Lottery));
          
          // Convertir en ExtendedLottery
          const extendedLotteries = lotteryObjects.map(lottery => convertToExtendedLottery(lottery));
          
          setLotteries(extendedLotteries);
          localStorage.setItem('lotteries', JSON.stringify(lotteryObjects));
          return;
        }
      }
      
      // Si aucune loterie n'est trouvée dans Supabase, utiliser les données locales
      const localData = localStorage.getItem('lotteries');
      if (localData) {
        const localLotteries = JSON.parse(localData);
        if (Array.isArray(localLotteries) && localLotteries.length > 0) {
          console.log("lotteryService: Loteries récupérées depuis localStorage:", localLotteries.length);
          
          // S'assurer que chaque élément a les propriétés requises pour Lottery
          const validLotteries = localLotteries.map(lottery => ({
            ...lottery,
            participants: lottery.currentParticipants || 0, // Pour type Lottery
            // Ensure endDate is set properly from either endDate or end_date
            endDate: lottery.endDate || lottery.end_date || new Date().toISOString() // Fixed to include both possible property names
          } as Lottery));
          
          // Convertir en ExtendedLottery
          const extendedLotteries = validLotteries.map(lottery => convertToExtendedLottery(lottery));
          
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
      
      // Assurer que les mocks ont toutes les propriétés requises
      const validMockLotteries = mockLotteries.map(lottery => ({
        ...lottery,
        participants: lottery.currentParticipants || 0,
        // Ensure endDate is set properly from either endDate or end_date
        endDate: lottery.endDate || lottery.end_date || new Date().toISOString() // Fixed to include both possible property names
      } as Lottery));
      
      // Convertir en ExtendedLottery
      const extendedLotteries = validMockLotteries.map(lottery => convertToExtendedLottery(lottery));
      
      setLotteries(extendedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(validMockLotteries));
      
      // Tenter de synchroniser les données mock avec Supabase
      if (isConnected) {
        await syncLocalDataToSupabase('lotteries');
      }
      
    } catch (err) {
      console.error("lotteryService: Erreur lors du chargement des loteries:", err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      
      // En cas d'erreur, charger les données mock
      const validMockLotteries = mockLotteries.map(lottery => ({
        ...lottery,
        participants: lottery.currentParticipants || 0,
        endDate: lottery.endDate || new Date().toISOString()
      } as Lottery));
      const extendedLotteries = validMockLotteries.map(lottery => convertToExtendedLottery(lottery));
      
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
    
    return data ? data.map(rawLottery => {
      // Convertir d'abord en Lottery avec les champs requis
      const lottery: Lottery = {
        id: rawLottery.id,
        title: rawLottery.title,
        description: rawLottery.description || '',
        value: rawLottery.value,
        participants: rawLottery.current_participants || 0, // Pour type Lottery
        targetParticipants: rawLottery.target_participants,
        currentParticipants: rawLottery.current_participants || 0,
        status: rawLottery.status,
        image: rawLottery.image || '',
        linkedProducts: rawLottery.linked_products || [],
        endDate: rawLottery.end_date || new Date().toISOString(), // Ensuring endDate is properly mapped
        drawDate: rawLottery.draw_date,
        featured: rawLottery.featured || false
      };
      
      // Puis convertir en ExtendedLottery
      return convertToExtendedLottery(lottery);
    }) : [];
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
    
    if (data && data[0]) {
      // Convertir le résultat en ExtendedLottery
      const rawLottery = data[0];
      
      // Créer d'abord un objet Lottery
      const lotteryObj: Lottery = {
        id: rawLottery.id,
        title: rawLottery.title,
        description: rawLottery.description || '',
        value: rawLottery.value,
        participants: 0, // Nouvelle loterie sans participants
        targetParticipants: rawLottery.target_participants,
        currentParticipants: 0,
        status: rawLottery.status,
        image: rawLottery.image || '',
        linkedProducts: rawLottery.linked_products || [],
        endDate: rawLottery.end_date || new Date().toISOString(), // Fixed to use end_date
        drawDate: rawLottery.draw_date,
        featured: rawLottery.featured || false
      };
      
      // Puis le convertir en ExtendedLottery
      return convertToExtendedLottery(lotteryObj);
    }
    
    return null;
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
    if (data && data[0]) {
      // Convertir en Lottery puis en ExtendedLottery
      const rawLottery = data[0];
      const lotteryObj: Lottery = {
        id: rawLottery.id,
        title: rawLottery.title,
        description: rawLottery.description || '',
        value: rawLottery.value,
        participants: rawLottery.current_participants || 0,
        targetParticipants: rawLottery.target_participants,
        currentParticipants: rawLottery.current_participants || 0,
        status: rawLottery.status,
        image: rawLottery.image || '',
        linkedProducts: rawLottery.linked_products || [],
        endDate: rawLottery.end_date || new Date().toISOString(), // Fixed to use end_date
        drawDate: rawLottery.draw_date,
        featured: rawLottery.featured || false
      };
      
      return convertToExtendedLottery(lotteryObj);
    }
    return null;
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

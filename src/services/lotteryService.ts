
import { useState, useEffect } from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { fetchLotteries } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchDataFromSupabase, syncLocalDataToSupabase, checkSupabaseConnection } from '@/lib/supabase';

/**
 * Hook pour récupérer les loteries avec gestion d'état (chargement, erreurs)
 * Centralise la récupération des loteries pour toute l'application
 */
export const useLotteries = (activeOnly: boolean = false) => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getLotteries = async () => {
      try {
        setLoading(true);
        console.log("lotteryService: Chargement des loteries...");
        
        // Essayer d'abord de récupérer depuis Supabase
        const allLotteries = await fetchDataFromSupabase('lotteries') as ExtendedLottery[];
        
        if (allLotteries && allLotteries.length > 0) {
          console.log("lotteryService: Loteries récupérées depuis Supabase:", allLotteries.length);
          
          if (activeOnly) {
            const activeLots = filterActiveLotteries(allLotteries);
            console.log("lotteryService: Loteries actives:", activeLots.length);
            setLotteries(activeLots);
          } else {
            setLotteries(allLotteries);
          }
        } else {
          // Si aucune loterie n'est trouvée dans Supabase, essayer de les récupérer via l'API
          console.log("lotteryService: Essai de récupération des loteries via l'API...");
          const apiLotteries = await fetchLotteries();
          
          console.log("lotteryService: Loteries récupérées via API:", apiLotteries.length);
          
          if (activeOnly) {
            const activeLots = filterActiveLotteries(apiLotteries);
            console.log("lotteryService: Loteries actives:", activeLots.length);
            setLotteries(activeLots);
          } else {
            setLotteries(apiLotteries);
          }
        }
      } catch (err) {
        console.error("lotteryService: Erreur lors du chargement des loteries:", err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        toast.error("Impossible de charger les loteries", { position: "bottom-right" });
      } finally {
        setLoading(false);
      }
    };

    getLotteries();

    // Set up real-time subscription for lotteries
    const channel = supabase
      .channel('public:lotteries')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lotteries' }, 
        async (payload) => {
          console.log("lotteryService: Mise à jour en temps réel détectée", payload);
          await getLotteries();
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOnly]);
  
  return { 
    lotteries, 
    loading, 
    error, 
    refreshLotteries: async () => {
      setLoading(true);
      try {
        const allLotteries = await fetchDataFromSupabase('lotteries') as ExtendedLottery[];
        
        if (activeOnly) {
          setLotteries(filterActiveLotteries(allLotteries));
        } else {
          setLotteries(allLotteries);
        }
        toast.success("Loteries mises à jour", { position: "bottom-right" });
      } catch (err) {
        console.error("Erreur lors du rafraîchissement des loteries:", err);
        toast.error("Erreur lors de la mise à jour des loteries", { position: "bottom-right" });
      } finally {
        setLoading(false);
      }
    },
    syncLotteriesToSupabase: async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error("Impossible de synchroniser - Mode hors-ligne", { position: "bottom-right" });
        return false;
      }
      
      return await syncLocalDataToSupabase('lotteries');
    }
  };
};

// Export active lotteries filter function
export const filterActiveLotteries = (lotteries: ExtendedLottery[]): ExtendedLottery[] => {
  return lotteries.filter(lottery => 
    lottery.status === 'active' || lottery.status === 'relaunched'
  );
};

// Add the getActiveLotteries function that was being imported in other components
export const getActiveLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    console.log("lotteryService: Récupération des loteries actives...");
    
    // Essayer d'abord de récupérer depuis Supabase
    const allLotteries = await fetchDataFromSupabase('lotteries') as ExtendedLottery[];
    
    if (allLotteries && allLotteries.length > 0) {
      const activeLotteries = filterActiveLotteries(allLotteries);
      console.log("lotteryService: Loteries actives récupérées depuis Supabase:", activeLotteries.length);
      return activeLotteries;
    } else {
      // Si aucune loterie n'est trouvée dans Supabase, essayer de les récupérer via l'API
      const apiLotteries = await fetchLotteries();
      const activeLotteries = filterActiveLotteries(apiLotteries);
      console.log("lotteryService: Loteries actives récupérées via API:", activeLotteries.length);
      return activeLotteries;
    }
  } catch (error) {
    console.error("lotteryService: Erreur lors de la récupération des loteries actives:", error);
    toast.error("Impossible de récupérer les loteries actives", { position: "bottom-right" });
    return [];
  }
};

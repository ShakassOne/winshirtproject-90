
import { useState, useEffect } from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { fetchLotteries, testSupabaseConnection } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';

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
        
        // Récupération directe via l'API (testSupabaseConnection intégré)
        const allLotteries = await fetchLotteries(); // Remove forced refresh parameter
        console.log("lotteryService: Loteries récupérées:", allLotteries.length);
        
        if (activeOnly) {
          const activeLots = allLotteries.filter(lottery => 
            lottery.status === 'active' || lottery.status === 'relaunched'
          );
          console.log("lotteryService: Loteries actives:", activeLots.length);
          setLotteries(activeLots);
        } else {
          setLotteries(allLotteries);
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
  }, [activeOnly]);
  
  const refreshLotteries = async () => {
    try {
      setLoading(true);
      
      // Récupération directe via l'API
      const allLotteries = await fetchLotteries(); // Remove forced refresh parameter
      
      if (activeOnly) {
        setLotteries(allLotteries.filter(lottery => 
          lottery.status === 'active' || lottery.status === 'relaunched'
        ));
      } else {
        setLotteries(allLotteries);
      }
      toast.success("Loteries mises à jour", { position: "bottom-right" });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du rafraîchissement'));
      toast.error("Échec de la mise à jour des loteries", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  return { lotteries, loading, error, refreshLotteries };
};

/**
 * Fonction pour récupérer les données brutes des loteries (sans gestion d'état)
 * Utile pour les composants qui n'ont pas besoin de la gestion d'état complète
 */
export const getAllLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    return await fetchLotteries(); // Remove forceRefresh parameter
  } catch (error) {
    console.error("lotteryService: Erreur lors de la récupération des loteries:", error);
    return [];
  }
};

/**
 * Récupère les loteries actives uniquement
 */
export const getActiveLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    const allLotteries = await fetchLotteries(); // Remove forceRefresh parameter
    return allLotteries.filter(lottery => 
      lottery.status === 'active' || lottery.status === 'relaunched'
    );
  } catch (error) {
    console.error("lotteryService: Erreur lors de la récupération des loteries actives:", error);
    return [];
  }
};


import { useState, useEffect } from 'react';
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";
import { Lottery, ExtendedLottery, Participant } from "@/types/lottery";

// Hook pour récupérer les loteries
export const useLotteries = (activeOnly: boolean = false) => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLotteries = async () => {
    setLoading(true);
    try {
      console.log(`Getting lotteries from Supabase, activeOnly: ${activeOnly}`);
      
      // Essayer de récupérer du cache d'abord
      const cachedLotteries = localStorage.getItem('lotteries');
      let localLotteries: ExtendedLottery[] = [];
      
      if (cachedLotteries) {
        console.log('Using cached lotteries');
        localLotteries = JSON.parse(cachedLotteries);
        // Filtrer si nécessaire
        if (activeOnly) {
          localLotteries = localLotteries.filter(lottery => lottery.status === 'active');
        }
        setLotteries(localLotteries);
      }
      
      // Ensuite, essayer de récupérer de Supabase
      let query = supabase.from('lotteries').select('*');
      
      if (activeOnly) {
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convertir les données au format ExtendedLottery
      if (data && data.length > 0) {
        const extendedLotteries: ExtendedLottery[] = data.map(lottery => ({
          ...lottery,
          participants: [], // On remplira cela plus tard si nécessaire
          winner: null
        }));
        
        // Mettre à jour le localStorage
        localStorage.setItem('lotteries', JSON.stringify(extendedLotteries));
        
        // Mettre à jour l'état
        setLotteries(extendedLotteries);
        
        console.log(`Fetched ${extendedLotteries.length} lotteries`);
      }
      
    } catch (err) {
      console.error("Error fetching lotteries:", err);
      
      // Déjà défini à partir du cache, donc ne pas mettre à jour l'erreur
      if (!lotteries.length) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, [activeOnly]);

  return { lotteries, loading, error, refreshLotteries: fetchLotteries };
};

// Fonction pour récupérer toutes les loteries
export const getLotteries = async (activeOnly: boolean = false): Promise<ExtendedLottery[]> => {
  try {
    // Essayer d'abord de récupérer les loteries de Supabase
    let query = supabase.from('lotteries').select('*');
    
    if (activeOnly) {
      query = query.eq('status', 'active');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Convertir en ExtendedLottery
      const lotteries: ExtendedLottery[] = data.map(lottery => ({
        ...lottery,
        participants: [],
        winner: null
      }));
      
      // Mettre en cache
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      return lotteries;
    }
    
    // Fallback au localStorage
    const cachedLotteries = localStorage.getItem('lotteries');
    if (cachedLotteries) {
      const parsed = JSON.parse(cachedLotteries) as ExtendedLottery[];
      return activeOnly ? parsed.filter(lottery => lottery.status === 'active') : parsed;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting lotteries:", error);
    
    // Fallback au localStorage
    const cachedLotteries = localStorage.getItem('lotteries');
    if (cachedLotteries) {
      const parsed = JSON.parse(cachedLotteries) as ExtendedLottery[];
      return activeOnly ? parsed.filter(lottery => lottery.status === 'active') : parsed;
    }
    
    return [];
  }
};

// Créer une nouvelle loterie
export const createLottery = async (lottery: Omit<Lottery, 'id'>): Promise<Lottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .insert([lottery])
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) throw new Error('No data returned after creating lottery');
    
    // Mettre à jour le cache
    const cachedLotteries = localStorage.getItem('lotteries');
    let lotteries: ExtendedLottery[] = [];
    
    if (cachedLotteries) {
      lotteries = JSON.parse(cachedLotteries);
    }
    
    const newLottery: ExtendedLottery = {
      ...data,
      participants: [],
      winner: null
    };
    
    lotteries.push(newLottery);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    toast.success(`Loterie "${newLottery.title}" créée avec succès`);
    
    return newLottery;
  } catch (error) {
    console.error('Error creating lottery:', error);
    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return null;
  }
};

// Mettre à jour une loterie
export const updateLottery = async (id: number, lottery: Partial<Lottery>): Promise<boolean> => {
  try {
    // Mettre à jour dans Supabase
    const { error } = await supabase
      .from('lotteries')
      .update(lottery)
      .eq('id', id);
    
    if (error) throw error;
    
    // Mettre à jour le cache
    const cachedLotteries = localStorage.getItem('lotteries');
    if (cachedLotteries) {
      let lotteries: ExtendedLottery[] = JSON.parse(cachedLotteries);
      lotteries = lotteries.map(l => l.id === id ? { ...l, ...lottery } : l);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
    }
    
    toast.success('Loterie mise à jour avec succès');
    
    return true;
  } catch (error) {
    console.error('Error updating lottery:', error);
    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return false;
  }
};

// Supprimer une loterie
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    // Supprimer de Supabase
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Mettre à jour le cache
    const cachedLotteries = localStorage.getItem('lotteries');
    if (cachedLotteries) {
      let lotteries: ExtendedLottery[] = JSON.parse(cachedLotteries);
      lotteries = lotteries.filter(l => l.id !== id);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
    }
    
    toast.success('Loterie supprimée avec succès');
    
    return true;
  } catch (error) {
    console.error('Error deleting lottery:', error);
    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return false;
  }
};

// Fonction pour tirer au sort un gagnant de loterie
export const drawLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    // Mise à jour du statut de la loterie
    await updateLottery(lotteryId, { 
      status: 'completed',
      // Autres champs à mettre à jour si nécessaire
    });
    
    // Enregistrement du gagnant dans Supabase si la connexion est disponible
    try {
      const connected = await supabase.from('lottery_winners').select('id').limit(1);
      
      if (connected) {
        // Enregistrer le gagnant dans la table lottery_winners
        const { error } = await supabase.from('lottery_winners').insert({
          lottery_id: lotteryId,
          user_id: winner.id || null,
          name: winner.name || 'Anonymous',
          email: winner.email || '',
          avatar: winner.avatar || '',
          drawn_at: new Date().toISOString()
        });
        
        if (error) {
          console.error('Error recording lottery winner:', error);
        }
      }
    } catch (err) {
      console.error('Could not connect to Supabase:', err);
    }
    
    // Mise à jour du cache local
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        const lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
        const updatedLotteries = lotteries.map(lottery => {
          if (lottery.id === lotteryId) {
            return { 
              ...lottery, 
              status: 'completed',
              winner: winner
            };
          }
          return lottery;
        });
        
        localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        sessionStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      } catch (e) {
        console.error('Error updating local winner data:', e);
      }
    }
    
    toast.success(`Le gagnant ${winner.name} a été tiré au sort!`);
    return true;
  } catch (error) {
    console.error('Error drawing lottery winner:', error);
    toast.error(`Erreur lors du tirage au sort: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

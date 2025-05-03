
import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client
import { useState, useEffect } from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { supabaseToAppLottery, appToSupabaseLottery } from '@/lib/dataConverters';
import { showValidationErrors, validateLotteries } from '@/lib/syncValidator';
import { toast } from '@/lib/toast';

export const getLotteries = async (activeOnly = false) => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*');

    if (error) throw error;

    // Filtrer par statut si nécessaire
    if (activeOnly) {
      return data.filter((lottery: any) => lottery.status === 'active');
    }

    return data;
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    throw error;
  }
};

export const createLottery = async (lotteryData: any) => {
  try {
    // Convertir au format Supabase
    const supabaseLottery = appToSupabaseLottery(lotteryData);
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert([supabaseLottery]);

    if (error) throw error;

    console.log('Lottery created:', data);
    return data;
  } catch (error) {
    console.error('Error creating lottery:', error);
    throw error;
  }
};

export const updateLottery = async (lotteryId: number, lotteryData: any) => {
  try {
    // Convertir au format Supabase
    const supabaseLottery = appToSupabaseLottery(lotteryData);
    
    const { data, error } = await supabase
      .from('lotteries')
      .update(supabaseLottery)
      .eq('id', lotteryId);

    if (error) throw error;

    console.log('Lottery updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating lottery:', error);
    throw error;
  }
};

export const deleteLottery = async (lotteryId: number) => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);

    if (error) throw error;

    console.log('Lottery deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting lottery:', error);
    throw error;
  }
};

export const syncLotteriesToSupabase = async () => {
  try {
    // Fetch lotteries from localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (!storedLotteries) {
      console.error('No local lotteries found to sync');
      return false;
    }
    
    const localLotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
    
    // Validate lotteries before sync
    const validationResult = validateLotteries(localLotteries);
    if (!showValidationErrors(validationResult, 'Loterie')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }
    
    // Transform data to match Supabase schema using converter
    const supabaseReadyLotteries = localLotteries.map((lottery: ExtendedLottery) => 
      appToSupabaseLottery(lottery)
    );
    
    console.log('Preparing to sync lotteries with transformed data:', supabaseReadyLotteries);
    
    // Synchronize one lottery at a time to avoid batch errors
    for (const lottery of supabaseReadyLotteries) {
      const { error } = await supabase
        .from('lotteries')
        .upsert(lottery, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error syncing lottery ID ${lottery.id}:`, error);
        toast.error(`Erreur lors de la synchronisation de la loterie ID ${lottery.id}: ${error.message}`, { position: "bottom-right" });
        // Continue with next lottery
      }
    }

    toast.success(`Loteries synchronisées avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error syncing lotteries:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Create the useLotteries hook
export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLotteries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotteries')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data to match ExtendedLottery type using converter
        const formattedLotteries = data.map(lottery => 
          supabaseToAppLottery(lottery)
        ) as ExtendedLottery[];
        
        setLotteries(formattedLotteries);
        
        // Store in localStorage as fallback
        localStorage.setItem('lotteries', JSON.stringify(formattedLotteries));
      } else {
        // Fallback to localStorage
        const storedLotteries = localStorage.getItem('lotteries');
        if (storedLotteries) {
          setLotteries(JSON.parse(storedLotteries));
        } else {
          // If no data in localStorage, use empty array
          setLotteries([]);
        }
      }
      return true; // Return true to indicate success
    } catch (err) {
      console.error("Error fetching lotteries:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        try {
          setLotteries(JSON.parse(storedLotteries));
        } catch (e) {
          setLotteries([]);
        }
      } else {
        setLotteries([]);
      }
      return false; // Return false to indicate failure
    } finally {
      setLoading(false);
    }
  };

  const refreshLotteries = async (): Promise<boolean> => {
    return await fetchLotteries();
  };

  useEffect(() => {
    fetchLotteries();
  }, []);

  return { lotteries, loading, error, refreshLotteries };
};

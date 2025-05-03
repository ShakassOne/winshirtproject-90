
import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client
import { useState, useEffect } from 'react';
import { ExtendedLottery } from '@/types/lottery';

export const getLotteries = async (activeOnly = false) => {
  try {
    const { data, error } = await supabase
      .from('lotteries') // Remplace 'lotteries' par le nom de ta table
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
    const { data, error } = await supabase
      .from('lotteries')
      .insert([lotteryData]);

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
    const { data, error } = await supabase
      .from('lotteries')
      .update(lotteryData)
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
    // Fetch lotteries from localStorage instead of undefined function
    const storedLotteries = localStorage.getItem('lotteries');
    if (!storedLotteries) {
      console.error('No local lotteries found to sync');
      return false;
    }
    
    const localLotteries = JSON.parse(storedLotteries);
    
    const { data, error } = await supabase
      .from('lotteries')
      .upsert(localLotteries, { 
        onConflict: 'id' // Fix: use string instead of array
      });

    if (error) throw error;

    console.log('Lotteries synced to Supabase:', data);
    return true;
  } catch (error) {
    console.error('Error syncing lotteries:', error);
    throw error;
  }
};

// Create the useLotteries hook that was missing
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
        // Transform data to match ExtendedLottery type
        const formattedLotteries = data.map(lottery => ({
          id: lottery.id,
          title: lottery.title,
          description: lottery.description || '',
          image: lottery.image || '',
          value: lottery.value,
          status: lottery.status,
          featured: lottery.featured || false,
          targetParticipants: lottery.target_participants,
          currentParticipants: lottery.current_participants || 0,
          drawDate: lottery.draw_date,
          endDate: lottery.end_date,
          linkedProducts: lottery.linked_products || [],
        })) as ExtendedLottery[];
        
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
    } finally {
      setLoading(false);
    }
  };

  const refreshLotteries = async () => {
    return fetchLotteries();
  };

  useEffect(() => {
    fetchLotteries();
  }, []);

  return { lotteries, loading, error, refreshLotteries };
};

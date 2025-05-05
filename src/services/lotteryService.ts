import { ExtendedLottery, Lottery, NewLottery, Participant } from '@/types/lottery';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';

const mapLottery = (lottery: any): ExtendedLottery => {
  return {
    ...lottery,
    current_participants: lottery.current_participants || 0, // Provide a default value
  };
};

const fetchLotteriesFromSupabase = async (activeOnly: boolean = false): Promise<ExtendedLottery[]> => {
  let query = supabase.from('lotteries').select('*');
  
  if (activeOnly) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching lotteries from Supabase:", error);
    throw error;
  }

  return data.map(mapLottery);
};

const fetchAndCacheLotteries = async (forceRefresh: boolean = false): Promise<ExtendedLottery[]> => {
  console.log("Getting lotteries from Supabase, activeOnly:", false);
  
  // Check if we have cached lotteries in localStorage and if we're not forcing a refresh
  if (!forceRefresh) {
    const cachedLotteries = localStorage.getItem('lotteries');
    if (cachedLotteries) {
      try {
        const parsedLotteries = JSON.parse(cachedLotteries);
        if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
          console.log("Using cached lotteries");
          return parsedLotteries as ExtendedLottery[];
        }
      } catch (error) {
        console.error("Error parsing cached lotteries:", error);
      }
    }
  }
  
  // If no cache or forcing refresh, fetch from Supabase
  try {
    console.log("Attempting to fetch lotteries from Supabase...");
    const fetchedLotteries = await fetchLotteriesFromSupabase();
    // Use fetchedLotteries instead of fetchLotteries
    const lotteries = fetchedLotteries;
    
    // Cache the lotteries in localStorage
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    console.log(`Cached ${lotteries.length} lotteries in localStorage`);
    
    return lotteries;
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    return [];
  }
};

export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLotteries = async () => {
      setLoading(true);
      setError(null);
      try {
        const lotteries = await fetchAndCacheLotteries();
        setLotteries(lotteries);
      } catch (e: any) {
        setError(e.message || 'Failed to load lotteries');
      } finally {
        setLoading(false);
      }
    };

    loadLotteries();
  }, []);

  const refreshLotteries = async () => {
    setLoading(true);
    setError(null);
    try {
      const lotteries = await fetchAndCacheLotteries(true);
      setLotteries(lotteries);
      return lotteries; // Return the lotteries for direct use
    } catch (e: any) {
      setError(e.message || 'Failed to refresh lotteries');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { lotteries, loading, error, refreshLotteries };
};

export const getLotteries = async (activeOnly: boolean = false): Promise<ExtendedLottery[]> => {
  try {
    return await fetchAndCacheLotteries(activeOnly);
  } catch (error) {
    console.error("Error getting lotteries:", error);
    return [];
  }
};

export const createLottery = async (lottery: NewLottery): Promise<Lottery | null> => {
  const { data, error } = await supabase
    .from('lotteries')
    .insert([lottery])
    .select()
    .single();

  if (error) {
    console.error("Error creating lottery:", error);
    throw error;
  }

  // Force refresh after creating a lottery
  await fetchAndCacheLotteries(true);

  return data;
};

export const updateLottery = async (id: number, updates: Partial<Lottery>): Promise<Lottery | null> => {
  const { data, error } = await supabase
    .from('lotteries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating lottery:", error);
    throw error;
  }

  // Force refresh after updating a lottery
  await fetchAndCacheLotteries(true);

  return data;
};

export const deleteLottery = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('lotteries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting lottery:", error);
    throw error;
  }

  // Force refresh after deleting a lottery
  await fetchAndCacheLotteries(true);

  return true;
};

export const drawLotteryWinner = async (lotteryId: number, winner: Participant): Promise<Participant | null> => {
  // Logic to draw a winner (simplified for example)
  console.log(`Drawing winner for lottery ID: ${lotteryId}`, winner);
  return winner;
};

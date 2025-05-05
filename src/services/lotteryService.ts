
import { supabase } from '@/integrations/supabase/client';
import { ExtendedLottery, Lottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection } from '@/lib/supabase';
import React from 'react';

/**
 * Hook to fetch lotteries data
 */
export const useLotteries = () => {
  const [lotteries, setLotteries] = React.useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchLotteries = async (activeOnly = false) => {
    setLoading(true);
    try {
      const lotteriesData = await getLotteries(activeOnly);
      setLotteries(lotteriesData);
      return true;
    } catch (err) {
      console.error("Error fetching lotteries:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLotteries();
    
    // Set up a refresh interval to check for updates
    const interval = setInterval(() => {
      fetchLotteries();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return { lotteries, loading, error, refreshLotteries: fetchLotteries };
};

/**
 * Fetch all lotteries from Supabase or localStorage
 */
export const getLotteries = async (activeOnly = false): Promise<ExtendedLottery[]> => {
  console.log("Getting lotteries from Supabase, activeOnly:", activeOnly);
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to fetch from Supabase
      let query = supabase.from('lotteries').select('*');
      
      if (activeOnly) {
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        // Store in localStorage for offline use
        localStorage.setItem('lotteries', JSON.stringify(data));
        console.log(`Retrieved ${data.length} lotteries from Supabase`);
        return data as ExtendedLottery[];
      }
    }
    
    // Fallback to localStorage
    console.log("Storage debug: \n      LocalStorage:", localStorage.getItem('lotteries') ? "has lotteries" : "empty lotteries",
                 "\n      SessionStorage:", sessionStorage.getItem('lotteries') ? "has lotteries" : "empty lotteries");
    const storedLotteries = localStorage.getItem('lotteries');
    
    if (storedLotteries) {
      let lotteries = JSON.parse(storedLotteries) as ExtendedLottery[];
      
      if (activeOnly) {
        lotteries = lotteries.filter(lottery => lottery.status === 'active');
      }
      
      return lotteries;
    }
    
    // Return empty array if no data available
    return [];
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    
    // Try to get from localStorage as fallback
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        let lotteries = JSON.parse(storedLotteries) as ExtendedLottery[];
        
        if (activeOnly) {
          lotteries = lotteries.filter(lottery => lottery.status === 'active');
        }
        
        return lotteries;
      } catch (e) {
        return [];
      }
    }
    
    return [];
  }
};

/**
 * Create a new lottery
 */
export const createLottery = async (lottery: Omit<Lottery, 'id'>): Promise<ExtendedLottery | null> => {
  console.log("Données de loterie avant envoi:", lottery);
  
  try {
    // Check if Supabase is connected
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      console.log("Création de loterie dans Supabase:", lottery);
      
      // Try to insert in Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .insert([lottery])
        .select()
        .single();
      
      if (error) {
        console.error("Erreur lors de la création de loterie dans Supabase:", error);
        // If RBAC error, fall back to local storage
        if (error.code === '42501') {
          return createLocalLottery(lottery);
        }
        throw error;
      }
      
      // Store in localStorage for offline use
      updateLocalLotteriesWithNew(data as ExtendedLottery);
      
      toast.success(`Loterie "${data.title}" créée avec succès`);
      return data as ExtendedLottery;
    } else {
      // Fallback to localStorage if Supabase is not connected
      return createLocalLottery(lottery);
    }
  } catch (error) {
    console.error("Error creating lottery:", error);
    
    // Try to create in localStorage
    return createLocalLottery(lottery);
  }
};

/**
 * Update an existing lottery
 */
export const updateLottery = async (id: number, lottery: Partial<Lottery>): Promise<ExtendedLottery | null> => {
  try {
    // Check if Supabase is connected
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to update in Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .update(lottery)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // If permission error, fall back to local storage
        if (error.code === '42501') {
          return updateLocalLottery(id, lottery);
        }
        throw error;
      }
      
      // Update in localStorage for offline use
      updateLocalLottery(id, data as ExtendedLottery);
      
      toast.success(`Loterie "${data.title}" mise à jour avec succès`);
      return data as ExtendedLottery;
    } else {
      // Fallback to localStorage if Supabase is not connected
      return updateLocalLottery(id, lottery);
    }
  } catch (error) {
    console.error("Error updating lottery:", error);
    
    // Try to update in localStorage
    return updateLocalLottery(id, lottery);
  }
};

/**
 * Delete a lottery
 */
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    // Check if Supabase is connected
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to delete from Supabase
      const { error } = await supabase
        .from('lotteries')
        .delete()
        .eq('id', id);
      
      if (error) {
        // If permission error, fall back to local storage
        if (error.code === '42501') {
          return deleteLocalLottery(id);
        }
        throw error;
      }
      
      // Remove from localStorage
      deleteLocalLottery(id);
      
      toast.success("Loterie supprimée avec succès");
      return true;
    } else {
      // Fallback to localStorage if Supabase is not connected
      return deleteLocalLottery(id);
    }
  } catch (error) {
    console.error("Error deleting lottery:", error);
    
    // Try to delete from localStorage
    return deleteLocalLottery(id);
  }
};

/**
 * Draw a winner for a lottery
 */
export const drawLotteryWinner = async (lotteryId: number): Promise<any> => {
  try {
    // In a real app, this would call Supabase procedure
    // For now, just implement local logic to pick a random winner
    
    // Get the lottery
    const lotteries = await getLotteries();
    const lottery = lotteries.find(l => l.id === lotteryId);
    
    if (!lottery) {
      throw new Error("Lottery not found");
    }
    
    // For demo, just create a fake winner
    const winner = {
      id: Math.floor(Math.random() * 1000),
      name: `Winner #${Math.floor(Math.random() * 100)}`,
      email: `winner${Math.floor(Math.random() * 100)}@example.com`,
      avatar: 'https://source.unsplash.com/random/100x100/?person'
    };
    
    // Update lottery status to completed
    await updateLottery(lotteryId, { 
      status: 'completed',
      // In a real app, we'd store winner ID in the DB
      // For now, just make it part of the lottery object
    });
    
    // Store winner in localStorage for demo
    const lotteriesWinnersKey = 'lotteryWinners';
    const storedWinners = localStorage.getItem(lotteriesWinnersKey);
    let winners = storedWinners ? JSON.parse(storedWinners) : {};
    
    winners[lotteryId] = winner;
    localStorage.setItem(lotteriesWinnersKey, JSON.stringify(winners));
    
    toast.success(`Gagnant tiré pour la loterie "${lottery.title}"`);
    
    return winner;
  } catch (error) {
    console.error("Error drawing lottery winner:", error);
    toast.error("Erreur lors du tirage du gagnant");
    throw error;
  }
};

/**
 * Helper: Create a lottery in localStorage
 */
const createLocalLottery = (lottery: Omit<Lottery, 'id'>): ExtendedLottery => {
  // Get existing lotteries from localStorage
  const storedLotteries = localStorage.getItem('lotteries');
  const lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
  
  // Generate a new ID (in production this would be a UUID or from the server)
  const newId = lotteries.length > 0 
    ? Math.max(...lotteries.map(l => l.id)) + 1
    : 1;
  
  // Create new lottery with ID
  const newLottery: ExtendedLottery = {
    id: newId,
    title: lottery.title,
    description: lottery.description || '',
    value: lottery.value,
    targetParticipants: lottery.targetParticipants,
    currentParticipants: lottery.currentParticipants || 0,
    status: lottery.status,
    image: lottery.image || '',
    linkedProducts: lottery.linkedProducts || [],
    endDate: lottery.endDate || new Date().toISOString(),
    featured: lottery.featured || false,
    participants: [] // Add empty participants array to fix type error
  };
  
  // Add to array and save to localStorage
  lotteries.push(newLottery);
  localStorage.setItem('lotteries', JSON.stringify(lotteries));
  
  toast.success(`Loterie "${newLottery.title}" créée en mode local`);
  
  return newLottery;
};

/**
 * Helper: Update a lottery in localStorage
 */
const updateLocalLottery = (id: number, lottery: Partial<Lottery> | ExtendedLottery): ExtendedLottery | null => {
  // Get existing lotteries from localStorage
  const storedLotteries = localStorage.getItem('lotteries');
  if (!storedLotteries) return null;
  
  let lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
  
  // Find the lottery to update
  const index = lotteries.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  // Update the lottery
  lotteries[index] = { ...lotteries[index], ...lottery };
  
  // Save to localStorage
  localStorage.setItem('lotteries', JSON.stringify(lotteries));
  
  toast.success(`Loterie mise à jour en mode local`);
  
  return lotteries[index];
};

/**
 * Helper: Delete a lottery from localStorage
 */
const deleteLocalLottery = (id: number): boolean => {
  // Get existing lotteries from localStorage
  const storedLotteries = localStorage.getItem('lotteries');
  if (!storedLotteries) return false;
  
  let lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
  
  // Filter out the lottery to delete
  const filteredLotteries = lotteries.filter(l => l.id !== id);
  
  // If no lottery was removed, return false
  if (filteredLotteries.length === lotteries.length) return false;
  
  // Save to localStorage
  localStorage.setItem('lotteries', JSON.stringify(filteredLotteries));
  
  toast.success("Loterie supprimée en mode local");
  
  return true;
};

/**
 * Helper: Update localStorage lotteries with a new lottery
 */
const updateLocalLotteriesWithNew = (lottery: ExtendedLottery): void => {
  // Get existing lotteries from localStorage
  const storedLotteries = localStorage.getItem('lotteries');
  const lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
  
  // Add empty participants array if it's undefined
  const extendedLottery: ExtendedLottery = {
    ...lottery,
    participants: lottery.participants || []
  };
  
  // Remove any existing lottery with the same ID
  const filteredLotteries = lotteries.filter(l => l.id !== lottery.id);
  
  // Add the new lottery
  filteredLotteries.push(extendedLottery);
  
  // Save to localStorage
  localStorage.setItem('lotteries', JSON.stringify(filteredLotteries));
};

/**
 * Sync lotteries to Supabase
 */
export const syncLotteriesToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }
    
    const storedLotteries = localStorage.getItem('lotteries');
    if (!storedLotteries) {
      toast.warning("Aucune loterie locale à synchroniser");
      return false;
    }
    
    const lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
    if (lotteries.length === 0) {
      toast.warning("Aucune loterie trouvée");
      return false;
    }
    
    // Convert lotteries to Supabase format
    const supabaseData = lotteries.map(lottery => ({
      id: lottery.id,
      title: lottery.title,
      description: lottery.description || null,
      value: lottery.value,
      target_participants: lottery.targetParticipants,
      current_participants: lottery.currentParticipants || 0,
      status: lottery.status,
      image: lottery.image || null,
      linked_products: lottery.linkedProducts || [],
      end_date: lottery.endDate || new Date().toISOString(),
      featured: lottery.featured || false
    }));
    
    // Upsert to Supabase
    const { error } = await supabase
      .from('lotteries')
      .upsert(supabaseData, {
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });
    
    if (error) throw error;
    
    toast.success(`${lotteries.length} loteries synchronisées`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation des loteries:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

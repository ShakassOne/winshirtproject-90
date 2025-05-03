import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { useState, useEffect } from 'react';

// Helper function to convert snake_case to camelCase in lottery objects
const convertSupabaseResponse = (data: any): ExtendedLottery => {
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    value: data.value,
    status: data.status,
    featured: data.featured || false,
    image: data.image || '',
    // Support both naming conventions
    targetParticipants: data.target_participants || data.targetParticipants || 10,
    currentParticipants: data.current_participants || data.currentParticipants || 0,
    drawDate: data.draw_date || data.drawDate,
    endDate: data.end_date || data.endDate,
    linkedProducts: data.linked_products || data.linkedProducts || [],
    participants: [],
    winner: null
  };
};

// Create the useLotteries hook that was missing
export const useLotteries = (activeOnly = false) => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      try {
        const fetchedLotteries = await getLotteries(activeOnly);
        setLotteries(fetchedLotteries);
        setError(null);
      } catch (err) {
        console.error("Error in useLotteries hook:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLotteries();
  }, [activeOnly]);

  return { lotteries, loading, error, refreshLotteries: () => getLotteries(activeOnly).then(setLotteries) };
};

// Keep existing getLotteries function
export const getLotteries = async (activeOnly = false) => {
  try {
    console.log("Getting lotteries from Supabase, activeOnly:", activeOnly);
    let query = supabase.from('lotteries').select('*');
    
    // Filter by status if needed
    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching lotteries from Supabase:", error);
      throw error;
    }

    // Transform data to ensure consistent camelCase properties
    const lotteries = data.map(convertSupabaseResponse);
    
    console.log(`Retrieved ${lotteries.length} lotteries from Supabase`);
    
    return lotteries;
  } catch (error) {
    console.error('Error fetching lotteries from Supabase, trying localStorage:', error);
    
    // Fallback to localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      let lotteries = JSON.parse(storedLotteries);
      
      // Filter if necessary
      if (activeOnly) {
        lotteries = lotteries.filter((lottery: any) => lottery.status === 'active');
      }
      
      // Ensure consistent structure
      lotteries = lotteries.map((lottery: any) => ({
        ...lottery,
        currentParticipants: lottery.currentParticipants || lottery.current_participants || 0,
        targetParticipants: lottery.targetParticipants || lottery.target_participants || 10
      }));
      
      console.log(`Using ${lotteries.length} lotteries from localStorage`);
      return lotteries;
    }
    
    // Nothing found, throw error
    throw new Error('Failed to load lotteries');
  }
};

export const createLottery = async (lotteryData: any) => {
  try {
    // Convert to Supabase format (camelCase to snake_case)
    const supabaseLottery = {
      title: lotteryData.title,
      description: lotteryData.description || '',
      value: lotteryData.value,
      status: lotteryData.status || 'active',
      featured: lotteryData.featured || false,
      image: lotteryData.image || '',
      target_participants: lotteryData.targetParticipants || 10,
      current_participants: lotteryData.currentParticipants || 0,
      draw_date: lotteryData.drawDate || null,
      end_date: lotteryData.endDate || null,
      linked_products: lotteryData.linkedProducts || []
    };
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert([supabaseLottery])
      .select()
      .single();

    if (error) {
      console.error('Error creating lottery in Supabase:', error);
      throw error;
    }

    // Convert response back to camelCase for the app
    const newLottery = convertSupabaseResponse(data);
    
    // Also update localStorage for offline access
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      const lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      lotteries.push(newLottery);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
    } catch (e) {
      console.error('Error updating localStorage with new lottery:', e);
    }
    
    toast.success(`Loterie "${newLottery.title}" créée avec succès`);
    return newLottery;
  } catch (error) {
    console.error('Error creating lottery:', error);
    toast.error(`Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
};

export const updateLottery = async (lotteryId: number, lotteryData: any) => {
  try {
    // Convert to Supabase format (camelCase to snake_case)
    const supabaseLottery: any = {};
    
    if (lotteryData.title !== undefined) supabaseLottery.title = lotteryData.title;
    if (lotteryData.description !== undefined) supabaseLottery.description = lotteryData.description;
    if (lotteryData.value !== undefined) supabaseLottery.value = lotteryData.value;
    if (lotteryData.status !== undefined) supabaseLottery.status = lotteryData.status;
    if (lotteryData.featured !== undefined) supabaseLottery.featured = lotteryData.featured;
    if (lotteryData.image !== undefined) supabaseLottery.image = lotteryData.image;
    if (lotteryData.targetParticipants !== undefined) supabaseLottery.target_participants = lotteryData.targetParticipants;
    if (lotteryData.currentParticipants !== undefined) supabaseLottery.current_participants = lotteryData.currentParticipants;
    if (lotteryData.drawDate !== undefined) supabaseLottery.draw_date = lotteryData.drawDate;
    if (lotteryData.endDate !== undefined) supabaseLottery.end_date = lotteryData.endDate;
    if (lotteryData.linkedProducts !== undefined) supabaseLottery.linked_products = lotteryData.linkedProducts;
    
    const { data, error } = await supabase
      .from('lotteries')
      .update(supabaseLottery)
      .eq('id', lotteryId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating lottery ${lotteryId} in Supabase:`, error);
      throw error;
    }

    // Convert response back to camelCase
    const updatedLottery = convertSupabaseResponse(data);
    
    // Also update localStorage for offline access
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        let lotteries = JSON.parse(storedLotteries);
        const index = lotteries.findIndex((l: any) => l.id === lotteryId);
        if (index >= 0) {
          lotteries[index] = updatedLottery;
          localStorage.setItem('lotteries', JSON.stringify(lotteries));
        }
      }
    } catch (e) {
      console.error('Error updating lottery in localStorage:', e);
    }
    
    toast.success(`Loterie "${updatedLottery.title}" mise à jour avec succès`);
    return updatedLottery;
  } catch (error) {
    console.error(`Error updating lottery ${lotteryId}:`, error);
    toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
};

export const deleteLottery = async (lotteryId: number) => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);

    if (error) {
      console.error(`Error deleting lottery ${lotteryId} in Supabase:`, error);
      throw error;
    }

    // Also remove from localStorage
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        let lotteries = JSON.parse(storedLotteries);
        lotteries = lotteries.filter((l: any) => l.id !== lotteryId);
        localStorage.setItem('lotteries', JSON.stringify(lotteries));
      }
    } catch (e) {
      console.error('Error removing lottery from localStorage:', e);
    }
    
    toast.success("Loterie supprimée avec succès");
    return true;
  } catch (error) {
    console.error(`Error deleting lottery ${lotteryId}:`, error);
    toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
};

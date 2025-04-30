import { Lottery, ExtendedLottery } from '@/types/lottery';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/lib/supabase';
import { pullDataFromSupabase, pushDataToSupabase } from '@/lib/syncManager';
import { getMockLotteries } from '@/data/mockData';
import { toast } from '@/lib/toast';

// Helper function to convert lottery from API to our expected format
const mapApiLotteryToLottery = (lottery: any): Lottery => {
  return {
    id: lottery.id,
    title: lottery.title,
    description: lottery.description || '',
    value: lottery.value || 0,
    status: lottery.status.toLowerCase(),
    image: lottery.image || '',
    endDate: lottery.end_date || lottery.endDate || new Date().toISOString(),
    participants: lottery.current_participants || lottery.currentParticipants || 0,
    targetParticipants: lottery.target_participants || lottery.targetParticipants || 0,
    featured: lottery.featured || false,
    linkedProducts: lottery.linked_products || lottery.linkedProducts || [],
    winnerId: lottery.winner_id || lottery.winnerId || undefined,
    winnerName: lottery.winner_name || lottery.winnerName || undefined,
    winnerEmail: lottery.winner_email || lottery.winnerEmail || undefined,
    drawDate: lottery.draw_date || lottery.drawDate || null,
    createdAt: lottery.created_at || lottery.createdAt || new Date().toISOString(),
  };
};

/**
 * Get all lotteries 
 * @param filterActive - Only return active lotteries if true
 * @returns Promise containing an array of lotteries
 */
export const getLotteries = async (filterActive = false): Promise<Lottery[]> => {
  try {
    // Check if we're connected to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to get from Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .order('id');
        
      if (error) {
        console.error('Error fetching lotteries from Supabase:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map to expected format
        const lotteries = data.map(lottery => mapApiLotteryToLottery(lottery));
        
        // Save to localStorage for offline use
        localStorage.setItem('lotteries', JSON.stringify(data));
        
        // Filter if needed
        return filterActive 
          ? lotteries.filter(lottery => lottery.status === 'active')
          : lotteries;
      }
      
      // If no data, try to pull from Supabase
      await pullDataFromSupabase('lotteries');
    }
    
    // Try to get from localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        const parsedLotteries = JSON.parse(storedLotteries);
        // Map to expected format
        const lotteries = parsedLotteries.map((lottery: any) => mapApiLotteryToLottery(lottery));
        
        // Filter if needed
        return filterActive 
          ? lotteries.filter(lottery => lottery.status === 'active')
          : lotteries;
      } catch (e) {
        console.error('Error parsing stored lotteries:', e);
      }
    }
    
    // Fallback to mock data
    console.log('Falling back to mock lottery data');
    const mockLotteryData = getMockLotteries();
    const mappedMockLotteries = mockLotteryData.map(lottery => ({
      id: lottery.id,
      title: lottery.title,
      description: lottery.description || '',
      value: lottery.ticketPrice || 0,
      status: lottery.status.toLowerCase(),
      image: lottery.image || '',
      endDate: lottery.endDate || new Date().toISOString(),
      participants: lottery.currentParticipants || 0,
      targetParticipants: lottery.totalParticipants || 0,
      featured: false,
      linkedProducts: [],
      createdAt: lottery.createdAt || new Date().toISOString(),
    } as Lottery));
    
    // Filter if needed
    return filterActive 
      ? mappedMockLotteries.filter(lottery => lottery.status === 'active')
      : mappedMockLotteries;
      
  } catch (error) {
    console.error('Error in getLotteries:', error);
    toast.error('Erreur lors du chargement des loteries');
    return [];
  }
};

/**
 * Get lottery by ID
 * @param id - Lottery ID
 * @returns Promise containing a lottery or undefined
 */
export const getLotteryById = async (id: number): Promise<Lottery | undefined> => {
  try {
    // Check if we're connected to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to get from Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching lottery from Supabase:', error);
        throw error;
      }
      
      if (data) {
        // Map to expected format
        const lottery = mapApiLotteryToLottery(data);
        return lottery;
      }
    }
    
    // Try to get from localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        const parsedLotteries = JSON.parse(storedLotteries);
        const lottery = parsedLotteries.find((lottery: any) => lottery.id === id);
        
        if (lottery) {
          // Map to expected format
          return mapApiLotteryToLottery(lottery);
        }
      } catch (e) {
        console.error('Error parsing stored lotteries:', e);
      }
    }
    
    // Fallback to mock data
    console.log('Falling back to mock lottery data');
    const mockLotteryData = getMockLotteries();
    const mockLottery = mockLotteryData.find(lottery => lottery.id === id);
    
    if (mockLottery) {
      return {
        id: mockLottery.id,
        title: mockLottery.title,
        description: mockLottery.description || '',
        value: mockLottery.ticketPrice || 0,
        status: mockLottery.status.toLowerCase(),
        image: mockLottery.image || '',
        endDate: mockLottery.endDate || new Date().toISOString(),
        participants: mockLottery.currentParticipants || 0,
        targetParticipants: mockLottery.totalParticipants || 0,
        featured: false,
        linkedProducts: [],
        createdAt: mockLottery.createdAt || new Date().toISOString(),
      } as Lottery;
    }
    
    return undefined;
  } catch (error) {
    console.error('Error in getLotteryById:', error);
    toast.error('Erreur lors du chargement de la loterie');
    return undefined;
  }
};

/**
 * Create a new lottery
 * @param lottery - Lottery data
 * @returns Promise containing the new lottery
 */
export const createLottery = async (lottery: Omit<Lottery, 'id'>): Promise<Lottery> => {
  try {
    // Check if we're connected to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to create in Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .insert([
          {
            title: lottery.title,
            description: lottery.description,
            value: lottery.value,
            status: lottery.status,
            image: lottery.image,
            end_date: lottery.endDate,
            target_participants: lottery.targetParticipants,
            featured: lottery.featured,
            linked_products: lottery.linkedProducts,
          },
        ])
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating lottery in Supabase:', error);
        throw error;
      }
      
      if (data) {
        // Sync with local storage
        await pushDataToSupabase('lotteries');
        
        // Map to expected format
        return mapApiLotteryToLottery(data);
      }
    }
    
    throw new Error('Unable to create lottery');
  } catch (error) {
    console.error('Error in createLottery:', error);
    toast.error('Erreur lors de la création de la loterie');
    return Promise.reject(error);
  }
};

/**
 * Update an existing lottery
 * @param lottery - Lottery data
 * @returns Promise containing the updated lottery
 */
export const updateLottery = async (lottery: Lottery): Promise<Lottery> => {
  try {
    // Check if we're connected to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to update in Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .update({
          title: lottery.title,
          description: lottery.description,
          value: lottery.value,
          status: lottery.status,
          image: lottery.image,
          end_date: lottery.endDate,
          target_participants: lottery.targetParticipants,
          featured: lottery.featured,
          linked_products: lottery.linkedProducts,
        })
        .eq('id', lottery.id)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error updating lottery in Supabase:', error);
        throw error;
      }
      
      if (data) {
        // Sync with local storage
        await pushDataToSupabase('lotteries');
        
        // Map to expected format
        return mapApiLotteryToLottery(data);
      }
    }
    
    throw new Error('Unable to update lottery');
  } catch (error) {
    console.error('Error in updateLottery:', error);
    toast.error('Erreur lors de la mise à jour de la loterie');
    return Promise.reject(error);
  }
};

/**
 * Delete an existing lottery
 * @param id - Lottery ID
 * @returns Promise containing void
 */
export const deleteLottery = async (id: number): Promise<void> => {
  try {
    // Check if we're connected to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to delete in Supabase
      const { error } = await supabase
        .from('lotteries')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting lottery in Supabase:', error);
        throw error;
      }
      
      // Sync with local storage
      await pushDataToSupabase('lotteries');
      
      return;
    }
    
    throw new Error('Unable to delete lottery');
  } catch (error) {
    console.error('Error in deleteLottery:', error);
    toast.error('Erreur lors de la suppression de la loterie');
    return Promise.reject(error);
  }
};

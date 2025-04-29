import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { Lottery, LotteryParticipant, ExtendedLottery, LotteryParticipation } from '@/types/lottery';
import { User } from '@/types/auth';
import { snakeToCamel, camelToSnake } from '@/lib/utils';
import React from 'react';

// Function to get active lotteries
export const getActiveLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    // Try to get data from Supabase first
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('status', 'active')
      .order('end_date', { ascending: true });
    
    if (error) {
      console.error("Error fetching active lotteries from Supabase:", error);
      // Fall back to local storage and filter active lotteries
      const allLotteries = getLocalLotteries();
      return allLotteries.filter(lottery => lottery.status === 'active') as ExtendedLottery[];
    }
    
    if (data && data.length > 0) {
      // Convert from snake_case to camelCase
      const camelCaseData = data.map(item => snakeToCamel(item));
      
      // Convert to ExtendedLottery type
      const extendedLotteries: ExtendedLottery[] = camelCaseData.map(lottery => ({
        id: lottery.id,
        title: lottery.title,
        description: lottery.description || '',
        value: lottery.value,
        status: lottery.status,
        image: lottery.image || '',
        targetParticipants: lottery.targetParticipants,
        currentParticipants: lottery.currentParticipants || 0,
        endDate: lottery.endDate,
        drawDate: lottery.drawDate,
        featured: lottery.featured || false,
        linkedProducts: lottery.linkedProducts || []
      }));
      
      return extendedLotteries;
    }
    
    // If no data in Supabase, fall back to local storage and filter active lotteries
    const allLotteries = getLocalLotteries();
    return allLotteries.filter(lottery => lottery.status === 'active') as ExtendedLottery[];
  } catch (error) {
    console.error("Error in getActiveLotteries:", error);
    // Fall back to local storage and filter active lotteries
    const allLotteries = getLocalLotteries();
    return allLotteries.filter(lottery => lottery.status === 'active') as ExtendedLottery[];
  }
};

// Create a useLotteries hook for convenience
export const useLotteries = () => {
  const [lotteries, setLotteries] = React.useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchLotteries = async () => {
      try {
        setIsLoading(true);
        const data = await getAllLotteries();
        setLotteries(data as ExtendedLottery[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching lotteries'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  return { lotteries, isLoading, error };
};

// Function to get all lotteries
export const getAllLotteries = async (): Promise<Lottery[]> => {
  try {
    // Try to get data from Supabase first
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('end_date', { ascending: false });
    
    if (error) {
      console.error("Error fetching lotteries from Supabase:", error);
      // Fall back to local storage
      return getLocalLotteries();
    }
    
    if (data && data.length > 0) {
      // Convert from snake_case to camelCase
      const camelCaseData = data.map(item => snakeToCamel(item));
      
      // Update local storage with the latest data
      localStorage.setItem('lotteries', JSON.stringify(camelCaseData));
      
      return camelCaseData as Lottery[];
    }
    
    // If no data in Supabase, fall back to local storage
    return getLocalLotteries();
  } catch (error) {
    console.error("Error in getAllLotteries:", error);
    // Fall back to local storage in case of any error
    return getLocalLotteries();
  }
};

// Function to get lotteries from local storage
export const getLocalLotteries = (): Lottery[] => {
  try {
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      return JSON.parse(storedLotteries);
    }
  } catch (error) {
    console.error("Error parsing local lotteries:", error);
  }
  
  return [];
};

// Function to get a lottery by ID
export const getLotteryById = async (id: number): Promise<Lottery | null> => {
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching lottery ${id} from Supabase:`, error);
      // Fall back to local storage
      return getLocalLotteryById(id);
    }
    
    if (data) {
      // Convert from snake_case to camelCase
      return snakeToCamel(data) as Lottery;
    }
    
    // If not found in Supabase, try local storage
    return getLocalLotteryById(id);
  } catch (error) {
    console.error(`Error in getLotteryById(${id}):`, error);
    // Fall back to local storage in case of any error
    return getLocalLotteryById(id);
  }
};

// Function to get a lottery by ID from local storage
export const getLocalLotteryById = (id: number): Lottery | null => {
  try {
    const lotteries = getLocalLotteries();
    return lotteries.find(lottery => lottery.id === id) || null;
  } catch (error) {
    console.error(`Error getting local lottery ${id}:`, error);
    return null;
  }
};

// Function to create a new lottery
export const createLottery = async (lottery: Omit<Lottery, 'id'>): Promise<Lottery | null> => {
  try {
    // Generate a new ID for local storage
    const lotteries = getLocalLotteries();
    const newId = lotteries.length > 0 
      ? Math.max(...lotteries.map(l => l.id)) + 1 
      : 1;
    
    const newLottery: Lottery = {
      ...lottery,
      id: newId,
      participants: 0,
      createdAt: new Date().toISOString()
    };
    
    // Try to save to Supabase first
    const { data, error } = await supabase
      .from('lotteries')
      .insert(camelToSnake(newLottery))
      .select()
      .single();
    
    if (error) {
      console.error("Error creating lottery in Supabase:", error);
      // Fall back to local storage only
      return saveLocalLottery(newLottery);
    }
    
    if (data) {
      // Use the ID from Supabase
      const createdLottery = snakeToCamel(data) as Lottery;
      
      // Update local storage
      const updatedLotteries = [...lotteries, createdLottery];
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      toast.success("Loterie créée avec succès!");
      return createdLottery;
    }
    
    // Fall back to local storage if Supabase didn't return data
    return saveLocalLottery(newLottery);
  } catch (error) {
    console.error("Error in createLottery:", error);
    toast.error("Erreur lors de la création de la loterie");
    return null;
  }
};

// Function to save a lottery to local storage
export const saveLocalLottery = (lottery: Lottery): Lottery => {
  try {
    const lotteries = getLocalLotteries();
    const existingIndex = lotteries.findIndex(l => l.id === lottery.id);
    
    if (existingIndex >= 0) {
      // Update existing lottery
      lotteries[existingIndex] = lottery;
    } else {
      // Add new lottery
      lotteries.push(lottery);
    }
    
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    return lottery;
  } catch (error) {
    console.error("Error saving lottery to local storage:", error);
    throw error;
  }
};

// Function to update a lottery
export const updateLottery = async (lottery: Lottery): Promise<Lottery | null> => {
  try {
    // Try to update in Supabase first
    const { error } = await supabase
      .from('lotteries')
      .update(camelToSnake(lottery))
      .eq('id', lottery.id);
    
    if (error) {
      console.error(`Error updating lottery ${lottery.id} in Supabase:`, error);
      // Continue with local storage update even if Supabase fails
    }
    
    // Update in local storage
    const updatedLottery = saveLocalLottery(lottery);
    toast.success("Loterie mise à jour avec succès!");
    return updatedLottery;
  } catch (error) {
    console.error("Error in updateLottery:", error);
    toast.error("Erreur lors de la mise à jour de la loterie");
    return null;
  }
};

// Function to delete a lottery
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    // Try to delete from Supabase first
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting lottery ${id} from Supabase:`, error);
      // Continue with local storage deletion even if Supabase fails
    }
    
    // Delete from local storage
    const lotteries = getLocalLotteries();
    const updatedLotteries = lotteries.filter(lottery => lottery.id !== id);
    localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
    
    toast.success("Loterie supprimée avec succès!");
    return true;
  } catch (error) {
    console.error(`Error in deleteLottery(${id}):`, error);
    toast.error("Erreur lors de la suppression de la loterie");
    return false;
  }
};

// Function to participate in a lottery
export const participateInLottery = async (
  lotteryId: number, 
  user: User,
  ticketCount: number = 1
): Promise<boolean> => {
  try {
    // Get the lottery first
    const lottery = await getLotteryById(lotteryId);
    if (!lottery) {
      toast.error("Loterie introuvable");
      return false;
    }
    
    // Check if lottery is still active
    const now = new Date();
    const endDate = new Date(lottery.endDate);
    if (now > endDate) {
      toast.error("Cette loterie est terminée");
      return false;
    }
    
    // Create participant entry
    const participant: LotteryParticipant = {
      userId: user.id,
      lotteryId,
      participationDate: new Date().toISOString(),
      ticketCount,
      userName: user.name || user.email,
      userEmail: user.email
    };
    
    // Try to save participation to Supabase
    const { error } = await supabase
      .from('lottery_participants')
      .insert(camelToSnake(participant));
    
    if (error) {
      console.error("Error saving participation to Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Update lottery participants count
    const updatedLottery: Lottery = {
      ...lottery,
      participants: (lottery.participants || 0) + 1
    };
    
    // Save the updated lottery
    await updateLottery(updatedLottery);
    
    // Store participation in local storage
    const participations = getLocalParticipations();
    participations.push(participant);
    localStorage.setItem('lottery_participations', JSON.stringify(participations));
    
    toast.success("Participation enregistrée avec succès!");
    return true;
  } catch (error) {
    console.error(`Error in participateInLottery(${lotteryId}):`, error);
    toast.error("Erreur lors de l'enregistrement de la participation");
    return false;
  }
};

// Function to get all participations from local storage
export const getLocalParticipations = (): LotteryParticipant[] => {
  try {
    const storedParticipations = localStorage.getItem('lottery_participations');
    if (storedParticipations) {
      return JSON.parse(storedParticipations);
    }
  } catch (error) {
    console.error("Error parsing local participations:", error);
  }
  
  return [];
};

// Function to check if a user has participated in a lottery
export const hasUserParticipated = (lotteryId: number, userId: number): boolean => {
  try {
    const participations = getLocalParticipations();
    return participations.some(p => p.lotteryId === lotteryId && p.userId === userId);
  } catch (error) {
    console.error(`Error checking participation for lottery ${lotteryId}, user ${userId}:`, error);
    return false;
  }
};

// Function to get user participations
export const getUserParticipations = (userId: number): LotteryParticipant[] => {
  try {
    const participations = getLocalParticipations();
    return participations.filter(p => p.userId === userId);
  } catch (error) {
    console.error(`Error getting participations for user ${userId}:`, error);
    return [];
  }
};

// Function to draw a winner for a lottery
export const drawLotteryWinner = async (lotteryId: number): Promise<User | null> => {
  try {
    // In a real implementation, this would be done server-side
    // For now, we'll simulate it
    
    // Get all participants for this lottery
    const participations = getLocalParticipations()
      .filter(p => p.lotteryId === lotteryId);
    
    if (participations.length === 0) {
      toast.error("Aucun participant pour cette loterie");
      return null;
    }
    
    // Create a weighted array based on ticket count
    const weightedParticipants: number[] = [];
    participations.forEach(p => {
      for (let i = 0; i < (p.ticketCount || 1); i++) {
        weightedParticipants.push(p.userId);
      }
    });
    
    // Draw a random winner
    const randomIndex = Math.floor(Math.random() * weightedParticipants.length);
    const winnerUserId = weightedParticipants[randomIndex];
    
    // Find the winner's details
    const winnerParticipation = participations.find(p => p.userId === winnerUserId);
    
    if (!winnerParticipation) {
      toast.error("Erreur lors du tirage au sort");
      return null;
    }
    
    // Create a User object from the participation data
    const winner: User = {
      id: winnerParticipation.userId,
      name: winnerParticipation.userName,
      email: winnerParticipation.userEmail,
      role: 'user',
      registrationDate: new Date().toISOString()
    };
    
    // Update the lottery with the winner
    const lottery = await getLotteryById(lotteryId);
    if (lottery) {
      const updatedLottery: Lottery = {
        ...lottery,
        winnerId: winner.id,
        winnerName: winner.name,
        winnerEmail: winner.email,
        drawDate: new Date().toISOString()
      };
      
      await updateLottery(updatedLottery);
    }
    
    return winner;
  } catch (error) {
    console.error(`Error in drawLotteryWinner(${lotteryId}):`, error);
    toast.error("Erreur lors du tirage au sort");
    return null;
  }
};

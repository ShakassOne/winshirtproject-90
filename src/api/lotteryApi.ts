import { supabase } from '@/integrations/supabase/client';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { DatabaseTables } from '@/types/database.types';

// Function to convert Supabase lottery to ExtendedLottery type
const convertSupabaseLottery = (lottery: DatabaseTables['lotteries']): ExtendedLottery => {
  // Ensure the status is properly typed
  const typedStatus = (lottery.status as "active" | "completed" | "relaunched" | "cancelled");
  
  return {
    id: lottery.id,
    title: lottery.title,
    description: lottery.description || '',
    value: lottery.value,
    targetParticipants: lottery.target_participants,
    currentParticipants: lottery.current_participants,
    status: typedStatus,
    image: lottery.image || '',
    linkedProducts: lottery.linked_products || [],
    endDate: lottery.end_date,
    drawDate: lottery.draw_date,
    featured: lottery.featured || false,
    // Get participants and winner data if available
    participants: [],
    winner: null
  };
};

// Helper to format lottery data for Supabase
const formatLotteryForSupabase = (lottery: Omit<ExtendedLottery, 'id'> | ExtendedLottery) => {
  const { id, ...rest } = lottery as ExtendedLottery;
  
  console.log("Formatting lottery for Supabase:", rest);
  
  return {
    title: rest.title,
    description: rest.description,
    value: rest.value,
    target_participants: rest.targetParticipants,
    current_participants: rest.currentParticipants,
    status: rest.status,
    image: rest.image,
    linked_products: rest.linkedProducts || [],
    end_date: rest.endDate,
    draw_date: rest.drawDate,
    featured: rest.featured || false
  };
};

// Function to fetch participants for a lottery
const fetchParticipantsForLottery = async (lotteryId: number): Promise<Participant[]> => {
  try {
    console.log(`Fetching participants for lottery ${lotteryId}`);
    const { data, error } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId);
      
    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No participants found for lottery ${lotteryId}`);
      return [];
    }
    
    console.log(`Found ${data.length} participants for lottery ${lotteryId}`);
    
    return data.map(participant => ({
      id: participant.user_id,
      name: participant.name || '',
      email: participant.email || '',
      avatar: participant.avatar
    }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

// Function to fetch winner for a lottery
const fetchWinnerForLottery = async (lotteryId: number): Promise<Participant | null> => {
  try {
    const { data, error } = await supabase
      .from('lottery_winners')
      .select('*')
      .eq('lottery_id', lotteryId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching winner:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.user_id,
      name: data.name || '',
      email: data.email || '',
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error fetching winner:', error);
    return null;
  }
};

// Function to fetch all lotteries - Improved with better caching
export const fetchLotteries = async (forceRefresh = false): Promise<ExtendedLottery[]> => {
  try {
    console.log('Fetching lotteries from Supabase...', { forceRefresh });
    
    // Check if we have cached data and forceRefresh is not true
    if (!forceRefresh) {
      const cachedData = sessionStorage.getItem('cached_lotteries');
      const cachedTime = sessionStorage.getItem('cached_lotteries_time');
      
      if (cachedData && cachedTime) {
        // Only use cache if it's less than 30 seconds old
        const cacheAge = Date.now() - parseInt(cachedTime);
        if (cacheAge < 30000) { // 30 seconds
          console.log('Using cached lottery data (< 30 sec old)');
          return JSON.parse(cachedData);
        }
      }
    }
    
    // First check if Supabase is available
    console.log('Testing Supabase connection...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('lotteries')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error('Supabase connection failed');
      }
      
      console.log('Supabase connection test successful');
    } catch (testError) {
      console.error('Error testing Supabase connection:', testError);
      
      // If Supabase is not available, try to get from localStorage as fallback
      const localData = localStorage.getItem('lotteries');
      if (localData) {
        console.log('Using localStorage lottery data as fallback (Supabase unavailable)');
        return JSON.parse(localData);
      }
      
      return [];
    }
    
    // Fetch real data from Supabase
    console.log('Fetching lotteries from Supabase...');
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching lotteries:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No lottery data returned from Supabase');
      return [];
    }
    
    console.log(`Fetched ${data.length} lotteries from Supabase`);
    
    const extendedLotteries = data.map(convertSupabaseLottery);
    
    // Fetch participants and winners for each lottery
    for (const lottery of extendedLotteries) {
      lottery.participants = await fetchParticipantsForLottery(lottery.id);
      lottery.currentParticipants = lottery.participants.length;
      
      if (lottery.status === 'completed') {
        lottery.winner = await fetchWinnerForLottery(lottery.id);
      }
    }
    
    // Update cache
    sessionStorage.setItem('cached_lotteries', JSON.stringify(extendedLotteries));
    sessionStorage.setItem('cached_lotteries_time', Date.now().toString());
    
    // Also update localStorage for broader availability
    localStorage.setItem('lotteries', JSON.stringify(extendedLotteries));
    
    return extendedLotteries;
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    toast.error("Erreur lors de la récupération des loteries.");
    
    // Try to get from localStorage as fallback
    const localData = localStorage.getItem('lotteries');
    if (localData) {
      console.log('Using localStorage lottery data as fallback');
      return JSON.parse(localData);
    }
    
    return [];
  }
};

// Function to create a new lottery - with better error handling
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    console.log('Creating lottery in Supabase:', lottery);
    
    // Format lottery data for Supabase
    const formattedLottery = formatLotteryForSupabase(lottery);
    
    // Force clear cache before creating
    sessionStorage.removeItem('cached_lotteries');
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert(formattedLottery)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lottery in Supabase:', error);
      
      // Provide more context in the error message
      if (error.code === '23505') {
        toast.error("Cette loterie existe déjà.");
      } else if (error.code === '23503') {
        toast.error("Référence invalide. Veuillez vérifier les produits liés.");
      } else {
        toast.error(`Erreur lors de la création de la loterie: ${error.message}`);
      }
      
      throw error;
    }
    
    if (!data) {
      console.error('No data returned after creating lottery');
      toast.error("Aucune donnée retournée après création de la loterie.");
      throw new Error('No data returned after creating lottery');
    }
    
    console.log('Lottery created successfully in Supabase:', data);
    
    // Convert to ExtendedLottery type
    const newLottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    toast.success("Loterie créée avec succès !");
    return newLottery;
  } catch (error) {
    console.error('Error creating lottery:', error);
    
    // Retry with localStorage fallback only if the error is a connection issue
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      try {
        // Fallback to localStorage
        console.log('Falling back to localStorage for lottery creation');
        
        const lotteriesString = localStorage.getItem('lotteries');
        const lotteries = lotteriesString ? JSON.parse(lotteriesString) : [];
        
        // Generate a fake ID
        const newId = lotteries.length > 0 
          ? Math.max(...lotteries.map((l: any) => l.id)) + 1 
          : 1;
        
        const newLottery: ExtendedLottery = {
          ...lottery as Omit<ExtendedLottery, 'id'>,
          id: newId,
        };
        
        lotteries.push(newLottery);
        localStorage.setItem('lotteries', JSON.stringify(lotteries));
        
        toast.success("Loterie créée localement (mode hors ligne)");
        return newLottery;
      } catch (localStorageError) {
        console.error('Error with localStorage fallback:', localStorageError);
        toast.error("Erreur lors de la création locale de la loterie.");
      }
    }
    
    return null;
  }
};

// Function to update an existing lottery
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    console.log('Updating lottery in Supabase:', lottery);
    
    const formattedLottery = formatLotteryForSupabase(lottery);
    
    // Force clear cache before updating
    sessionStorage.removeItem('cached_lotteries');
    
    // Perform update in Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .update(formattedLottery)
      .eq('id', lottery.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lottery in Supabase:', error);
      
      // Provide more context in the error message
      if (error.code === '23503') {
        toast.error("Référence invalide. Veuillez vérifier les produits liés.");
      } else {
        toast.error(`Erreur lors de la mise à jour de la loterie: ${error.message}`);
      }
      
      throw error;
    }
    
    if (!data) {
      console.error('No data returned after updating lottery');
      toast.error("Aucune donnée retournée après mise à jour de la loterie.");
      throw new Error('No data returned after updating lottery');
    }
    
    console.log('Lottery updated successfully in Supabase:', data);
    
    // Convert to ExtendedLottery type
    const updatedLottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Preserve participants and winner from original lottery
    updatedLottery.participants = lottery.participants || [];
    updatedLottery.winner = lottery.winner;
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    toast.success("Loterie modifiée avec succès !");
    return updatedLottery;
  } catch (error) {
    console.error('Error updating lottery:', error);
    
    // Retry with localStorage fallback only if the error is a connection issue
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      try {
        // Fallback to localStorage
        console.log('Falling back to localStorage for lottery update');
        
        const lotteriesString = localStorage.getItem('lotteries');
        if (!lotteriesString) return null;
        
        const lotteries = JSON.parse(lotteriesString);
        const index = lotteries.findIndex((l: any) => l.id === lottery.id);
        
        if (index !== -1) {
          lotteries[index] = lottery;
          localStorage.setItem('lotteries', JSON.stringify(lotteries));
          
          toast.success("Loterie modifiée localement (mode hors ligne)");
          return lottery;
        }
        
        return null;
      } catch (localStorageError) {
        console.error('Error with localStorage fallback:', localStorageError);
        toast.error("Erreur lors de la mise à jour locale de la loterie.");
      }
    }
    
    return null;
  }
};

// Function to delete a lottery
export const deleteLottery = async (lotteryId: number): Promise<boolean> => {
  try {
    console.log(`Deleting lottery ${lotteryId} from Supabase`);
    
    // Perform deletion in Supabase
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);
    
    if (error) {
      console.error('Error deleting lottery from Supabase:', error);
      throw error;
    }
    
    console.log(`Lottery ${lotteryId} deleted successfully from Supabase`);
    
    // Clear cache to force refresh
    sessionStorage.removeItem('cached_lotteries');
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    return true;
  } catch (error) {
    console.error('Error deleting lottery:', error);
    toast.error("Erreur lors de la suppression de la loterie.");
    
    try {
      // Fallback to localStorage
      console.log('Falling back to localStorage for lottery deletion');
      
      const lotteriesString = localStorage.getItem('lotteries');
      if (!lotteriesString) return false;
      
      const lotteries = JSON.parse(lotteriesString);
      const updatedLotteries = lotteries.filter((l: any) => l.id !== lotteryId);
      
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      return true;
    } catch (localStorageError) {
      console.error('Error with localStorage fallback:', localStorageError);
      return false;
    }
  }
};

// Function to toggle a lottery's featured status
export const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling lottery ${lotteryId} featured status to ${featured}`);
    
    // Update featured status in Supabase
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', lotteryId);
    
    if (error) {
      console.error('Error toggling lottery featured status in Supabase:', error);
      throw error;
    }
    
    console.log(`Lottery ${lotteryId} featured status updated successfully in Supabase`);
    
    // Clear cache to force refresh
    sessionStorage.removeItem('cached_lotteries');
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    return true;
  } catch (error) {
    console.error('Error toggling lottery featured status:', error);
    toast.error("Erreur lors de la mise à jour du statut vedette.");
    
    try {
      // Fallback to localStorage
      console.log('Falling back to localStorage for lottery featured toggle');
      
      const lotteriesString = localStorage.getItem('lotteries');
      if (!lotteriesString) return false;
      
      const lotteries = JSON.parse(lotteriesString);
      const updatedLotteries = lotteries.map((l: any) => {
        if (l.id === lotteryId) {
          return { ...l, featured };
        }
        return l;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      return true;
    } catch (localStorageError) {
      console.error('Error with localStorage fallback:', localStorageError);
      return false;
    }
  }
};

// Function to update the winner of a lottery
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    console.log(`Updating lottery ${lotteryId} winner in Supabase:`, winner);
    
    // Begin transaction by updating lottery status
    const { error: lotteryError } = await supabase
      .from('lotteries')
      .update({
        status: 'completed',
        draw_date: new Date().toISOString()
      })
      .eq('id', lotteryId);
    
    if (lotteryError) {
      console.error('Error updating lottery status in Supabase:', lotteryError);
      throw lotteryError;
    }
    
    // Add winner to lottery_winners table
    const { error: winnerError } = await supabase
      .from('lottery_winners')
      .insert({
        lottery_id: lotteryId,
        user_id: winner.id,
        name: winner.name,
        email: winner.email,
        avatar: winner.avatar
      });
    
    if (winnerError) {
      console.error('Error adding winner to Supabase:', winnerError);
      throw winnerError;
    }
    
    console.log(`Lottery ${lotteryId} winner updated successfully in Supabase`);
    
    // Clear cache to force refresh
    sessionStorage.removeItem('cached_lotteries');
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    return true;
  } catch (error) {
    console.error('Error updating lottery winner:', error);
    toast.error("Erreur lors de la mise à jour du gagnant.");
    
    try {
      // Fallback to localStorage
      console.log('Falling back to localStorage for lottery winner update');
      
      const lotteriesString = localStorage.getItem('lotteries');
      if (!lotteriesString) return false;
      
      const lotteries = JSON.parse(lotteriesString);
      const updatedLotteries = lotteries.map((l: any) => {
        if (l.id === lotteryId) {
          return { 
            ...l, 
            status: 'completed', 
            winner, 
            drawDate: new Date().toISOString() 
          };
        }
        return l;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      return true;
    } catch (localStorageError) {
      console.error('Error with localStorage fallback:', localStorageError);
      return false;
    }
  }
};

// Function to add a participant to a lottery
export const addLotteryParticipant = async (lotteryId: number, participant: Participant): Promise<boolean> => {
  try {
    console.log(`Adding participant to lottery ${lotteryId} in Supabase:`, participant);
    
    // Force clear cache before updating
    sessionStorage.removeItem('cached_lotteries');
    
    // First check current participants count
    const { data: lotteryData, error: lotteryError } = await supabase
      .from('lotteries')
      .select('current_participants, target_participants')
      .eq('id', lotteryId)
      .single();
    
    if (lotteryError) {
      console.error('Error getting lottery data from Supabase:', lotteryError);
      toast.error(`Erreur lors de la récupération des données de la loterie: ${lotteryError.message}`);
      throw lotteryError;
    }
    
    // Add participant
    const { error: participantError } = await supabase
      .from('lottery_participants')
      .insert({
        lottery_id: lotteryId,
        user_id: participant.id,
        name: participant.name,
        email: participant.email,
        avatar: participant.avatar
      });
    
    if (participantError) {
      console.error('Error adding participant to Supabase:', participantError);
      
      // Provide more context in the error message
      if (participantError.code === '23505') {
        toast.error("Ce participant est déjà inscrit à cette loterie.");
      } else {
        toast.error(`Erreur lors de l'ajout du participant: ${participantError.message}`);
      }
      
      throw participantError;
    }
    
    // Update participant count
    const newCount = lotteryData.current_participants + 1;
    const { error: updateError } = await supabase
      .from('lotteries')
      .update({ current_participants: newCount })
      .eq('id', lotteryId);
    
    if (updateError) {
      console.error('Error updating participant count in Supabase:', updateError);
      toast.error(`Erreur lors de la mise à jour du nombre de participants: ${updateError.message}`);
      throw updateError;
    }
    
    console.log(`Participant added successfully to lottery ${lotteryId} in Supabase`);
    
    // Check if participant count has reached target
    if (newCount >= lotteryData.target_participants) {
      toast.info(`La loterie a atteint son objectif de participants ! Elle est prête pour le tirage.`);
    }
    
    // Wait for fetchLotteries to update both storage locations
    await fetchLotteries(true);
    
    toast.success("Participation enregistrée avec succès !");
    return true;
  } catch (error) {
    console.error('Error adding participant to lottery:', error);
    
    // Retry with localStorage fallback only if the error is a connection issue
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      try {
        // Fallback to localStorage
        console.log('Falling back to localStorage for adding participant');
        
        const lotteriesString = localStorage.getItem('lotteries');
        if (!lotteriesString) return false;
        
        const lotteries = JSON.parse(lotteriesString);
        const updatedLotteries = lotteries.map((l: any) => {
          if (l.id === lotteryId) {
            const participants = l.participants || [];
            const newParticipants = [...participants, participant];
            return { 
              ...l, 
              participants: newParticipants,
              currentParticipants: newParticipants.length
            };
          }
          return l;
        });
        
        localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        
        toast.success("Participation enregistrée localement (mode hors ligne)");
        return true;
      } catch (localStorageError) {
        console.error('Error with localStorage fallback:', localStorageError);
        toast.error("Erreur lors de l'enregistrement local de la participation.");
      }
    }
    
    return false;
  }
};

// Function to fetch a single lottery by ID
export const fetchLotteryById = async (lotteryId: number): Promise<ExtendedLottery | null> => {
  try {
    console.log(`Fetching lottery ${lotteryId} from Supabase`);
    
    // First try to get from cache
    const cachedData = sessionStorage.getItem('cached_lotteries');
    if (cachedData) {
      const lotteries = JSON.parse(cachedData) as ExtendedLottery[];
      const cachedLottery = lotteries.find(l => l.id === lotteryId);
      
      if (cachedLottery) {
        console.log(`Found lottery ${lotteryId} in cache`);
        return cachedLottery;
      }
    }
    
    // Not found in cache, fetch from Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .single();
    
    if (error) {
      console.error(`Error fetching lottery ${lotteryId} from Supabase:`, error);
      throw error;
    }
    
    if (!data) {
      console.log(`Lottery ${lotteryId} not found in Supabase`);
      return null;
    }
    
    console.log(`Fetched lottery ${lotteryId} from Supabase:`, data);
    
    const lottery = convertSupabaseLottery(data);
    
    // Fetch participants and winner
    lottery.participants = await fetchParticipantsForLottery(lottery.id);
    
    if (lottery.status === 'completed') {
      lottery.winner = await fetchWinnerForLottery(lottery.id);
    }
    
    return lottery;
  } catch (error) {
    console.error('Error fetching lottery by ID:', error);
    
    // Try to get from localStorage as fallback
    try {
      console.log('Falling back to localStorage for lottery by ID');
      
      const lotteriesString = localStorage.getItem('lotteries');
      if (lotteriesString) {
        const lotteries = JSON.parse(lotteriesString);
        return lotteries.find((l: any) => l.id === lotteryId) || null;
      }
    } catch (localStorageError) {
      console.error('Error with localStorage fallback:', localStorageError);
    }
    
    return null;
  }
};

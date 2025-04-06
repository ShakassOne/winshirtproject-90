
import { supabase } from '@/integrations/supabase/client';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

// Function to convert Supabase lottery to ExtendedLottery type
const convertSupabaseLottery = (lottery: any): ExtendedLottery => {
  return {
    id: lottery.id,
    title: lottery.title,
    description: lottery.description,
    value: lottery.value,
    targetParticipants: lottery.target_participants,
    currentParticipants: lottery.current_participants,
    status: lottery.status,
    image: lottery.image,
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
    const { data, error } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId);
      
    if (error) throw error;
    
    return data.map(participant => ({
      id: participant.user_id,
      name: participant.name,
      email: participant.email,
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
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    return {
      id: data.user_id,
      name: data.name,
      email: data.email,
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error fetching winner:', error);
    return null;
  }
};

// Function to fetch all lotteries
export const fetchLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    
    const extendedLotteries = data.map(convertSupabaseLottery);
    
    // Fetch participants and winners for each lottery
    for (const lottery of extendedLotteries) {
      lottery.participants = await fetchParticipantsForLottery(lottery.id);
      
      if (lottery.status === 'completed') {
        lottery.winner = await fetchWinnerForLottery(lottery.id);
      }
    }
    
    return extendedLotteries;
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    toast.error("Erreur lors de la récupération des loteries.");
    return [];
  }
};

// Function to create a new lottery
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    const formattedLottery = formatLotteryForSupabase(lottery);
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert(formattedLottery)
      .select()
      .single();
    
    if (error) throw error;
    
    return convertSupabaseLottery(data);
  } catch (error) {
    console.error('Error creating lottery:', error);
    toast.error("Erreur lors de la création de la loterie.");
    return null;
  }
};

// Function to update an existing lottery
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    const formattedLottery = formatLotteryForSupabase(lottery);
    
    const { data, error } = await supabase
      .from('lotteries')
      .update(formattedLottery)
      .eq('id', lottery.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return convertSupabaseLottery(data);
  } catch (error) {
    console.error('Error updating lottery:', error);
    toast.error("Erreur lors de la mise à jour de la loterie.");
    return null;
  }
};

// Function to delete a lottery
export const deleteLottery = async (lotteryId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting lottery:', error);
    toast.error("Erreur lors de la suppression de la loterie.");
    return false;
  }
};

// Function to toggle a lottery's featured status
export const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error toggling lottery featured status:', error);
    toast.error("Erreur lors de la mise à jour du statut vedette.");
    return false;
  }
};

// Function to update the winner of a lottery
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    // Begin transaction by updating lottery status
    const { error: lotteryError } = await supabase
      .from('lotteries')
      .update({
        status: 'completed',
        draw_date: new Date().toISOString()
      })
      .eq('id', lotteryId);
    
    if (lotteryError) throw lotteryError;
    
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
    
    if (winnerError) throw winnerError;
    
    return true;
  } catch (error) {
    console.error('Error updating lottery winner:', error);
    toast.error("Erreur lors de la mise à jour du gagnant.");
    return false;
  }
};

// Function to add a participant to a lottery
export const addLotteryParticipant = async (lotteryId: number, participant: Participant): Promise<boolean> => {
  try {
    // First check current participants count
    const { data: lotteryData, error: lotteryError } = await supabase
      .from('lotteries')
      .select('current_participants, target_participants')
      .eq('id', lotteryId)
      .single();
    
    if (lotteryError) throw lotteryError;
    
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
    
    if (participantError) throw participantError;
    
    // Update participant count
    const newCount = lotteryData.current_participants + 1;
    const { error: updateError } = await supabase
      .from('lotteries')
      .update({ current_participants: newCount })
      .eq('id', lotteryId);
    
    if (updateError) throw updateError;
    
    // Check if participant count has reached target
    if (newCount >= lotteryData.target_participants) {
      toast.info(`La loterie a atteint son objectif de participants ! Elle est prête pour le tirage.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding participant to lottery:', error);
    toast.error("Erreur lors de l'ajout du participant.");
    return false;
  }
};

// Function to fetch a single lottery by ID
export const fetchLotteryById = async (lotteryId: number): Promise<ExtendedLottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .single();
    
    if (error) throw error;
    
    const lottery = convertSupabaseLottery(data);
    
    // Fetch participants and winner
    lottery.participants = await fetchParticipantsForLottery(lottery.id);
    
    if (lottery.status === 'completed') {
      lottery.winner = await fetchWinnerForLottery(lottery.id);
    }
    
    return lottery;
  } catch (error) {
    console.error('Error fetching lottery by ID:', error);
    return null;
  }
};


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

// Function to fetch all lotteries - Improved with direct Supabase access only
export const fetchLotteries = async (forceRefresh = false): Promise<ExtendedLottery[]> => {
  try {
    console.log('Fetching lotteries from Supabase...', { forceRefresh });
    
    // Always get data directly from Supabase
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
      
      console.log('Supabase connection test successful', testData);
    } catch (testError) {
      console.error('Error testing Supabase connection:', testError);
      toast.error("Impossible de se connecter à Supabase");
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
      toast.error(`Erreur lors de la récupération des loteries: ${error.message}`);
      return [];
    }
    
    if (!data) {
      console.log('No lottery data returned from Supabase');
      return [];
    }
    
    console.log(`Fetched ${data.length} lotteries from Supabase:`, data);
    
    const extendedLotteries = data.map(convertSupabaseLottery);
    console.log('Converted to ExtendedLottery format:', extendedLotteries);
    
    // Fetch participants and winners for each lottery
    for (const lottery of extendedLotteries) {
      lottery.participants = await fetchParticipantsForLottery(lottery.id);
      lottery.currentParticipants = lottery.participants.length;
      
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

// Function to create a new lottery - with direct Supabase usage only
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    console.log('Creating lottery in Supabase:', lottery);
    
    // Format lottery data for Supabase
    const formattedLottery = formatLotteryForSupabase(lottery);
    
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
    
    toast.success("Loterie créée avec succès !");
    return newLottery;
  } catch (error) {
    console.error('Error creating lottery:', error);
    toast.error(`Erreur lors de la création de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Function to update an existing lottery - with direct Supabase usage only
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    console.log('Updating lottery in Supabase:', lottery);
    
    const formattedLottery = formatLotteryForSupabase(lottery);
    
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
    
    toast.success("Loterie modifiée avec succès !");
    return updatedLottery;
  } catch (error) {
    console.error('Error updating lottery:', error);
    toast.error(`Erreur lors de la mise à jour de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Function to delete a lottery - with direct Supabase usage only
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting lottery with ID ${id}...`);
    
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting lottery with ID ${id}:`, error);
      toast.error(`Erreur lors de la suppression de la loterie: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully deleted lottery with ID ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Function to toggle lottery featured status - with direct Supabase usage only
export const toggleLotteryFeatured = async (id: number, featured: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling featured status for lottery with ID ${id} to ${featured}...`);
    
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', id);
    
    if (error) {
      console.error(`Error toggling featured status for lottery with ID ${id}:`, error);
      toast.error(`Erreur lors de la modification du statut vedette: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully toggled featured status for lottery with ID ${id} to ${featured}`);
    return true;
  } catch (error) {
    console.error(`Error toggling featured status for lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la modification du statut vedette: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Function to update lottery winner - with direct Supabase usage only
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    console.log(`Updating winner for lottery with ID ${lotteryId}:`, winner);
    
    // First, update lottery status to completed
    const { error: lotteryError } = await supabase
      .from('lotteries')
      .update({ status: 'completed' })
      .eq('id', lotteryId);
    
    if (lotteryError) {
      console.error(`Error updating lottery status for ID ${lotteryId}:`, lotteryError);
      toast.error(`Erreur lors de la mise à jour du statut de la loterie: ${lotteryError.message}`);
      return false;
    }
    
    // Check if a winner already exists
    const { data: existingWinner, error: existingError } = await supabase
      .from('lottery_winners')
      .select()
      .eq('lottery_id', lotteryId)
      .maybeSingle();
    
    if (existingError) {
      console.error(`Error checking for existing winner for lottery ID ${lotteryId}:`, existingError);
    }
    
    // If winner exists, update it, otherwise insert new winner
    let error;
    if (existingWinner) {
      const { error: updateError } = await supabase
        .from('lottery_winners')
        .update({
          user_id: winner.id,
          name: winner.name,
          email: winner.email,
          avatar: winner.avatar,
          drawn_at: new Date().toISOString()
        })
        .eq('lottery_id', lotteryId);
      
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('lottery_winners')
        .insert({
          lottery_id: lotteryId,
          user_id: winner.id,
          name: winner.name,
          email: winner.email,
          avatar: winner.avatar,
          drawn_at: new Date().toISOString()
        });
      
      error = insertError;
    }
    
    if (error) {
      console.error(`Error setting winner for lottery with ID ${lotteryId}:`, error);
      toast.error(`Erreur lors de la désignation du gagnant: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully set winner for lottery with ID ${lotteryId}`);
    return true;
  } catch (error) {
    console.error(`Error setting winner for lottery with ID ${lotteryId}:`, error);
    toast.error(`Erreur lors de la désignation du gagnant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};


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

// Test Supabase connection and log result
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      toast.error("Erreur de connexion à Supabase: " + error.message);
      return false;
    }
    
    console.log('Supabase connection test successful:', data);
    toast.success("Connexion à Supabase établie");
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    toast.error("Impossible de se connecter à Supabase");
    return false;
  }
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

// Function to fetch all lotteries - optimized to only use Supabase
export const fetchLotteries = async (forceRefresh = false): Promise<ExtendedLottery[]> => {
  try {
    console.log('Fetching lotteries from Supabase...', { forceRefresh });
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de récupérer les loteries: Connexion à Supabase échouée");
      return [];
    }
    
    // Fetch lotteries from Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching lotteries:', error);
      toast.error(`Erreur lors de la récupération des loteries: ${error.message}`);
      return [];
    }
    
    if (!data || data.length === 0) {
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

// Function to fetch a lottery by ID
export const fetchLotteryById = async (lotteryId: number): Promise<ExtendedLottery | null> => {
  try {
    console.log(`Fetching lottery with ID ${lotteryId}...`);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de récupérer la loterie: Connexion à Supabase échouée");
      return null;
    }
    
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .maybeSingle();
      
    if (error) {
      console.error(`Error fetching lottery with ID ${lotteryId}:`, error);
      toast.error(`Erreur lors de la récupération de la loterie: ${error.message}`);
      return null;
    }
    
    if (!data) {
      console.log(`No lottery found with ID ${lotteryId}`);
      return null;
    }
    
    console.log(`Fetched lottery with ID ${lotteryId}:`, data);
    
    // Convert to ExtendedLottery type
    const lottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Fetch participants and winner
    lottery.participants = await fetchParticipantsForLottery(lottery.id);
    lottery.currentParticipants = lottery.participants.length;
    
    if (lottery.status === 'completed') {
      lottery.winner = await fetchWinnerForLottery(lottery.id);
    }
    
    return lottery;
  } catch (error) {
    console.error(`Error fetching lottery with ID ${lotteryId}:`, error);
    toast.error(`Erreur lors de la récupération de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Function to add a participant to a lottery
export const addLotteryParticipant = async (lotteryId: number, participant: Participant): Promise<boolean> => {
  try {
    console.log(`Adding participant to lottery ${lotteryId}:`, participant);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible d'ajouter un participant: Connexion à Supabase échouée");
      return false;
    }
    
    // First check if the participant already exists
    const { data: existingParticipant, error: existingError } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('user_id', participant.id)
      .maybeSingle();
      
    if (existingError) {
      console.error('Error checking existing participant:', existingError);
      toast.error(`Erreur lors de la vérification de participation: ${existingError.message}`);
      return false;
    }
    
    if (existingParticipant) {
      console.log('Participant already exists for this lottery');
      toast.info("Vous participez déjà à cette loterie");
      return true; // Already participating, consider it a success
    }
    
    // Add the participant
    const { error } = await supabase
      .from('lottery_participants')
      .insert({
        lottery_id: lotteryId,
        user_id: participant.id,
        name: participant.name,
        email: participant.email,
        avatar: participant.avatar
      });
      
    if (error) {
      console.error('Error adding participant:', error);
      toast.error(`Erreur lors de l'ajout du participant: ${error.message}`);
      return false;
    }
    
    // Update the lottery's current_participants count
    const { data: lottery, error: fetchError } = await supabase
      .from('lotteries')
      .select('current_participants')
      .eq('id', lotteryId)
      .maybeSingle();
      
    if (fetchError || !lottery) {
      console.error('Error fetching lottery for participant count update:', fetchError);
      return true; // At least the participant was added
    }
    
    const newCount = (lottery.current_participants || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('lotteries')
      .update({ current_participants: newCount })
      .eq('id', lotteryId);
      
    if (updateError) {
      console.error('Error updating participant count:', updateError);
      return true; // At least the participant was added
    }
    
    console.log(`Successfully added participant to lottery ${lotteryId}`);
    toast.success("Participation enregistrée avec succès !");
    return true;
  } catch (error) {
    console.error('Error adding lottery participant:', error);
    toast.error(`Erreur lors de l'ajout du participant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Function to create a new lottery
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    console.log('Creating lottery in Supabase:', lottery);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de créer une loterie: Connexion à Supabase échouée");
      return null;
    }
    
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

// Function to update an existing lottery
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    console.log('Updating lottery in Supabase:', lottery);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de mettre à jour la loterie: Connexion à Supabase échouée");
      return null;
    }
    
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

// Function to delete a lottery
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting lottery with ID ${id}...`);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de supprimer la loterie: Connexion à Supabase échouée");
      return false;
    }
    
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
    toast.success("Loterie supprimée avec succès");
    return true;
  } catch (error) {
    console.error(`Error deleting lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Function to toggle lottery featured status
export const toggleLotteryFeatured = async (id: number, featured: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling featured status for lottery with ID ${id} to ${featured}...`);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de modifier le statut vedette: Connexion à Supabase échouée");
      return false;
    }
    
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
    toast.success(featured ? "Loterie mise en vedette" : "Loterie retirée des vedettes");
    return true;
  } catch (error) {
    console.error(`Error toggling featured status for lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la modification du statut vedette: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Function to update lottery winner
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    console.log(`Updating winner for lottery with ID ${lotteryId}:`, winner);
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de désigner un gagnant: Connexion à Supabase échouée");
      return false;
    }
    
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
    toast.success(`${winner.name} a été désigné(e) comme gagnant(e) !`);
    return true;
  } catch (error) {
    console.error(`Error setting winner for lottery with ID ${lotteryId}:`, error);
    toast.error(`Erreur lors de la désignation du gagnant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Export the function to clear all lottery data from Supabase
export const clearAllLotteryData = async (): Promise<boolean> => {
  try {
    console.log("Clearing all lottery data from Supabase...");
    
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de supprimer les données: Connexion à Supabase échouée");
      return false;
    }
    
    // Delete all winners first (due to foreign key constraints)
    const { error: winnersError } = await supabase
      .from('lottery_winners')
      .delete()
      .neq('id', 0);
    
    if (winnersError) {
      console.error("Error clearing lottery winners:", winnersError);
      toast.error(`Erreur lors de la suppression des gagnants: ${winnersError.message}`);
      return false;
    }
    
    // Delete all participants next
    const { error: participantsError } = await supabase
      .from('lottery_participants')
      .delete()
      .neq('id', 0);
    
    if (participantsError) {
      console.error("Error clearing lottery participants:", participantsError);
      toast.error(`Erreur lors de la suppression des participants: ${participantsError.message}`);
      return false;
    }
    
    // Finally delete all lotteries
    const { error: lotteriesError } = await supabase
      .from('lotteries')
      .delete()
      .neq('id', 0);
    
    if (lotteriesError) {
      console.error("Error clearing lotteries:", lotteriesError);
      toast.error(`Erreur lors de la suppression des loteries: ${lotteriesError.message}`);
      return false;
    }
    
    console.log("Successfully cleared all lottery data from Supabase");
    toast.success("Toutes les données des loteries ont été supprimées avec succès");
    
    // Also clear any localStorage data to ensure total cleanup
    try {
      localStorage.removeItem('lotteries');
      localStorage.removeItem('lottery_participants');
      localStorage.removeItem('lottery_winners');
      console.log("Local storage data for lotteries cleared");
    } catch (e) {
      console.log("No local storage data to clear");
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing lottery data:", error);
    toast.error(`Erreur lors de la suppression des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

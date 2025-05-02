import { ExtendedLottery, Participant } from "@/types/lottery";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from '@/lib/toast';

// Function to test connection to Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
};

// Function to ensure required tables exist
export const ensureLotteryTablesExist = async (): Promise<boolean> => {
  try {
    // Just check if we can access the lotteries table
    const { error } = await supabase.from('lotteries').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Failed to validate lottery tables:", error);
    return false;
  }
};

// Function to help with debugging
const logStorageState = () => {
  try {
    const localData = localStorage.getItem('lotteries');
    const sessionData = sessionStorage.getItem('lotteries');
    console.log(`Storage debug: 
      LocalStorage: ${localData ? JSON.parse(localData).length : 'empty'} lotteries
      SessionStorage: ${sessionData ? JSON.parse(sessionData).length : 'empty'} lotteries`
    );
  } catch (e) {
    console.error("Error logging storage state:", e);
  }
};

export const fetchLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    console.log("Attempting to fetch lotteries from Supabase...");
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error from Supabase when fetching lotteries:", error);
      throw error;
    }
    
    // Transform from snake_case to camelCase
    const lotteries = data.map((lottery: any) => ({
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
    }));
    
    console.log(`Retrieved ${lotteries.length} lotteries from Supabase`);
    
    // Ensure data consistency by storing in both storages
    if (lotteries.length > 0) {
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      sessionStorage.setItem('lotteries', JSON.stringify(lotteries));
    }
    
    logStorageState();
    return lotteries;
  } catch (error) {
    console.error("Error fetching lotteries, falling back to local storage:", error);
    
    // Try to get from localStorage first
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const parsedLotteries = JSON.parse(storedLotteries);
      console.log(`Using ${parsedLotteries.length} lotteries from localStorage`);
      // Also ensure session storage is consistent
      sessionStorage.setItem('lotteries', storedLotteries);
      return parsedLotteries;
    }
    
    // If not in localStorage, try sessionStorage
    const sessionLotteries = sessionStorage.getItem('lotteries');
    if (sessionLotteries) {
      const parsedLotteries = JSON.parse(sessionLotteries);
      console.log(`Using ${parsedLotteries.length} lotteries from sessionStorage`);
      // Sync back to localStorage for consistency
      localStorage.setItem('lotteries', sessionLotteries);
      return parsedLotteries;
    }
    
    console.log("No lotteries found in any storage, returning empty array");
    return [];
  }
};

export const fetchLotteryById = async (id: number): Promise<ExtendedLottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching lottery ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status,
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
    };
  } catch (error) {
    console.error(`Error fetching lottery ${id}, trying local storage:`, error);
    
    // Try localStorage first
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const lotteries = JSON.parse(storedLotteries);
      const lottery = lotteries.find((l: any) => l.id === id);
      if (lottery) return lottery;
    }
    
    // Fall back to sessionStorage
    const sessionLotteries = sessionStorage.getItem('lotteries');
    if (sessionLotteries) {
      const lotteries = JSON.parse(sessionLotteries);
      const lottery = lotteries.find((l: any) => l.id === id);
      if (lottery) return lottery;
    }
    
    return null;
  }
};

export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    // First, ensure we have a connection to Supabase
    const connected = await checkSupabaseConnection();
    if (!connected) {
      console.error("Cannot create lottery: No connection to Supabase");
      toast.error("Impossible de créer une loterie: Pas de connexion à Supabase", { position: "bottom-right" });
      return null;
    }
    
    console.log("Données de loterie avant envoi:", lottery); // Debug
    
    // Prepare data for Supabase (convert camelCase to snake_case)
    const supabaseData = {
      title: lottery.title,
      description: lottery.description,
      image: lottery.image,
      value: lottery.value,
      status: lottery.status,
      featured: lottery.featured || false,
      target_participants: lottery.targetParticipants,
      current_participants: lottery.currentParticipants || 0,
      // Ensure we don't send empty strings for date fields
      draw_date: lottery.drawDate && lottery.drawDate !== '' ? lottery.drawDate : null,
      end_date: lottery.endDate && lottery.endDate !== '' ? lottery.endDate : null,
      linked_products: lottery.linkedProducts || [],
    };
    
    console.log("Création de loterie dans Supabase:", supabaseData); // Debug
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de loterie dans Supabase:", error);
      toast.error(`Erreur lors de la création: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    if (!data) {
      console.error("Aucune donnée retournée après création de loterie");
      toast.error("Erreur: Aucune donnée retournée après création", { position: "bottom-right" });
      return null;
    }
    
    console.log("Données reçues après création:", data); // Debug
    
    const newLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status,
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
    };
    
    // Update local storage with the new lottery
    updateLocalStorage(newLottery);
    
    toast.success(`Loterie "${lottery.title}" créée avec succès`, { position: "bottom-right" });
    return newLottery;
  } catch (error) {
    console.error("Erreur lors de la création de loterie:", error);
    toast.error(`Erreur lors de la création de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const updateLottery = async (id: number, lottery: Partial<ExtendedLottery>): Promise<ExtendedLottery | null> => {
  try {
    // First, ensure we have a connection to Supabase
    const connected = await checkSupabaseConnection();
    if (!connected) {
      console.error("Cannot update lottery: No connection to Supabase");
      toast.error("Impossible de mettre à jour la loterie: Pas de connexion à Supabase", { position: "bottom-right" });
      return null;
    }
    
    // Convert camelCase to snake_case for Supabase
    const supabaseData: any = {};
    
    if (lottery.title !== undefined) supabaseData.title = lottery.title;
    if (lottery.description !== undefined) supabaseData.description = lottery.description;
    if (lottery.image !== undefined) supabaseData.image = lottery.image;
    if (lottery.value !== undefined) supabaseData.value = lottery.value;
    if (lottery.status !== undefined) supabaseData.status = lottery.status;
    if (lottery.featured !== undefined) supabaseData.featured = lottery.featured;
    if (lottery.targetParticipants !== undefined) supabaseData.target_participants = lottery.targetParticipants;
    if (lottery.currentParticipants !== undefined) supabaseData.current_participants = lottery.currentParticipants;
    
    // Ensure we don't send empty strings for date fields
    if (lottery.drawDate !== undefined) {
      supabaseData.draw_date = lottery.drawDate && lottery.drawDate !== '' ? lottery.drawDate : null;
    }
    
    if (lottery.endDate !== undefined) {
      supabaseData.end_date = lottery.endDate && lottery.endDate !== '' ? lottery.endDate : null;
    }
    
    if (lottery.linkedProducts !== undefined) supabaseData.linked_products = lottery.linkedProducts;
    
    console.log(`Updating lottery ${id} in Supabase:`, supabaseData);
    const { data, error } = await supabase
      .from('lotteries')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating lottery ${id} in Supabase:`, error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    if (!data) {
      console.error("No data returned after lottery update");
      toast.error("Erreur: Aucune donnée retournée après mise à jour", { position: "bottom-right" });
      return null;
    }
    
    const updatedLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status,
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
    };
    
    // Update the lottery in local storage
    updateLocalStorage(updatedLottery);
    
    toast.success(`Loterie "${data.title}" mise à jour avec succès`, { position: "bottom-right" });
    return updatedLottery;
  } catch (error) {
    console.error(`Error updating lottery ${id}:`, error);
    toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting lottery ${id} from Supabase`);
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting lottery ${id} from Supabase:`, error);
      throw error;
    }
    
    // Also delete from local storage
    removeFromLocalStorage(id);
    
    toast.success("Loterie supprimée avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error deleting lottery ${id}:`, error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Helper function to update local storage with a new or updated lottery
const updateLocalStorage = (lottery: ExtendedLottery) => {
  try {
    // Update localStorage
    const localData = localStorage.getItem('lotteries');
    let lotteries: ExtendedLottery[] = localData ? JSON.parse(localData) : [];
    
    // Remove existing lottery with same ID if it exists
    lotteries = lotteries.filter(l => l.id !== lottery.id);
    
    // Add the new/updated lottery
    lotteries.push(lottery);
    
    // Save back to both storage types
    const jsonData = JSON.stringify(lotteries);
    localStorage.setItem('lotteries', jsonData);
    sessionStorage.setItem('lotteries', jsonData);
    
    console.log(`Updated lottery ${lottery.id} in local storage, now ${lotteries.length} lotteries`);
  } catch (error) {
    console.error("Error updating local storage:", error);
  }
};

// Helper function to remove a lottery from local storage
const removeFromLocalStorage = (id: number) => {
  try {
    // Update localStorage
    const localData = localStorage.getItem('lotteries');
    if (localData) {
      let lotteries: ExtendedLottery[] = JSON.parse(localData);
      lotteries = lotteries.filter(l => l.id !== id);
      
      // Save back to both storage types
      const jsonData = JSON.stringify(lotteries);
      localStorage.setItem('lotteries', jsonData);
      sessionStorage.setItem('lotteries', jsonData);
      
      console.log(`Removed lottery ${id} from local storage, now ${lotteries.length} lotteries`);
    }
  } catch (error) {
    console.error("Error removing from local storage:", error);
  }
};

// Implementing the missing addLotteryParticipant function
export const addLotteryParticipant = async (
  lotteryId: number, 
  participant: { userId: number; name?: string; email?: string; avatar?: string; }
): Promise<boolean> => {
  try {
    // First, check if the participant is already part of this lottery
    const { data: existingParticipants, error: fetchError } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('user_id', participant.userId);
      
    if (fetchError) throw fetchError;
    
    // If the participant is already enrolled, return true
    if (existingParticipants && existingParticipants.length > 0) {
      console.log("User is already participating in this lottery");
      return true;
    }
    
    // Add the participant to the lottery
    const { error: insertError } = await supabase
      .from('lottery_participants')
      .insert({
        lottery_id: lotteryId,
        user_id: participant.userId,
        name: participant.name || '',
        email: participant.email || '',
        avatar: participant.avatar || '',
      });
      
    if (insertError) throw insertError;
    
    // Update the currentParticipants count in the lottery
    const { error: updateError } = await supabase.rpc('increment_lottery_participants', {
      lottery_id_param: lotteryId
    });
    
    if (updateError) {
      // If the RPC fails, try direct update
      const { error: fallbackError } = await supabase
        .from('lotteries')
        .update({ current_participants: supabase.rpc('inc', { count: 1 }) })
        .eq('id', lotteryId);
        
      if (fallbackError) {
        console.error("Error updating participant count:", fallbackError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error adding lottery participant:", error);
    return false;
  }
};

// Function to fetch featured lotteries
export const fetchFeaturedLotteries = async (): Promise<ExtendedLottery[]> => {
  try {
    console.log("Attempting to fetch featured lotteries from Supabase...");
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('featured', true)
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error from Supabase when fetching featured lotteries:", error);
      throw error;
    }
    
    // Transform from snake_case to camelCase
    const lotteries = data.map((lottery: any) => ({
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
    }));
    
    console.log(`Retrieved ${lotteries.length} featured lotteries from Supabase`);
    return lotteries;
  } catch (error) {
    console.error("Error fetching featured lotteries, falling back to local storage:", error);
    
    // Try to get from localStorage first
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const allLotteries = JSON.parse(storedLotteries);
      const featured = allLotteries.filter((lottery: ExtendedLottery) => lottery.featured === true);
      console.log(`Using ${featured.length} featured lotteries from localStorage`);
      return featured;
    }
    
    console.log("No featured lotteries found in storage, returning empty array");
    return [];
  }
};

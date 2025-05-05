
import { ExtendedLottery, Participant } from "@/types/lottery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/lib/toast';
import { supabaseToAppLottery, appToSupabaseLottery } from "@/lib/dataConverters";

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
      LocalStorage: ${localData ? 'has lotteries' : 'empty'} 
      SessionStorage: ${sessionData ? 'has lotteries' : 'empty'}`
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
    
    if (!data || data.length === 0) {
      console.log("No data returned from Supabase, checking localStorage");
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        const parsedLotteries = JSON.parse(storedLotteries);
        console.log(`Using ${parsedLotteries.length} lotteries from localStorage`);
        return parsedLotteries;
      }
      return [];
    }
    
    // Transform from snake_case to camelCase with proper type assertions
    const lotteries: ExtendedLottery[] = data.map((lottery) => {
      return {
        id: lottery.id,
        title: lottery.title,
        description: lottery.description || '',
        image: lottery.image || '',
        value: lottery.value,
        status: lottery.status as "active" | "completed" | "relaunched" | "cancelled", // Proper type assertion
        featured: lottery.featured || false,
        targetParticipants: lottery.target_participants,
        currentParticipants: lottery.current_participants || 0,
        drawDate: lottery.draw_date,
        endDate: lottery.end_date,
        linkedProducts: lottery.linked_products || [],
        participants: [] // Add empty participants array to fix type error
      };
    });
    
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
      try {
        const parsedLotteries = JSON.parse(storedLotteries);
        console.log(`Using ${parsedLotteries.length} lotteries from localStorage`);
        // Also ensure session storage is consistent
        sessionStorage.setItem('lotteries', storedLotteries);
        return parsedLotteries;
      } catch (e) {
        console.error("Error parsing localStorage lotteries:", e);
      }
    }
    
    // If not in localStorage, try sessionStorage
    const sessionLotteries = sessionStorage.getItem('lotteries');
    if (sessionLotteries) {
      try {
        const parsedLotteries = JSON.parse(sessionLotteries);
        console.log(`Using ${parsedLotteries.length} lotteries from sessionStorage`);
        // Sync back to localStorage for consistency
        localStorage.setItem('lotteries', sessionLotteries);
        return parsedLotteries;
      } catch (e) {
        console.error("Error parsing sessionStorage lotteries:", e);
      }
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
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status as "active" | "completed" | "relaunched" | "cancelled", // Type assertion
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
      participants: [] // Add empty participants array to fix type error
    };
  } catch (error) {
    console.error(`Error fetching lottery ${id}, trying local storage:`, error);
    
    // Try localStorage first
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        const lotteries = JSON.parse(storedLotteries);
        const lottery = lotteries.find((l: ExtendedLottery) => l.id === id);
        if (lottery) return lottery;
      } catch (e) {
        console.error("Error parsing localStorage lotteries:", e);
      }
    }
    
    // Fall back to sessionStorage
    const sessionLotteries = sessionStorage.getItem('lotteries');
    if (sessionLotteries) {
      try {
        const lotteries = JSON.parse(sessionLotteries);
        const lottery = lotteries.find((l: ExtendedLottery) => l.id === id);
        if (lottery) return lottery;
      } catch (e) {
        console.error("Error parsing sessionStorage lotteries:", e);
      }
    }
    
    return null;
  }
};

export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    // First, ensure we have a connection to Supabase
    const connected = await testSupabaseConnection();
    
    console.log("Données de loterie avant envoi:", lottery); // Debug
    
    // Type assertion to ensure status is one of the allowed values
    const typedStatus = lottery.status as "active" | "completed" | "relaunched" | "cancelled";
    
    // Create lottery locally first
    const fakeId = Date.now();
    const newLottery: ExtendedLottery = {
      id: fakeId,
      title: lottery.title,
      description: lottery.description || '',
      image: lottery.image || '',
      value: lottery.value,
      status: typedStatus,
      featured: lottery.featured || false,
      targetParticipants: lottery.targetParticipants,
      currentParticipants: lottery.currentParticipants || 0,
      drawDate: lottery.drawDate || '',
      endDate: lottery.endDate || '',
      linkedProducts: lottery.linkedProducts || [],
      participants: [] // Add empty participants array to fix type error
    };
    
    // Always store in localStorage
    updateLocalStorage(newLottery);
    
    if (!connected) {
      console.log("No connection to Supabase. Storing locally only.");
      toast.warning(`Loterie "${lottery.title}" créée localement (pas connecté à Supabase)`, { position: "bottom-right" });
      return newLottery;
    }
    
    // If connected, try to save to Supabase
    const supabaseData = {
      title: lottery.title,
      description: lottery.description,
      image: lottery.image,
      value: lottery.value,
      status: typedStatus,
      featured: lottery.featured || false,
      target_participants: lottery.targetParticipants,
      current_participants: lottery.currentParticipants || 0,
      // Ensure we don't send empty strings for date fields
      draw_date: lottery.drawDate && lottery.drawDate !== '' ? lottery.drawDate : null,
      end_date: lottery.endDate && lottery.endDate !== '' ? lottery.endDate : null,
      linked_products: lottery.linkedProducts || [],
    };
    
    console.log("Création de loterie dans Supabase:", supabaseData); // Debug
    
    // Get current user, if authenticated
    const { data: userData } = await supabase.auth.getUser();
    const isAuthenticated = !!userData?.user;
    
    // Add the user if authenticated
    if (isAuthenticated && userData?.user) {
      supabaseData['created_by'] = userData.user.id;
    }
    
    const { data, error } = await supabase
      .from('lotteries')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de loterie dans Supabase:", error);
      toast.warning(`Loterie "${lottery.title}" créée localement (pas synchronisée avec Supabase)`, { position: "bottom-right" });
      return newLottery; // Return the locally created lottery
    }
    
    if (!data) {
      console.error("Aucune donnée retournée après création de loterie");
      toast.warning("Loterie créée localement (pas de données retournées par Supabase)", { position: "bottom-right" });
      return newLottery; // Return the locally created lottery
    }
    
    console.log("Données reçues après création:", data); // Debug
    
    const supabaseCreatedLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status as "active" | "completed" | "relaunched" | "cancelled", // Type assertion
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
      participants: [] // Add empty participants array to fix type error
    };
    
    // Update local storage with the Supabase-created lottery
    updateLocalStorage(supabaseCreatedLottery);
    
    toast.success(`Loterie "${lottery.title}" créée avec succès`, { position: "bottom-right" });
    return supabaseCreatedLottery;
  } catch (error) {
    console.error("Erreur lors de la création de loterie:", error);
    toast.error(`Erreur lors de la création de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    
    // Create locally as fallback
    const fakeId = Date.now();
    const newLottery: ExtendedLottery = {
      id: fakeId,
      title: lottery.title,
      description: lottery.description || '',
      image: lottery.image || '',
      value: lottery.value,
      status: lottery.status as "active" | "completed" | "relaunched" | "cancelled",
      featured: lottery.featured || false,
      targetParticipants: lottery.targetParticipants,
      currentParticipants: lottery.currentParticipants || 0,
      drawDate: lottery.drawDate || '',
      endDate: lottery.endDate || '',
      linkedProducts: lottery.linkedProducts || [],
      participants: [] // Add empty participants array to fix type error
    };
    
    // Store in localStorage
    updateLocalStorage(newLottery);
    
    toast.warning(`Loterie "${lottery.title}" créée localement suite à une erreur`, { position: "bottom-right" });
    return newLottery;
  }
};

export const updateLottery = async (id: number, lottery: Partial<ExtendedLottery>): Promise<ExtendedLottery | null> => {
  try {
    // First, get the current lottery to merge with updates
    const currentLottery = await fetchLotteryById(id);
    if (!currentLottery) {
      throw new Error(`Lottery with ID ${id} not found`);
    }
    
    // Merge current with updates
    const updatedLottery: ExtendedLottery = {
      ...currentLottery,
      ...lottery,
      id: id, // Ensure the ID doesn't change
      participants: currentLottery.participants || [] // Keep participants array
    };
    
    // Always update localStorage first
    updateLocalStorage(updatedLottery);
    
    // Check connection to Supabase
    const connected = await testSupabaseConnection();
    if (!connected) {
      console.error("Cannot update lottery in Supabase: No connection");
      toast.warning("Loterie mise à jour localement uniquement (pas de connexion à Supabase)", { position: "bottom-right" });
      return updatedLottery;
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
      toast.warning(`Erreur lors de la mise à jour dans Supabase: ${error.message}. Mise à jour locale uniquement.`, { position: "bottom-right" });
      return updatedLottery; // Return the locally updated lottery
    }
    
    if (!data) {
      console.error("No data returned after lottery update");
      toast.warning("Erreur: Aucune donnée retournée après mise à jour dans Supabase", { position: "bottom-right" });
      return updatedLottery; // Return the locally updated lottery
    }
    
    const supabaseUpdatedLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      image: data.image || '',
      value: data.value,
      status: data.status as "active" | "completed" | "relaunched" | "cancelled", // Type assertion
      featured: data.featured || false,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      drawDate: data.draw_date,
      endDate: data.end_date,
      linkedProducts: data.linked_products || [],
      participants: updatedLottery.participants || [] // Keep the participants from the local lottery
    };
    
    // Update local storage with the Supabase-updated lottery
    updateLocalStorage(supabaseUpdatedLottery);
    
    toast.success(`Loterie "${data.title}" mise à jour avec succès`, { position: "bottom-right" });
    return supabaseUpdatedLottery;
  } catch (error) {
    console.error(`Error updating lottery ${id}:`, error);
    toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    
    // Create a fallback updated lottery using local data
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        const lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
        const currentLottery = lotteries.find(l => l.id === id);
        if (currentLottery) {
          const updatedLottery: ExtendedLottery = {
            ...currentLottery,
            ...lottery,
            id: id // Ensure the ID doesn't change
          };
          
          // Update local storage
          updateLocalStorage(updatedLottery);
          
          toast.warning("Loterie mise à jour localement uniquement suite à une erreur", { position: "bottom-right" });
          return updatedLottery;
        }
      } catch (e) {
        console.error("Error updating lottery locally:", e);
      }
    }
    
    return null;
  }
};

export const deleteLottery = async (id: number): Promise<boolean> => {
  // Always delete from local storage first
  removeFromLocalStorage(id);
  
  try {
    // Check connection to Supabase
    const connected = await testSupabaseConnection();
    if (!connected) {
      console.log(`Lottery ${id} deleted from local storage only (no Supabase connection)`);
      toast.warning("Loterie supprimée localement uniquement (pas de connexion à Supabase)", { position: "bottom-right" });
      return true;
    }
    
    console.log(`Deleting lottery ${id} from Supabase`);
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting lottery ${id} from Supabase:`, error);
      toast.warning(`Erreur lors de la suppression dans Supabase: ${error.message}. Suppression locale uniquement.`, { position: "bottom-right" });
      return true; // Still return true since we deleted from localStorage
    }
    
    toast.success("Loterie supprimée avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error deleting lottery ${id}:`, error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return true; // Still return true since we deleted from localStorage
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
    // Check connection to Supabase
    const connected = await testSupabaseConnection();
    if (!connected) {
      console.log(`Participant added to lottery ${lotteryId} locally only (no Supabase connection)`);
      
      // Update lottery participants in local storage
      const localData = localStorage.getItem('lotteries');
      if (localData) {
        let lotteries: ExtendedLottery[] = JSON.parse(localData);
        const lotteryIndex = lotteries.findIndex(l => l.id === lotteryId);
        
        if (lotteryIndex >= 0) {
          // Create a new participant
          const newParticipant: Participant = {
            id: Date.now(), // Generate a temporary ID
            name: participant.name || 'Anonymous',
            email: participant.email || '',
            avatar: participant.avatar
          };
          
          // Add to lottery participants
          if (!lotteries[lotteryIndex].participants) {
            lotteries[lotteryIndex].participants = [];
          }
          
          lotteries[lotteryIndex].participants.push(newParticipant);
          
          // Increment participant count
          lotteries[lotteryIndex].currentParticipants = 
            (lotteries[lotteryIndex].currentParticipants || 0) + 1;
          
          // Save back to both storage types
          const jsonData = JSON.stringify(lotteries);
          localStorage.setItem('lotteries', jsonData);
          sessionStorage.setItem('lotteries', jsonData);
          
          return true;
        }
      }
      
      return false;
    }
    
    // First, check if the participant is already part of this lottery
    const { data: existingParticipants, error: fetchError } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('user_id', participant.userId.toString()); // Convert to string as Supabase expects string for user_id
      
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
        user_id: participant.userId.toString(), // Convert to string as Supabase expects
        name: participant.name || '',
        email: participant.email || '',
        avatar: participant.avatar || '',
      });
      
    if (insertError) throw insertError;
    
    // Update the currentParticipants count in the lottery
    const { error: updateError } = await supabase.rpc(
      'increment_lottery_participants', 
      { lottery_id_param: lotteryId }
    );
    
    if (updateError) {
      console.error("Error updating participant count:", updateError);
      // If the RPC fails, try a direct update as fallback
      const { error: fallbackError } = await supabase
        .from('lotteries')
        .update({ 
          current_participants: supabase.rpc('increment_lottery_participants', { 
            lottery_id_param: lotteryId 
          }) 
        })
        .eq('id', lotteryId);
        
      if (fallbackError) {
        console.error("Error with fallback update:", fallbackError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding participant to lottery ${lotteryId}:`, error);
    return false;
  }
};

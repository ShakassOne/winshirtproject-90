
import { ExtendedLottery, Participant } from "@/types/lottery";
import { supabase } from "@/integrations/supabase/client";

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

export const fetchLotteries = async (forceRefresh?: boolean): Promise<ExtendedLottery[]> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('*');
    
    if (error) throw error;
    
    return data.map((lottery: any) => ({
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
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    const storedLotteries = localStorage.getItem('lotteries');
    return storedLotteries ? JSON.parse(storedLotteries) : [];
  }
};

export const fetchLotteryById = async (id: number): Promise<ExtendedLottery | null> => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
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
    console.error(`Error fetching lottery ${id}:`, error);
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const lotteries = JSON.parse(storedLotteries);
      const lottery = lotteries.find((l: any) => l.id === id);
      return lottery || null;
    }
    return null;
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

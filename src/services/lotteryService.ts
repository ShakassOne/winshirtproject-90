import { supabase } from '@/lib/supabaseClient'; // Assure-toi que supabaseClient est bien configuré

export const getLotteries = async (activeOnly = false) => {
  try {
    const { data, error } = await supabase
      .from('lotteries') // Remplace 'lotteries' par le nom de ta table
      .select('*');

    if (error) throw error;

    // Filtrer par statut si nécessaire
    if (activeOnly) {
      return data.filter((lottery: any) => lottery.status === 'active');
    }

    return data;
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    throw error;
  }
};

export const createLottery = async (lotteryData: any) => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .insert([lotteryData]);

    if (error) throw error;

    console.log('Lottery created:', data);
    return data;
  } catch (error) {
    console.error('Error creating lottery:', error);
    throw error;
  }
};

export const updateLottery = async (lotteryId: number, lotteryData: any) => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .update(lotteryData)
      .eq('id', lotteryId);

    if (error) throw error;

    console.log('Lottery updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating lottery:', error);
    throw error;
  }
};

export const deleteLottery = async (lotteryId: number) => {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);

    if (error) throw error;

    console.log('Lottery deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting lottery:', error);
    throw error;
  }
};

export const syncLotteriesToSupabase = async () => {
  try {
    // Fetch lotteries from your local data source (e.g., Lovable)
    const localLotteries = await getLocalLotteries(); // Define this function to fetch local lotteries
    const { data, error } = await supabase
      .from('lotteries')
      .upsert(localLotteries, { onConflict: ['id'] });

    if (error) throw error;

    console.log('Lotteries synced to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error syncing lotteries:', error);
    throw error;
  }
};

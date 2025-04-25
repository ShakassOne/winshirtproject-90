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
    current_participants: rest.currentParticipants || 0,
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
    
    // Direct query to ensure connection is working
    const { data, error } = await supabase.from('lotteries').select('count').limit(1).single();
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      toast.error(`Erreur de connexion Supabase: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    console.log('Supabase connection test successful');
    toast.success("Connexion à Supabase établie avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    toast.error(`Erreur de connexion à Supabase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
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

// Function to ensure lottery tables exist and create them if not
export const ensureLotteryTablesExist = async (): Promise<boolean> => {
  try {
    console.log('Ensuring lottery tables exist...');
    
    // Check if lotteries table exists
    const { data: lotteriesTable, error: lotteriesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'lotteries')
      .maybeSingle();
      
    if (lotteriesError) {
      console.error('Error checking lotteries table:', lotteriesError);
      toast.error(`Erreur lors de la vérification des tables: ${lotteriesError.message}`, { position: "bottom-right" });
      return false;
    }
    
    // If lotteries table doesn't exist, create all tables
    if (!lotteriesTable) {
      console.log('Creating lottery tables...');
      
      // Create lotteries table
      const { error: createLotteriesError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS lotteries (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            value NUMERIC NOT NULL,
            target_participants INTEGER NOT NULL DEFAULT 10,
            current_participants INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            image TEXT,
            linked_products INTEGER[] DEFAULT '{}',
            end_date TIMESTAMP WITH TIME ZONE,
            draw_date TIMESTAMP WITH TIME ZONE,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createLotteriesError) {
        console.error('Error creating lotteries table:', createLotteriesError);
        toast.error(`Erreur lors de la création des tables: ${createLotteriesError.message}`, { position: "bottom-right" });
        return false;
      }
      
      // Create lottery_participants table
      const { error: createParticipantsError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS lottery_participants (
            id SERIAL PRIMARY KEY,
            lottery_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            name TEXT,
            email TEXT,
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createParticipantsError) {
        console.error('Error creating lottery_participants table:', createParticipantsError);
        toast.error(`Erreur lors de la création des tables: ${createParticipantsError.message}`, { position: "bottom-right" });
        return false;
      }
      
      // Create lottery_winners table
      const { error: createWinnersError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS lottery_winners (
            id SERIAL PRIMARY KEY,
            lottery_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            name TEXT,
            email TEXT,
            avatar TEXT,
            drawn_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createWinnersError) {
        console.error('Error creating lottery_winners table:', createWinnersError);
        toast.error(`Erreur lors de la création des tables: ${createWinnersError.message}`, { position: "bottom-right" });
        return false;
      }
      
      console.log('Lottery tables created successfully');
      toast.success('Tables créées avec succès', { position: "bottom-right" });
    } else {
      console.log('Lottery tables already exist');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring lottery tables exist:', error);
    toast.error(`Erreur lors de la création des tables: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to fetch all lotteries - optimized to use both local storage and Supabase
export const fetchLotteries = async (forceRefresh = false): Promise<ExtendedLottery[]> => {
  try {
    console.log('Fetching lotteries...', { forceRefresh });
    
    // Try to get data from localStorage first if not forcing refresh
    if (!forceRefresh) {
      const localLotteries = localStorage.getItem('lotteries');
      if (localLotteries) {
        try {
          const parsedLotteries = JSON.parse(localLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            console.log(`Loaded ${parsedLotteries.length} lotteries from localStorage`);
            return parsedLotteries;
          }
        } catch (error) {
          console.error('Error parsing localStorage lotteries:', error);
        }
      }
    }
    
    // Test Supabase connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.warning("Mode hors-ligne actif: données chargées depuis le stockage local", { position: "bottom-right" });
      
      // If no data in localStorage and can't connect to Supabase, return empty array
      const emptyLotteries: ExtendedLottery[] = [];
      localStorage.setItem('lotteries', JSON.stringify(emptyLotteries));
      return emptyLotteries;
    }
    
    // Ensure tables exist before fetching
    await ensureLotteryTablesExist();
    
    // Fetch data from Supabase
    console.log('Fetching lotteries from Supabase...');
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching lotteries from Supabase:', error);
      toast.error(`Erreur lors de la récupération des loteries: ${error.message}`, { position: "bottom-right" });
      
      // Fallback to localStorage for data resilience
      const localLotteries = localStorage.getItem('lotteries');
      if (localLotteries) {
        try {
          const parsedLotteries = JSON.parse(localLotteries);
          if (Array.isArray(parsedLotteries)) {
            console.log(`Fallback: loaded ${parsedLotteries.length} lotteries from localStorage`);
            return parsedLotteries;
          }
        } catch (parseError) {
          console.error('Error parsing localStorage lotteries:', parseError);
        }
      }
      
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No lottery data returned from Supabase');
      const emptyLotteries: ExtendedLottery[] = [];
      localStorage.setItem('lotteries', JSON.stringify(emptyLotteries));
      return emptyLotteries;
    }
    
    console.log(`Fetched ${data.length} lotteries from Supabase:`, data);
    
    // Convert to ExtendedLottery format
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
    
    // Update localStorage for offline usage
    localStorage.setItem('lotteries', JSON.stringify(extendedLotteries));
    
    return extendedLotteries;
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    toast.error(`Erreur lors de la récupération des loteries: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return [];
  }
};

// Function to fetch a single lottery by ID
export const fetchLotteryById = async (lotteryId: number): Promise<ExtendedLottery | null> => {
  try {
    console.log(`Fetching lottery with ID ${lotteryId}...`);
    
    // Try to get lotteries from localStorage first
    const localLotteries = localStorage.getItem('lotteries');
    if (localLotteries) {
      try {
        const parsedLotteries = JSON.parse(localLotteries);
        if (Array.isArray(parsedLotteries)) {
          const localLottery = parsedLotteries.find(lottery => lottery.id === lotteryId);
          if (localLottery) {
            console.log(`Found lottery with ID ${lotteryId} in localStorage:`, localLottery);
            return localLottery;
          }
        }
      } catch (error) {
        console.error('Error parsing localStorage lotteries:', error);
      }
    }
    
    // Test Supabase connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.warning("Mode hors-ligne actif: impossible de récupérer la loterie depuis le serveur", { position: "bottom-right" });
      return null;
    }
    
    // Fetch from Supabase
    console.log(`Fetching lottery with ID ${lotteryId} from Supabase...`);
    
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching lottery by ID:', error);
      toast.error(`Erreur lors de la récupération de la loterie: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    if (!data) {
      console.log(`No lottery with ID ${lotteryId} found`);
      toast.warning(`Loterie #${lotteryId} introuvable`, { position: "bottom-right" });
      return null;
    }
    
    console.log(`Fetched lottery with ID ${lotteryId} from Supabase:`, data);
    
    // Convert to ExtendedLottery format
    const lottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Fetch participants and winner for the lottery
    lottery.participants = await fetchParticipantsForLottery(lottery.id);
    lottery.currentParticipants = lottery.participants.length;
    
    if (lottery.status === 'completed') {
      lottery.winner = await fetchWinnerForLottery(lottery.id);
    }
    
    return lottery;
  } catch (error) {
    console.error(`Error fetching lottery with ID ${lotteryId}:`, error);
    toast.error(`Erreur lors de la récupération de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

// Function to add participant to a lottery
export const addLotteryParticipant = async (lotteryId: number, participant: Participant): Promise<boolean> => {
  try {
    console.log(`Adding participant to lottery ${lotteryId}:`, participant);
    
    // Check Supabase connection
    const isConnected = await testSupabaseConnection();
    
    // Save to localStorage first for data resilience
    const localLotteries = localStorage.getItem('lotteries');
    let lotteries: ExtendedLottery[] = [];
    
    if (localLotteries) {
      try {
        lotteries = JSON.parse(localLotteries);
        const lotteryIndex = lotteries.findIndex(l => l.id === lotteryId);
        
        if (lotteryIndex !== -1) {
          // Check if participant already exists
          const existingParticipant = lotteries[lotteryIndex].participants.find(p => p.email === participant.email);
          
          if (existingParticipant) {
            console.log('Participant already exists for this lottery in localStorage');
            toast.info("Vous participez déjà à cette loterie", { position: "bottom-right" });
            return true;
          }
          
          // Add participant
          lotteries[lotteryIndex].participants.push(participant);
          lotteries[lotteryIndex].currentParticipants = lotteries[lotteryIndex].participants.length;
          
          // Save updated lotteries to localStorage
          localStorage.setItem('lotteries', JSON.stringify(lotteries));
          console.log('Participant added to lottery in localStorage');
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
    
    if (!isConnected) {
      toast.warning("Mode hors-ligne actif: participation enregistrée localement uniquement", { position: "bottom-right" });
      return true;
    }
    
    // Ensure tables exist
    await ensureLotteryTablesExist();
    
    // Check if participant already exists for this lottery in Supabase
    const { data: existingParticipant, error: checkError } = await supabase
      .from('lottery_participants')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('email', participant.email)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing participant:', checkError);
      toast.error(`Erreur lors de la vérification du participant: ${checkError.message}`, { position: "bottom-right" });
    }
    
    if (existingParticipant) {
      console.log('Participant already exists for this lottery in Supabase');
      toast.info("Vous participez déjà à cette loterie", { position: "bottom-right" });
      return true;
    }
    
    // Add participant to Supabase
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
      console.error('Error adding participant to lottery:', error);
      toast.error(`Erreur lors de l'ajout du participant: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    // Update current participants count in the lottery
    const { error: updateError } = await supabase
      .from('lotteries')
      .update({ current_participants: supabase.rpc('increment', { 'row_id': lotteryId, 'amount': 1 }) })
      .eq('id', lotteryId);
    
    if (updateError) {
      console.error('Error updating participant count:', updateError);
      toast.warning(`Participant ajouté mais compteur non mis à jour: ${updateError.message}`, { position: "bottom-right" });
    }
    
    console.log('Participant added successfully to lottery', lotteryId);
    toast.success("Participation enregistrée avec succès !", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error adding participant to lottery:', error);
    toast.error(`Erreur lors de l'ajout du participant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to create a new lottery
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    console.log('Creating lottery:', lottery);
    
    // Check Supabase connection
    const isConnected = await testSupabaseConnection();
    
    // If not connected to Supabase, create lottery in localStorage only
    if (!isConnected) {
      toast.warning("Mode hors-ligne actif: loterie créée localement uniquement", { position: "bottom-right" });
      
      // Get existing lotteries from localStorage
      const localLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = [];
      
      if (localLotteries) {
        try {
          lotteries = JSON.parse(localLotteries);
        } catch (error) {
          console.error('Error parsing localStorage lotteries:', error);
        }
      }
      
      // Generate a new unique ID for the lottery
      const newId = lotteries.length > 0 
        ? Math.max(...lotteries.map(l => l.id)) + 1 
        : 1;
      
      // Create the new lottery with the generated ID
      const newLottery: ExtendedLottery = {
        ...lottery,
        id: newId,
        participants: [],
        winner: null
      };
      
      // Add to lotteries array and save to localStorage
      lotteries.push(newLottery);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      console.log('Lottery created successfully in localStorage:', newLottery);
      toast.success("Loterie créée avec succès (mode hors-ligne)", { position: "bottom-right" });
      return newLottery;
    }
    
    // Ensure tables exist
    await ensureLotteryTablesExist();
    
    // Format lottery data for Supabase
    const formattedLottery = formatLotteryForSupabase(lottery);
    console.log('Formatted lottery data for insertion:', formattedLottery);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .insert(formattedLottery)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lottery in Supabase:', error);
      toast.error(`Erreur lors de la création de la loterie: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    if (!data) {
      console.error('No data returned after creating lottery');
      toast.error("Aucune donnée retournée après création de la loterie", { position: "bottom-right" });
      return null;
    }
    
    console.log('Lottery created successfully in Supabase:', data);
    
    // Convert to ExtendedLottery type
    const newLottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Update localStorage for offline usage
    let lotteries: ExtendedLottery[] = [];
    const localLotteries = localStorage.getItem('lotteries');
    
    if (localLotteries) {
      try {
        lotteries = JSON.parse(localLotteries);
      } catch (error) {
        console.error('Error parsing localStorage lotteries:', error);
      }
    }
    
    lotteries.push(newLottery);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    toast.success("Loterie créée avec succès !", { position: "bottom-right" });
    return newLottery;
  } catch (error) {
    console.error('Error creating lottery:', error);
    toast.error(`Erreur lors de la création de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

// Function to update an existing lottery
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    console.log('Updating lottery:', lottery);
    
    // Check Supabase connection
    const isConnected = await testSupabaseConnection();
    
    // Update in localStorage first for data resilience
    const localLotteries = localStorage.getItem('lotteries');
    let lotteries: ExtendedLottery[] = [];
    
    if (localLotteries) {
      try {
        lotteries = JSON.parse(localLotteries);
        const lotteryIndex = lotteries.findIndex(l => l.id === lottery.id);
        
        if (lotteryIndex !== -1) {
          lotteries[lotteryIndex] = {
            ...lotteries[lotteryIndex],
            ...lottery,
            participants: lotteries[lotteryIndex].participants, // Preserve existing participants
            winner: lotteries[lotteryIndex].winner // Preserve existing winner
          };
          
          localStorage.setItem('lotteries', JSON.stringify(lotteries));
          console.log('Lottery updated in localStorage');
        } else {
          console.warn(`Lottery with ID ${lottery.id} not found in localStorage`);
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
    
    if (!isConnected) {
      toast.warning("Mode hors-ligne actif: loterie mise à jour localement uniquement", { position: "bottom-right" });
      toast.success("Loterie modifiée avec succès (mode hors-ligne)", { position: "bottom-right" });
      return lottery;
    }
    
    // Ensure tables exist
    await ensureLotteryTablesExist();
    
    // Format lottery data for Supabase
    const formattedLottery = formatLotteryForSupabase(lottery);
    console.log('Formatted lottery data for update:', formattedLottery);
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .update(formattedLottery)
      .eq('id', lottery.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lottery in Supabase:', error);
      toast.error(`Erreur lors de la mise à jour de la loterie: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    if (!data) {
      console.error('No data returned after updating lottery');
      toast.error("Aucune donnée retournée après mise à jour de la loterie", { position: "bottom-right" });
      return null;
    }
    
    console.log('Lottery updated successfully in Supabase:', data);
    
    // Convert to ExtendedLottery type
    const updatedLottery = convertSupabaseLottery(data as DatabaseTables['lotteries']);
    
    // Preserve participants and winner from original lottery
    updatedLottery.participants = lottery.participants || [];
    updatedLottery.winner = lottery.winner;
    
    toast.success("Loterie modifiée avec succès !", { position: "bottom-right" });
    return updatedLottery;
  } catch (error) {
    console.error('Error updating lottery:', error);
    toast.error(`Erreur lors de la mise à jour de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

// Function to delete a lottery
export const deleteLottery = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting lottery with ID ${id}...`);
    
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting lottery with ID ${id}:`, error);
      toast.error(`Erreur lors de la suppression de la loterie: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    console.log(`Successfully deleted lottery with ID ${id}`);
    toast.success("Loterie supprimée avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error deleting lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to toggle lottery featured status
export const toggleLotteryFeatured = async (id: number, featured: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling featured status for lottery with ID ${id} to ${featured}...`);
    
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', id);
    
    if (error) {
      console.error(`Error toggling featured status for lottery with ID ${id}:`, error);
      toast.error(`Erreur lors de la modification du statut vedette: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    console.log(`Successfully toggled featured status for lottery with ID ${id} to ${featured}`);
    toast.success(featured ? "Loterie mise en vedette" : "Loterie retirée des vedettes", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error toggling featured status for lottery with ID ${id}:`, error);
    toast.error(`Erreur lors de la modification du statut vedette: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to update lottery winner
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
      toast.error(`Erreur lors de la mise à jour du statut de la loterie: ${lotteryError.message}`, { position: "bottom-right" });
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
      toast.error(`Erreur lors de la désignation du gagnant: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    console.log(`Successfully set winner for lottery with ID ${lotteryId}`);
    toast.success(`${winner.name} a été désigné(e) comme gagnant(e) !`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error setting winner for lottery with ID ${lotteryId}:`, error);
    toast.error(`Erreur lors de la désignation du gagnant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Export the function to clear all lottery data from Supabase
export const clearAllLotteryData = async (): Promise<boolean> => {
  try {
    console.log("Clearing all lottery data from Supabase...");
    
    // Delete all winners first (due to foreign key constraints)
    const { error: winnersError } = await supabase
      .from('lottery_winners')
      .delete()
      .neq('id', 0);
    
    if (winnersError) {
      console.error("Error clearing lottery winners:", winnersError);
      toast.error(`Erreur lors de la suppression des gagnants: ${winnersError.message}`, { position: "bottom-right" });
      return false;
    }
    
    // Delete all participants next
    const { error: participantsError } = await supabase
      .from('lottery_participants')
      .delete()
      .neq('id', 0);
    
    if (participantsError) {
      console.error("Error clearing lottery participants:", participantsError);
      toast.error(`Erreur lors de la suppression des participants: ${participantsError.message}`, { position: "bottom-right" });
      return false;
    }
    
    // Finally delete all lotteries
    const { error: lotteriesError } = await supabase
      .from('lotteries')
      .delete()
      .neq('id', 0);
    
    if (lotteriesError) {
      console.error("Error clearing lotteries


import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Function to initialize Supabase connection
export const initializeSupabase = async () => {
  console.log("Initializing Supabase connection...");
  
  try {
    // Check connection to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      console.log("Successfully connected to Supabase");
      
      // Subscribe to realtime channels for critical tables
      setupRealtimeSubscriptions();
      
      // Optional: Show success message
      // toast.success("Connecté au serveur");
      
      return true;
    } else {
      console.warn("Unable to connect to Supabase, using fallback data");
      toast.error("Impossible de se connecter au serveur, mode hors-ligne activé");
      return false;
    }
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    toast.error("Erreur de connexion au serveur");
    return false;
  }
};

// Setup realtime subscriptions
const setupRealtimeSubscriptions = () => {
  // Subscribe to lotteries changes
  const lotteriesChannel = supabase
    .channel('lottery-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lotteries' }, 
      (payload) => {
        console.log("Lottery data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();
  
  // Subscribe to lottery participants changes  
  const participantsChannel = supabase
    .channel('participant-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lottery_participants' }, 
      (payload) => {
        console.log("Lottery participant data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();
  
  // Subscribe to lottery winners changes
  const winnersChannel = supabase
    .channel('winner-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lottery_winners' }, 
      (payload) => {
        console.log("Lottery winner data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();

  // We don't need to unsubscribe because these channels should last for the entire app lifetime
};

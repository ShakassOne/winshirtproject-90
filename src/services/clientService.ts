
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from '@/lib/toast';

/**
 * Hook to fetch clients data
 */
export const useClients = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchClients = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setClients(data as Client[]);
        
        // Store in localStorage as fallback
        localStorage.setItem('clients', JSON.stringify(data));
      } else {
        // Fallback to localStorage
        const storedClients = localStorage.getItem('clients');
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        } else {
          // If no data in localStorage, use empty array
          setClients([]);
        }
      }
      return true;
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        try {
          setClients(JSON.parse(storedClients));
        } catch (e) {
          setClients([]);
        }
      } else {
        setClients([]);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, error, refreshClients: fetchClients };
};

/**
 * Synchronizes client data with Supabase
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating success or failure
 */
export const syncClientsToSupabase = async (): Promise<boolean> => {
  try {
    // Fetch clients from localStorage
    const storedClients = localStorage.getItem('clients');
    if (!storedClients) {
      console.error('No local clients found to sync');
      return false;
    }
    
    const localClients: Client[] = JSON.parse(storedClients);

    // Use one client at a time to avoid batch errors
    for (const client of localClients) {
      const { error } = await supabase
        .from('clients')
        .upsert({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || null,
          address: client.address || null,
          city: client.city || null,
          postal_code: client.postalCode || null,
          country: client.country || null,
          registration_date: client.registrationDate,
          last_login: client.lastLogin || null,
          order_count: client.orderCount,
          total_spent: client.totalSpent,
          participated_lotteries: client.participatedLotteries || [],
          won_lotteries: client.wonLotteries || []
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error syncing client ID ${client.id}:`, error);
        toast.error(`Erreur lors de la synchronisation du client ID ${client.id}: ${error.message}`, { position: "bottom-right" });
        // Continue with next client
      }
    }

    toast.success(`Clients synchronisés avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error syncing clients:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

import React from 'react';


import { supabase } from '@/integrations/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Client } from '@/types/client';
import { toast } from '@/lib/toast';

// Fonction pour sauvegarder les clients dans le localStorage (fallback)
const saveClientsToLocalStorage = (clients: Client[]) => {
  try {
    localStorage.setItem('clients', JSON.stringify(clients));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

// Fonction pour récupérer tous les clients
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      console.log('Supabase n\'est pas configuré. Utilisation du localStorage uniquement.');
      const storedClients = localStorage.getItem('clients');
      return storedClients ? JSON.parse(storedClients) : [];
    }
    
    // Récupérer les données depuis Supabase
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    // Convertir les données au format Client
    const clients: Client[] = data.map(item => ({
      id: item.id,
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address?.street || '',
      city: item.address?.city || '',
      postalCode: item.address?.postalCode || '',
      country: item.address?.country || '',
      registrationDate: item.created_at,
      lastLogin: item.updated_at,
      orderCount: 0, // Ces valeurs seront calculées plus tard
      totalSpent: 0,
      participatedLotteries: [],
      wonLotteries: []
    }));
    
    // Enrichir les données avec des informations supplémentaires
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      
      // Récupérer le nombre de commandes et le total dépensé
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total')
        .eq('user_id', client.id);
      
      if (!ordersError && ordersData) {
        client.orderCount = ordersData.length;
        client.totalSpent = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      }
      
      // Récupérer les loteries auxquelles le client a participé
      const { data: participationsData, error: participationsError } = await supabase
        .from('lottery_participants')
        .select('lottery_id')
        .eq('user_id', client.id);
      
      if (!participationsError && participationsData) {
        client.participatedLotteries = participationsData.map(p => p.lottery_id);
      }
      
      // Récupérer les loteries gagnées par le client
      const { data: winsData, error: winsError } = await supabase
        .from('lottery_winners')
        .select('lottery_id')
        .eq('user_id', client.id);
      
      if (!winsError && winsData) {
        client.wonLotteries = winsData.map(w => w.lottery_id);
      }
    }
    
    // Sauvegarder dans localStorage comme fallback
    saveClientsToLocalStorage(clients);
    
    return clients;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    toast.error("Erreur de connexion: utilisation des données locales");
    
    // Fallback au localStorage en cas d'erreur
    const storedClients = localStorage.getItem('clients');
    return storedClients ? JSON.parse(storedClients) : [];
  }
};

// Fonction pour créer un nouveau client
export const createClient = async (client: Omit<Client, 'id' | 'registrationDate' | 'orderCount' | 'totalSpent' | 'participatedLotteries' | 'wonLotteries'>): Promise<Client | null> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedClients = localStorage.getItem('clients');
      const clients: Client[] = storedClients ? JSON.parse(storedClients) : [];
      
      const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
      const newClient: Client = {
        ...client,
        id: newId,
        registrationDate: new Date().toISOString(),
        orderCount: 0,
        totalSpent: 0,
        participatedLotteries: [],
        wonLotteries: []
      };
      
      clients.push(newClient);
      saveClientsToLocalStorage(clients);
      
      toast.success("Client créé avec succès (stockage local)");
      return newClient;
    }
    
    // Préparation des données pour Supabase
    const clientData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: {
        street: client.address,
        city: client.city,
        postalCode: client.postalCode,
        country: client.country
      }
    };
    
    // Insertion dans Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Conversion des données reçues en format Client
    const createdClient: Client = {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address?.street || '',
      city: data.address?.city || '',
      postalCode: data.address?.postalCode || '',
      country: data.address?.country || '',
      registrationDate: data.created_at,
      lastLogin: data.updated_at,
      orderCount: 0,
      totalSpent: 0,
      participatedLotteries: [],
      wonLotteries: []
    };
    
    // Mise à jour du localStorage pour le cas où Supabase deviendrait inaccessible
    const clients = await fetchClients();
    clients.push(createdClient);
    saveClientsToLocalStorage(clients);
    
    toast.success("Client créé avec succès");
    return createdClient;
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);
    toast.error(`Erreur lors de la création du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Fonction pour mettre à jour un client existant
export const updateClient = async (client: Client): Promise<Client | null> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedClients = localStorage.getItem('clients');
      let clients: Client[] = storedClients ? JSON.parse(storedClients) : [];
      
      clients = clients.map(c => c.id === client.id ? client : c);
      saveClientsToLocalStorage(clients);
      
      toast.success("Client mis à jour avec succès (stockage local)");
      return client;
    }
    
    // Préparation des données pour Supabase
    const clientData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: {
        street: client.address,
        city: client.city,
        postalCode: client.postalCode,
        country: client.country
      },
      updated_at: new Date().toISOString()
    };
    
    // Mise à jour dans Supabase
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', client.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Conversion des données reçues en format Client
    const updatedClient: Client = {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address?.street || '',
      city: data.address?.city || '',
      postalCode: data.address?.postalCode || '',
      country: data.address?.country || '',
      registrationDate: data.created_at,
      lastLogin: data.updated_at,
      orderCount: client.orderCount,
      totalSpent: client.totalSpent,
      participatedLotteries: client.participatedLotteries,
      wonLotteries: client.wonLotteries
    };
    
    // Mise à jour du localStorage
    const clients = await fetchClients();
    const updatedClients = clients.map(c => c.id === client.id ? updatedClient : c);
    saveClientsToLocalStorage(updatedClients);
    
    toast.success("Client mis à jour avec succès");
    return updatedClient;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    toast.error(`Erreur lors de la mise à jour du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Fonction pour supprimer un client
export const deleteClient = async (clientId: number): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedClients = localStorage.getItem('clients');
      let clients = storedClients ? JSON.parse(storedClients) : [];
      
      clients = clients.filter((c: Client) => c.id !== clientId);
      saveClientsToLocalStorage(clients);
      
      toast.success("Client supprimé avec succès (stockage local)");
      return true;
    }
    
    // Supprimer le client dans Supabase
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
    
    if (error) throw error;
    
    // Mise à jour du localStorage
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      const clients = JSON.parse(storedClients).filter((c: Client) => c.id !== clientId);
      saveClientsToLocalStorage(clients);
    }
    
    toast.success("Client supprimé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    toast.error(`Erreur lors de la suppression du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

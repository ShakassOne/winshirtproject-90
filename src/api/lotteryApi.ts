
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

// Helper function to save lotteries to localStorage
const saveLotteriesToLocalStorage = (lotteries: ExtendedLottery[]) => {
  try {
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

// Function to get next ID from localStorage lotteries
const getNextLotteryId = (lotteries: ExtendedLottery[]): number => {
  if (lotteries.length === 0) return 1;
  const maxId = Math.max(...lotteries.map(lottery => lottery.id));
  return maxId + 1;
};

// Fonction pour récupérer toutes les loteries
export const fetchLotteries = async (): Promise<ExtendedLottery[]> => {
  // Vérifier si Supabase est configuré
  if (!isSupabaseConfigured()) {
    console.log('Supabase n\'est pas configuré. Utilisation du localStorage uniquement.');
    const storedLotteries = localStorage.getItem('lotteries');
    return storedLotteries ? JSON.parse(storedLotteries) : [];
  }

  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*');
    
    if (error) throw error;
    
    // Convertir les données au format ExtendedLottery
    const lotteries: ExtendedLottery[] = data.map(item => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        value: item.value,
        targetParticipants: item.target_participants,
        currentParticipants: item.current_participants || 0,
        status: item.status,
        image: item.image,
        linkedProducts: item.linked_products,
        participants: item.participants,
        winner: item.winner,
        drawDate: item.draw_date,
        endDate: item.end_date,
        featured: item.featured || false,
      };
    });
    
    // Sauvegarder dans localStorage comme fallback
    saveLotteriesToLocalStorage(lotteries);
    
    return lotteries;
  } catch (error) {
    console.error('Erreur lors de la récupération des loteries:', error);
    toast.error("Erreur de connexion: utilisation des données locales");
    
    // Fallback au localStorage en cas d'erreur
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        return JSON.parse(storedLotteries);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
};

// Fonction pour créer une nouvelle loterie
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      const lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      const newId = getNextLotteryId(lotteries);
      const newLottery: ExtendedLottery = {
        ...lottery,
        id: newId
      };
      
      lotteries.push(newLottery);
      saveLotteriesToLocalStorage(lotteries);
      
      toast.success("Loterie créée avec succès (stockage local)");
      return newLottery;
    } catch (error) {
      console.error('Erreur lors de la création de la loterie en local:', error);
      toast.error("Erreur lors de la création de la loterie");
      return null;
    }
  }

  try {
    const { data, error } = await supabase
      .from('lotteries')
      .insert({
        title: lottery.title,
        description: lottery.description,
        value: lottery.value,
        target_participants: lottery.targetParticipants,
        current_participants: lottery.currentParticipants || 0,
        status: lottery.status,
        image: lottery.image,
        linked_products: lottery.linkedProducts || [],
        participants: lottery.participants || [],
        winner: lottery.winner || null,
        draw_date: lottery.drawDate || null,
        end_date: lottery.endDate || null,
        featured: lottery.featured || false,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Convertir au format ExtendedLottery
    const createdLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description,
      value: data.value,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      status: data.status,
      image: data.image,
      linkedProducts: data.linked_products,
      participants: data.participants,
      winner: data.winner,
      drawDate: data.draw_date,
      endDate: data.end_date,
      featured: data.featured || false,
    };
    
    // Mettre à jour le localStorage pour la cohérence
    const lotteries = await fetchLotteries();
    lotteries.push(createdLottery);
    saveLotteriesToLocalStorage(lotteries);
    
    return createdLottery;
  } catch (error) {
    console.error('Erreur lors de la création de la loterie:', error);
    toast.error("Erreur de connexion: sauvegardée localement");
    
    // Fallback au localStorage
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      const lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      const newId = getNextLotteryId(lotteries);
      const newLottery: ExtendedLottery = {
        ...lottery,
        id: newId
      };
      
      lotteries.push(newLottery);
      saveLotteriesToLocalStorage(lotteries);
      
      return newLottery;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la création de la loterie");
      return null;
    }
  }
};

// Fonction pour mettre à jour une loterie existante
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lottery.id ? lottery : l);
      saveLotteriesToLocalStorage(lotteries);
      
      toast.success("Loterie mise à jour avec succès (stockage local)");
      return lottery;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la loterie en local:', error);
      toast.error("Erreur lors de la mise à jour de la loterie");
      return null;
    }
  }

  try {
    const { data, error } = await supabase
      .from('lotteries')
      .update({
        title: lottery.title,
        description: lottery.description,
        value: lottery.value,
        target_participants: lottery.targetParticipants,
        current_participants: lottery.currentParticipants || 0,
        status: lottery.status,
        image: lottery.image,
        linked_products: lottery.linkedProducts || [],
        participants: lottery.participants || [],
        winner: lottery.winner || null,
        draw_date: lottery.drawDate || null,
        end_date: lottery.endDate || null,
        featured: lottery.featured || false,
      })
      .eq('id', lottery.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convertir au format ExtendedLottery
    const updatedLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description,
      value: data.value,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants || 0,
      status: data.status,
      image: data.image,
      linkedProducts: data.linked_products,
      participants: data.participants,
      winner: data.winner,
      drawDate: data.draw_date,
      endDate: data.end_date,
      featured: data.featured || false,
    };
    
    // Mettre à jour le localStorage pour la cohérence
    const lotteries = await fetchLotteries();
    const updatedLotteries = lotteries.map(l => l.id === lottery.id ? updatedLottery : l);
    saveLotteriesToLocalStorage(updatedLotteries);
    
    return updatedLottery;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la loterie:', error);
    toast.error("Erreur de connexion: sauvegardée localement");
    
    // Fallback au localStorage
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lottery.id ? lottery : l);
      saveLotteriesToLocalStorage(lotteries);
      
      return lottery;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la mise à jour de la loterie");
      return null;
    }
  }
};

// Fonction pour supprimer une loterie
export const deleteLottery = async (lotteryId: number): Promise<boolean> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.filter(l => l.id !== lotteryId);
      saveLotteriesToLocalStorage(lotteries);
      
      toast.success("Loterie supprimée avec succès (stockage local)");
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la loterie en local:', error);
      toast.error("Erreur lors de la suppression de la loterie");
      return false;
    }
  }

  try {
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    // Mettre à jour le localStorage pour la cohérence
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        let lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
        lotteries = lotteries.filter(l => l.id !== lotteryId);
        saveLotteriesToLocalStorage(lotteries);
      } catch (e) {
        console.error('Erreur lors de la mise à jour du localStorage:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la loterie:', error);
    toast.error("Erreur de connexion: supprimée localement");
    
    // Fallback au localStorage
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.filter(l => l.id !== lotteryId);
      saveLotteriesToLocalStorage(lotteries);
      
      return true;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la suppression de la loterie");
      return false;
    }
  }
};

// Fonction pour mettre à jour le statut "featured" d'une loterie
export const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lotteryId ? { ...l, featured } : l);
      saveLotteriesToLocalStorage(lotteries);
      
      toast.success(featured ? "Loterie ajoutée aux vedettes (stockage local)" : "Loterie retirée des vedettes (stockage local)");
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut featured en local:', error);
      toast.error("Erreur lors de la mise à jour du statut featured");
      return false;
    }
  }

  try {
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    // Mettre à jour le localStorage pour la cohérence
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        let lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
        lotteries = lotteries.map(l => l.id === lotteryId ? { ...l, featured } : l);
        saveLotteriesToLocalStorage(lotteries);
      } catch (e) {
        console.error('Erreur lors de la mise à jour du localStorage:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut featured:', error);
    toast.error("Erreur de connexion: statut mis à jour localement");
    
    // Fallback au localStorage
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lotteryId ? { ...l, featured } : l);
      saveLotteriesToLocalStorage(lotteries);
      
      return true;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la mise à jour du statut featured");
      return false;
    }
  }
};

// Fonction pour mettre à jour le gagnant d'une loterie
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const now = new Date().toISOString();
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lotteryId ? { 
        ...l, 
        winner, 
        drawDate: now, 
        status: 'completed' as const 
      } : l);
      
      saveLotteriesToLocalStorage(lotteries);
      
      toast.success(`Le gagnant de la loterie est ${winner.name} ! (stockage local)`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du gagnant en local:', error);
      toast.error("Erreur lors de la mise à jour du gagnant");
      return false;
    }
  }

  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('lotteries')
      .update({
        winner,
        draw_date: now,
        status: 'completed'
      })
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    // Mettre à jour le localStorage pour la cohérence
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      try {
        let lotteries: ExtendedLottery[] = JSON.parse(storedLotteries);
        lotteries = lotteries.map(l => l.id === lotteryId ? { 
          ...l, 
          winner, 
          drawDate: now, 
          status: 'completed' as const 
        } : l);
        saveLotteriesToLocalStorage(lotteries);
      } catch (e) {
        console.error('Erreur lors de la mise à jour du localStorage:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du gagnant:', error);
    toast.error("Erreur de connexion: gagnant mis à jour localement");
    
    // Fallback au localStorage
    try {
      const now = new Date().toISOString();
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries: ExtendedLottery[] = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map(l => l.id === lotteryId ? { 
        ...l, 
        winner, 
        drawDate: now, 
        status: 'completed' as const 
      } : l);
      
      saveLotteriesToLocalStorage(lotteries);
      
      return true;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la mise à jour du gagnant");
      return false;
    }
  }
};


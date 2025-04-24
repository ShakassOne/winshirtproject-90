import { supabase } from '@/integrations/supabase/client';
import { isSupabaseConfigured, snakeToCamel, camelToSnake } from '@/lib/supabase';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

// Fonction pour récupérer toutes les loteries
export const fetchLotteries = async (forceRefresh: boolean = false): Promise<ExtendedLottery[]> => {
  try {
    const isConnected = await isSupabaseConfigured();

    if (!isConnected) {
      console.log("Supabase n'est pas configuré, utilisation du localStorage");
      const storedLotteries = localStorage.getItem('lotteries');
      return storedLotteries ? JSON.parse(storedLotteries) : [];
    }

    // Récupérer les données depuis Supabase
    const { data: lotteriesData, error: lotteriesError } = await supabase
      .from('lotteries')
      .select('*');

    if (lotteriesError) {
      throw lotteriesError;
    }

    // Récupérer les participants pour chaque loterie
    const lotteriesWithParticipants: ExtendedLottery[] = await Promise.all(
      lotteriesData.map(async (lottery: any) => {
        const { data: participantsData, error: participantsError } = await supabase
          .from('lottery_participants')
          .select('*')
          .eq('lottery_id', lottery.id);

        const { data: winnersData, error: winnersError } = await supabase
          .from('lottery_winners')
          .select('*')
          .eq('lottery_id', lottery.id)
          .maybeSingle();

        // Convertir les données au format ExtendedLottery
        const participants: Participant[] = participantsError ? [] : participantsData.map((p: any) => ({
          id: p.id,
          name: p.name || 'Participant',
          email: p.email || '',
          avatar: p.avatar || `https://ui-avatars.com/api/?name=${p.name?.split(' ').join('+') || 'User'}`
        }));

        const winner: Participant | null = winnersData ? {
          id: winnersData.id,
          name: winnersData.name || 'Gagnant',
          email: winnersData.email || '',
          avatar: winnersData.avatar || `https://ui-avatars.com/api/?name=${winnersData.name?.split(' ').join('+') || 'Winner'}`
        } : null;

        return {
          id: lottery.id,
          title: lottery.title,
          description: lottery.description || '',
          value: lottery.value,
          targetParticipants: lottery.target_participants,
          currentParticipants: lottery.current_participants || 0,
          status: lottery.status as "active" | "completed" | "relaunched" | "cancelled",
          image: lottery.image || 'https://placehold.co/600x400/png?text=Loterie',
          linkedProducts: lottery.linked_products || [],
          participants,
          winner,
          drawDate: lottery.draw_date,
          endDate: lottery.end_date,
          featured: lottery.featured || false
        };
      })
    );

    // Mettre à jour les données localement pour le cas où Supabase serait inaccessible plus tard
    localStorage.setItem('lotteries', JSON.stringify(lotteriesWithParticipants));
    
    return lotteriesWithParticipants;
  } catch (error) {
    console.error("Erreur lors de la récupération des loteries:", error);
    
    // Fallback au localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    return storedLotteries ? JSON.parse(storedLotteries) : [];
  }
};

// Fonction pour récupérer une loterie par son ID
export const fetchLotteryById = async (lotteryId: number): Promise<ExtendedLottery | null> => {
  try {
    const allLotteries = await fetchLotteries();
    const lottery = allLotteries.find(l => l.id === lotteryId);
    
    if (!lottery) {
      toast.error("Loterie non trouvée");
      return null;
    }
    
    return lottery;
  } catch (error) {
    console.error("Erreur lors de la récupération de la loterie:", error);
    toast.error(`Erreur lors de la récupération de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Fonction pour créer une nouvelle loterie
export const createLottery = async (lottery: Omit<ExtendedLottery, 'id'>): Promise<ExtendedLottery | null> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      const lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      const newId = lotteries.length > 0 ? Math.max(...lotteries.map((l: any) => l.id)) + 1 : 1;
      const newLottery = {
        ...lottery,
        id: newId,
        currentParticipants: 0
      };
      
      lotteries.push(newLottery);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      toast.success("Loterie créée avec succès (stockage local)");
      return newLottery;
    }
    
    // Préparation des données pour Supabase
    const lotteryData = {
      title: lottery.title,
      description: lottery.description,
      value: lottery.value,
      target_participants: lottery.targetParticipants,
      current_participants: 0,
      status: lottery.status,
      image: lottery.image,
      linked_products: lottery.linkedProducts || [],
      draw_date: lottery.drawDate || null,
      end_date: lottery.endDate || null,
      featured: lottery.featured || false
    };
    
    // Insertion dans Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .insert(lotteryData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Conversion des données reçues en format ExtendedLottery
    const createdLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      value: data.value,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants,
      status: data.status as "active" | "completed" | "relaunched" | "cancelled",
      image: data.image || 'https://placehold.co/600x400/png?text=Loterie',
      linkedProducts: data.linked_products || [],
      participants: [],
      winner: null,
      drawDate: data.draw_date,
      endDate: data.end_date,
      featured: data.featured || false
    };
    
    // Mise à jour du localStorage pour le cas où Supabase deviendrait inaccessible
    const lotteries = await fetchLotteries();
    lotteries.push(createdLottery);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    toast.success("Loterie créée avec succès");
    return createdLottery;
  } catch (error) {
    console.error("Erreur lors de la création de la loterie:", error);
    toast.error(`Erreur lors de la création de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Fonction pour mettre à jour une loterie existante
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map((l: ExtendedLottery) => l.id === lottery.id ? lottery : l);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      toast.success("Loterie mise à jour avec succès (stockage local)");
      return lottery;
    }
    
    // Préparation des données pour Supabase
    const lotteryData = {
      title: lottery.title,
      description: lottery.description,
      value: lottery.value,
      target_participants: lottery.targetParticipants,
      current_participants: lottery.currentParticipants,
      status: lottery.status,
      image: lottery.image,
      linked_products: lottery.linkedProducts || [],
      draw_date: lottery.drawDate || null,
      end_date: lottery.endDate || null,
      featured: lottery.featured || false
    };
    
    // Mise à jour dans Supabase
    const { data, error } = await supabase
      .from('lotteries')
      .update(lotteryData)
      .eq('id', lottery.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Conversion des données reçues en format ExtendedLottery
    const updatedLottery: ExtendedLottery = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      value: data.value,
      targetParticipants: data.target_participants,
      currentParticipants: data.current_participants,
      status: data.status as "active" | "completed" | "relaunched" | "cancelled",
      image: data.image || 'https://placehold.co/600x400/png?text=Loterie',
      linkedProducts: data.linked_products || [],
      participants: lottery.participants || [],
      winner: lottery.winner,
      drawDate: data.draw_date,
      endDate: data.end_date,
      featured: data.featured || false
    };
    
    // Mise à jour du localStorage pour le cas où Supabase deviendrait inaccessible
    const lotteries = await fetchLotteries();
    const updatedLotteries = lotteries.map((l: ExtendedLottery) => l.id === lottery.id ? updatedLottery : l);
    localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
    
    toast.success("Loterie mise à jour avec succès");
    return updatedLottery;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la loterie:", error);
    toast.error(`Erreur lors de la mise à jour de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
};

// Fonction pour supprimer une loterie
export const deleteLottery = async (lotteryId: number): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.filter((l: ExtendedLottery) => l.id !== lotteryId);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      toast.success("Loterie supprimée avec succès (stockage local)");
      return true;
    }
    
    // Supprimer d'abord les participants de cette loterie
    const { error: participantsError } = await supabase
      .from('lottery_participants')
      .delete()
      .eq('lottery_id', lotteryId);
    
    if (participantsError) {
      console.error("Erreur lors de la suppression des participants:", participantsError);
    }
    
    // Supprimer les gagnants de cette loterie
    const { error: winnersError } = await supabase
      .from('lottery_winners')
      .delete()
      .eq('lottery_id', lotteryId);
    
    if (winnersError) {
      console.error("Erreur lors de la suppression des gagnants:", winnersError);
    }
    
    // Supprimer la loterie elle-même
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    // Mise à jour du localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (storedLotteries) {
      const lotteries = JSON.parse(storedLotteries).filter((l: ExtendedLottery) => l.id !== lotteryId);
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
    }
    
    // Mettre à jour les produits liés à cette loterie
    try {
      // Récupérer les produits qui sont liés à cette loterie
      const { data: productsData } = await supabase
        .from('products')
        .select('id, linked_lotteries')
        .contains('linked_lotteries', [lotteryId]);
      
      if (productsData && productsData.length > 0) {
        // Pour chaque produit, mettre à jour le tableau linked_lotteries
        for (const product of productsData) {
          const updatedLotteriesArray = (product.linked_lotteries || []).filter((id: number) => id !== lotteryId);
          
          await supabase
            .from('products')
            .update({ linked_lotteries: updatedLotteriesArray })
            .eq('id', product.id);
        }
      }
    } catch (productError) {
      console.error("Erreur lors de la mise à jour des produits liés:", productError);
    }
    
    toast.success("Loterie supprimée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la loterie:", error);
    toast.error(`Erreur lors de la suppression de la loterie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Fonction pour ajouter un participant à une loterie
export const addLotteryParticipant = async (lotteryId: number, participant: Participant): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map((l: ExtendedLottery) => {
        if (l.id === lotteryId) {
          const participants = l.participants || [];
          return {
            ...l,
            participants: [...participants, participant],
            currentParticipants: (l.currentParticipants || 0) + 1
          };
        }
        return l;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      return true;
    }
    
    // Ajouter le participant à la table lottery_participants
    const { error: participantError } = await supabase
      .from('lottery_participants')
      .insert({
        lottery_id: lotteryId,
        user_id: participant.id,
        name: participant.name,
        email: participant.email,
        avatar: participant.avatar
      });
    
    if (participantError) throw participantError;
    
    // Mettre à jour le nombre de participants dans la loterie
    const { data: lotteryData, error: lotteryError } = await supabase
      .from('lotteries')
      .select('current_participants')
      .eq('id', lotteryId)
      .single();
    
    if (lotteryError) throw lotteryError;
    
    const newParticipantCount = (lotteryData.current_participants || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('lotteries')
      .update({ current_participants: newParticipantCount })
      .eq('id', lotteryId);
    
    if (updateError) throw updateError;
    
    // Mise à jour du localStorage
    const lotteries = await fetchLotteries(true);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout du participant:", error);
    toast.error(`Erreur lors de l'ajout du participant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Fonction pour désigner un gagnant pour une loterie
export const selectLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map((l: ExtendedLottery) => {
        if (l.id === lotteryId) {
          return {
            ...l,
            winner: winner,
            status: 'completed' as 'active' | 'completed' | 'relaunched' | 'cancelled'
          };
        }
        return l;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      return true;
    }
    
    // Ajouter le gagnant à la table lottery_winners
    const { error: winnerError } = await supabase
      .from('lottery_winners')
      .insert({
        lottery_id: lotteryId,
        user_id: winner.id,
        name: winner.name,
        email: winner.email,
        avatar: winner.avatar,
        drawn_at: new Date().toISOString()
      });
    
    if (winnerError) throw winnerError;
    
    // Mettre à jour le statut de la loterie
    const { error: lotteryError } = await supabase
      .from('lotteries')
      .update({ status: 'completed' })
      .eq('id', lotteryId);
    
    if (lotteryError) throw lotteryError;
    
    // Mise à jour du localStorage
    const lotteries = await fetchLotteries(true);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la désignation du gagnant:", error);
    toast.error(`Erreur lors de la désignation du gagnant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Fonction pour mettre à jour le gagnant d'une loterie
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
  try {
    // D'abord, vérifier si la loterie existe
    const lottery = await fetchLotteryById(lotteryId);
    if (!lottery) {
      toast.error("Loterie non trouvée");
      return false;
    }

    // Appeler selectLotteryWinner qui contient déjà la logique pour désigner un gagnant
    const success = await selectLotteryWinner(lotteryId, winner);
    
    if (success) {
      toast.success("Gagnant mis à jour avec succès");
    }
    
    return success;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du gagnant:", error);
    toast.error(`Erreur lors de la mise à jour du gagnant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Fonction pour activer/désactiver la mise en avant d'une loterie
export const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  try {
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      // Fallback au localStorage
      const storedLotteries = localStorage.getItem('lotteries');
      let lotteries = storedLotteries ? JSON.parse(storedLotteries) : [];
      
      lotteries = lotteries.map((l: ExtendedLottery) => {
        if (l.id === lotteryId) {
          return {
            ...l,
            featured
          };
        }
        return l;
      });
      
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      
      toast.success(`Loterie ${featured ? 'mise en avant' : 'retirée des mises en avant'} avec succès (stockage local)`);
      return true;
    }
    
    // Mise à jour dans Supabase
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    // Mise à jour du localStorage
    const lotteries = await fetchLotteries(true);
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    toast.success(`Loterie ${featured ? 'mise en avant' : 'retirée des mises en avant'} avec succès`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la modification du statut vedette:", error);
    toast.error(`Erreur lors de la modification du statut vedette: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

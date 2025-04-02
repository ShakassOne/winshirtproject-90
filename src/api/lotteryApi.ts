
import { supabase } from '@/lib/supabase';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

// Fonction pour récupérer toutes les loteries
export const fetchLotteries = async (): Promise<ExtendedLottery[]> => {
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
    
    return lotteries;
  } catch (error) {
    console.error('Erreur lors de la récupération des loteries:', error);
    toast.error("Erreur lors du chargement des loteries");
    
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
    
    return createdLottery;
  } catch (error) {
    console.error('Erreur lors de la création de la loterie:', error);
    toast.error("Erreur lors de la création de la loterie");
    return null;
  }
};

// Fonction pour mettre à jour une loterie existante
export const updateLottery = async (lottery: ExtendedLottery): Promise<ExtendedLottery | null> => {
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
    
    return updatedLottery;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la loterie:', error);
    toast.error("Erreur lors de la mise à jour de la loterie");
    return null;
  }
};

// Fonction pour supprimer une loterie
export const deleteLottery = async (lotteryId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .delete()
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la loterie:', error);
    toast.error("Erreur lors de la suppression de la loterie");
    return false;
  }
};

// Fonction pour mettre à jour le statut "featured" d'une loterie
export const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lotteries')
      .update({ featured })
      .eq('id', lotteryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut featured:', error);
    toast.error("Erreur lors de la mise à jour du statut featured");
    return false;
  }
};

// Fonction pour mettre à jour le gagnant d'une loterie
export const updateLotteryWinner = async (lotteryId: number, winner: Participant): Promise<boolean> => {
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
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du gagnant:', error);
    toast.error("Erreur lors de la mise à jour du gagnant");
    return false;
  }
};

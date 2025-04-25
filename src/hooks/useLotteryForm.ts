
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { isSupabaseConfigured, syncLocalDataToSupabase } from '@/lib/supabase';

export const useLotteryForm = (
  lotteries: ExtendedLottery[],
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: ExtendedProduct[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      value: 0,
      targetParticipants: 10,
      currentParticipants: 0,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7',
      linkedProducts: [] as string[],
      featured: false
    }
  });

  // Fonction pour obtenir l'ID suivant (pour le stockage local)
  const getNextId = (): number => {
    if (lotteries.length === 0) return 1;
    return Math.max(...lotteries.map(lottery => lottery.id)) + 1;
  };

  // Fonction pour créer une nouvelle loterie
  const handleCreateLottery = (): void => {
    form.reset({
      title: '',
      description: '',
      value: 0,
      targetParticipants: 10,
      currentParticipants: 0,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7',
      linkedProducts: [] as string[],
      featured: false
    });
    setIsCreating(true);
    setSelectedLotteryId(null);
  };

  // Fonction pour éditer une loterie existante
  const handleEditLottery = (id: number): void => {
    const lotteryToEdit = lotteries.find(lottery => lottery.id === id);
    if (!lotteryToEdit) return;

    form.reset({
      title: lotteryToEdit.title,
      description: lotteryToEdit.description || '',
      value: lotteryToEdit.value,
      targetParticipants: lotteryToEdit.targetParticipants,
      currentParticipants: lotteryToEdit.currentParticipants,
      status: lotteryToEdit.status,
      image: lotteryToEdit.image || '',
      linkedProducts: lotteryToEdit.linkedProducts?.map(id => id.toString()) || [],
      featured: Boolean(lotteryToEdit.featured)
    });

    setSelectedLotteryId(id);
    setIsCreating(false);
  };

  // Function to toggle featured status
  const handleToggleFeatured = async (id: number): Promise<void> => {
    try {
      const updatedLotteries = lotteries.map(lottery => 
        lottery.id === id ? { ...lottery, featured: !lottery.featured } : lottery
      );
      
      setLotteries(updatedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      const lottery = updatedLotteries.find(l => l.id === id);
      const featuredStatus = lottery?.featured ? 'mise en avant' : 'retirée des mises en avant';
      toast.success(`Loterie ${featuredStatus}`, { position: "bottom-right" });
      
      // Sync to Supabase if connected
      const supabaseConnected = localStorage.getItem('supabase_connected') === 'true';
      if (supabaseConnected) {
        await syncLocalDataToSupabase('lotteries');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error("Erreur lors du changement de statut", { position: "bottom-right" });
    }
  };

  // Fonction pour soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      // Convertir les IDs de produits en nombres
      const linkedProducts = data.linkedProducts.map((id: string) => parseInt(id, 10));
      
      // Préparer l'objet loterie
      const newLottery: ExtendedLottery = {
        id: isCreating ? getNextId() : selectedLotteryId || getNextId(),
        title: data.title,
        description: data.description,
        value: parseFloat(data.value),
        targetParticipants: parseInt(data.targetParticipants, 10),
        currentParticipants: parseInt(data.currentParticipants, 10) || 0,
        status: data.status,
        image: data.image,
        linkedProducts,
        featured: data.featured,
        endDate: data.endDate || null,
        drawDate: data.drawDate || null
      };

      // Mettre à jour les loteries
      let updatedLotteries: ExtendedLottery[];
      
      if (isCreating) {
        updatedLotteries = [...lotteries, newLottery];
        toast.success(`Loterie "${data.title}" créée avec succès`, { position: "bottom-right" });
      } else {
        updatedLotteries = lotteries.map(lottery => 
          lottery.id === selectedLotteryId ? newLottery : lottery
        );
        toast.success(`Loterie "${data.title}" mise à jour avec succès`, { position: "bottom-right" });
      }
      
      // Mettre à jour l'état et le localStorage
      setLotteries(updatedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      // Synchroniser avec Supabase si connecté
      const supabaseConnected = localStorage.getItem('supabase_connected') === 'true';
      if (supabaseConnected) {
        console.log("Tentative de synchronisation avec Supabase");
        await syncLocalDataToSupabase('lotteries');
      }
      
      // Réinitialiser le formulaire et l'état
      form.reset();
      setIsCreating(false);
      setSelectedLotteryId(null);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour annuler l'édition
  const handleCancel = (): void => {
    form.reset();
    setIsCreating(false);
    setSelectedLotteryId(null);
  };

  // Fonction pour supprimer une loterie
  const handleDeleteLottery = (id: number): void => {
    try {
      // Si la loterie en cours d'édition est supprimée, réinitialiser le formulaire
      if (id === selectedLotteryId) {
        form.reset();
        setIsCreating(false);
        setSelectedLotteryId(null);
      }

      // Mettre à jour l'état et le localStorage
      const updatedLotteries = lotteries.filter(lottery => lottery.id !== id);
      setLotteries(updatedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      toast.success("Loterie supprimée avec succès", { position: "bottom-right" });
      
      // Synchroniser avec Supabase si connecté
      const supabaseConnected = localStorage.getItem('supabase_connected') === 'true';
      if (supabaseConnected) {
        syncLocalDataToSupabase('lotteries');
      }
    } catch (error) {
      console.error('Error deleting lottery:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
  };

  // Fonction pour tirer au sort un gagnant
  const handleDrawWinner = (id: number): void => {
    try {
      // Trouver la loterie
      const lottery = lotteries.find(l => l.id === id);
      if (!lottery) {
        toast.error("Loterie non trouvée", { position: "bottom-right" });
        return;
      }

      // Simuler un tirage au sort
      const winnerName = "Participant gagnant";
      const winnerEmail = "gagnant@example.com";
      
      // Mettre à jour le statut de la loterie
      const updatedLotteries = lotteries.map(l => 
        l.id === id ? { ...l, status: 'completed', drawDate: new Date().toISOString() } : l
      );
      
      setLotteries(updatedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      // Stocker le gagnant dans localStorage (dans la vraie vie, on utiliserait une table dédiée)
      const winners = JSON.parse(localStorage.getItem('lottery_winners') || '[]');
      winners.push({
        id: winners.length + 1,
        lotteryId: id,
        userId: 1, // Fictif pour la démonstration
        name: winnerName,
        email: winnerEmail,
        drawnAt: new Date().toISOString()
      });
      
      localStorage.setItem('lottery_winners', JSON.stringify(winners));
      
      toast.success(`Tirage effectué! Le gagnant est ${winnerName}`, { position: "bottom-right" });
      
      // Synchroniser avec Supabase si connecté
      const supabaseConnected = localStorage.getItem('supabase_connected') === 'true';
      if (supabaseConnected) {
        syncLocalDataToSupabase('lotteries');
        syncLocalDataToSupabase('lottery_winners');
      }
    } catch (error) {
      console.error('Error drawing winner:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
  };

  // Fonction pour vérifier quelles loteries sont prêtes pour le tirage
  const checkLotteriesReadyForDraw = () => {
    return lotteries.filter(lottery => {
      // Prêt si la loterie est active et a atteint le nombre de participants cible
      const participantsReached = lottery.currentParticipants >= lottery.targetParticipants;
      
      // Ou si la date de fin est passée (si elle existe)
      const datePassed = lottery.endDate ? new Date(lottery.endDate) < new Date() : false;
      
      return lottery.status === 'active' && (participantsReached || datePassed);
    });
  };

  // Fonction pour ajouter/retirer un produit de la liste selectedProducts
  const toggleProduct = (productId: string): void => {
    const currentProducts = form.getValues('linkedProducts') || [];
    
    if (currentProducts.includes(productId)) {
      const updatedProducts = currentProducts.filter(id => id !== productId);
      form.setValue('linkedProducts', updatedProducts);
    } else {
      form.setValue('linkedProducts', [...currentProducts, productId]);
    }
  };

  // Fonction pour sélectionner tous les produits
  const selectAllProducts = (): void => {
    const allProductIds = products.map(product => product.id.toString());
    form.setValue('linkedProducts', allProductIds);
  };

  // Fonction pour désélectionner tous les produits
  const deselectAllProducts = (): void => {
    form.setValue('linkedProducts', []);
  };

  return {
    isCreating,
    selectedLotteryId,
    form,
    isSubmitting,
    handleCreateLottery,
    handleEditLottery,
    handleDeleteLottery,
    onSubmit,
    handleCancel,
    toggleProduct,
    selectAllProducts,
    deselectAllProducts,
    handleDrawWinner,
    checkLotteriesReadyForDraw,
    handleToggleFeatured
  };
};

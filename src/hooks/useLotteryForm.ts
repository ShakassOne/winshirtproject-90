
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { createLottery, updateLottery, deleteLottery } from '@/api/lotteryApi';

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
      // Trouver la loterie à mettre à jour
      const lottery = lotteries.find(l => l.id === id);
      if (!lottery) {
        toast.error(`Loterie avec ID ${id} introuvable`, { position: "bottom-right" });
        return;
      }
      
      // Nouvelle valeur featured inversée
      const newFeaturedValue = !lottery.featured;
      
      // Update in database via API
      const updatedLottery = await updateLottery(id, { featured: newFeaturedValue });
      
      if (updatedLottery) {
        // Update local state only if API call succeeded
        setLotteries(lotteries.map(l => l.id === id ? { ...l, featured: newFeaturedValue } : l));
        
        const featuredStatus = newFeaturedValue ? 'mise en avant' : 'retirée des mises en avant';
        toast.success(`Loterie ${featuredStatus}`, { position: "bottom-right" });
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error("Erreur lors du changement de statut", { position: "bottom-right" });
    }
  };

  // Fonction pour vérifier l'état de connexion à Supabase
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('lotteries').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
  };

  // Fonction pour soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Convertir les IDs de produits en nombres
      const linkedProducts = data.linkedProducts.map((id: string) => parseInt(id, 10));
      
      // Prepare the lottery object
      const lotteryData: Omit<ExtendedLottery, 'id'> = {
        title: data.title,
        description: data.description,
        value: parseFloat(data.value),
        targetParticipants: parseInt(data.targetParticipants, 10),
        currentParticipants: parseInt(data.currentParticipants, 10) || 0,
        status: data.status as "active" | "completed" | "relaunched" | "cancelled",
        image: data.image,
        linkedProducts,
        featured: data.featured,
        endDate: data.endDate || null,
        drawDate: data.drawDate || null
      };

      let updatedLottery: ExtendedLottery | null = null;
      
      if (isCreating) {
        // Create new lottery
        updatedLottery = await createLottery(lotteryData);
      } else if (selectedLotteryId) {
        // Update existing lottery
        updatedLottery = await updateLottery(selectedLotteryId, lotteryData);
      }
      
      if (updatedLottery) {
        // Only update state if API call succeeded
        if (isCreating) {
          // Add new lottery to state
          setLotteries([updatedLottery, ...lotteries]);
        } else {
          // Update existing lottery in state
          setLotteries(lotteries.map(lottery => 
            lottery.id === selectedLotteryId ? updatedLottery! : lottery
          ));
        }
        
        // Reset the form
        form.reset();
        setIsCreating(false);
        setSelectedLotteryId(null);
      }
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
  const handleDeleteLottery = async (id: number): Promise<void> => {
    try {
      // Delete from database via API
      const success = await deleteLottery(id);
      
      if (success) {
        // Si la loterie en cours d'édition est supprimée, réinitialiser le formulaire
        if (id === selectedLotteryId) {
          form.reset();
          setIsCreating(false);
          setSelectedLotteryId(null);
        }

        // Update local state
        setLotteries(lotteries.filter(lottery => lottery.id !== id));
      }
    } catch (error) {
      console.error('Error deleting lottery:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
  };

  // Fonction pour tirer au sort un gagnant
  const handleDrawWinner = async (id: number): Promise<void> => {
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
      const drawDate = new Date().toISOString();
      
      // Update via API
      const updatedLottery = await updateLottery(id, { 
        status: 'completed',
        drawDate
      });
      
      if (updatedLottery) {
        // Add winner to lottery_winners table
        try {
          const { error: winnerError } = await supabase
            .from('lottery_winners')
            .insert({
              lottery_id: id,
              user_id: 1, // Fictif pour la démonstration
              name: winnerName,
              email: winnerEmail,
              drawn_at: drawDate
            });
            
          if (winnerError) {
            console.error("Erreur lors de l'ajout du gagnant dans Supabase:", winnerError);
          }
        } catch (error) {
          console.error("Exception lors des opérations Supabase:", error);
        }
        
        // Update local state
        setLotteries(lotteries.map(l => 
          l.id === id ? updatedLottery : l
        ));
        
        toast.success(`Tirage effectué! Le gagnant est ${winnerName}`, { position: "bottom-right" });
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

  // Function to toggle product selection
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

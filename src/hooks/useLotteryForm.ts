
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Vérifier si nous sommes connectés à Supabase
      const supabaseConnected = await testSupabaseConnection();
      
      if (supabaseConnected) {
        try {
          // Mise à jour directe dans Supabase
          const { error } = await supabase
            .from('lotteries')
            .update({ featured: newFeaturedValue })
            .eq('id', id);
            
          if (error) {
            console.error("Erreur lors de la mise à jour dans Supabase:", error);
            toast.error(`Erreur Supabase: ${error.message}`, { position: "bottom-right" });
            return;
          }
        } catch (error) {
          console.error("Exception lors de la mise à jour dans Supabase:", error);
        }
      }
      
      // Mettre à jour l'état local
      const updatedLotteries = lotteries.map(lottery => 
        lottery.id === id ? { ...lottery, featured: newFeaturedValue } : lottery
      );
      
      setLotteries(updatedLotteries);
      
      // Mettre à jour localStorage dans tous les cas
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      const featuredStatus = newFeaturedValue ? 'mise en avant' : 'retirée des mises en avant';
      toast.success(`Loterie ${featuredStatus}`, { position: "bottom-right" });
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
      
      // Vérifier si nous sommes connectés à Supabase
      const supabaseConnected = await testSupabaseConnection();
      
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
        status: data.status as "active" | "completed" | "relaunched" | "cancelled",
        image: data.image,
        linkedProducts,
        featured: data.featured,
        endDate: data.endDate || null,
        drawDate: data.drawDate || null
      };

      // Si connecté à Supabase, essayer d'abord d'y sauvegarder
      if (supabaseConnected) {
        try {
          if (isCreating) {
            // Création
            const { error } = await supabase
              .from('lotteries')
              .insert({
                id: newLottery.id,
                title: newLottery.title,
                description: newLottery.description,
                value: newLottery.value,
                target_participants: newLottery.targetParticipants,
                current_participants: newLottery.currentParticipants,
                status: newLottery.status,
                image: newLottery.image,
                linked_products: newLottery.linkedProducts,
                featured: newLottery.featured,
                end_date: newLottery.endDate,
                draw_date: newLottery.drawDate
              });
              
            if (error) {
              console.error("Erreur lors de la création dans Supabase:", error);
              toast.error(`Erreur Supabase: ${error.message}`, { position: "bottom-right" });
            } else {
              toast.success(`Loterie "${data.title}" créée et synchronisée avec Supabase`, { position: "bottom-right" });
            }
          } else {
            // Mise à jour
            const { error } = await supabase
              .from('lotteries')
              .update({
                title: newLottery.title,
                description: newLottery.description,
                value: newLottery.value,
                target_participants: newLottery.targetParticipants,
                current_participants: newLottery.currentParticipants,
                status: newLottery.status,
                image: newLottery.image,
                linked_products: newLottery.linkedProducts,
                featured: newLottery.featured,
                end_date: newLottery.endDate,
                draw_date: newLottery.drawDate
              })
              .eq('id', newLottery.id);
              
            if (error) {
              console.error("Erreur lors de la mise à jour dans Supabase:", error);
              toast.error(`Erreur Supabase: ${error.message}`, { position: "bottom-right" });
            } else {
              toast.success(`Loterie "${data.title}" mise à jour et synchronisée avec Supabase`, { position: "bottom-right" });
            }
          }
        } catch (error) {
          console.error("Exception lors de l'opération Supabase:", error);
        }
      }
      
      // Mettre à jour l'état et le localStorage (toujours, même si Supabase est utilisé)
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
      
      setLotteries(updatedLotteries);
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
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
  const handleDeleteLottery = async (id: number): Promise<void> => {
    try {
      // Vérifier si nous sommes connectés à Supabase
      const supabaseConnected = await testSupabaseConnection();
      
      // Si connecté à Supabase, essayer d'abord d'y supprimer
      if (supabaseConnected) {
        try {
          const { error } = await supabase
            .from('lotteries')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error("Erreur lors de la suppression dans Supabase:", error);
            toast.error(`Erreur Supabase: ${error.message}`, { position: "bottom-right" });
          } else {
            toast.success("Loterie supprimée de Supabase avec succès", { position: "bottom-right" });
          }
        } catch (error) {
          console.error("Exception lors de la suppression dans Supabase:", error);
        }
      }
      
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
      
      // Vérifier si nous sommes connectés à Supabase
      const supabaseConnected = await testSupabaseConnection();
      
      // Si connecté à Supabase, mettre à jour le statut de la loterie
      if (supabaseConnected) {
        try {
          const { error: lotteryError } = await supabase
            .from('lotteries')
            .update({ 
              status: 'completed',
              draw_date: drawDate
            })
            .eq('id', id);
            
          if (lotteryError) {
            console.error("Erreur lors de la mise à jour du statut dans Supabase:", lotteryError);
          }
          
          // Ajouter le gagnant dans lottery_winners
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
          } else {
            toast.success(`Tirage enregistré dans Supabase`, { position: "bottom-right" });
          }
        } catch (error) {
          console.error("Exception lors des opérations Supabase:", error);
        }
      }
      
      // Mettre à jour le statut de la loterie dans l'état local
      const updatedLotteries = lotteries.map(l => 
        l.id === id ? { ...l, status: 'completed' as "active" | "completed" | "relaunched" | "cancelled", drawDate } : l
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
        drawnAt: drawDate
      });
      
      localStorage.setItem('lottery_winners', JSON.stringify(winners));
      
      toast.success(`Tirage effectué! Le gagnant est ${winnerName}`, { position: "bottom-right" });
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

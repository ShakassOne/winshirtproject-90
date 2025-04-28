
import { useState } from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { useForm } from 'react-hook-form';
import { ExtendedProduct } from '@/types/product';
import { createLottery, updateLottery, deleteLottery } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';
import { Participant } from '@/types/lottery';
import { checkSupabaseConnection } from '@/lib/supabase';

export const useLotteryForm = (
  lotteries: ExtendedLottery[],
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: ExtendedProduct[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form initialization
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      image: '',
      value: 0,
      status: 'active',
      featured: false,
      targetParticipants: 10,
      currentParticipants: 0,
      drawDate: '',
      endDate: '',
      linkedProducts: [] as string[],
    }
  });

  // Handler for creating a new lottery
  const handleCreateLottery = () => {
    console.log("Creating new lottery");
    setIsCreating(true);
    setSelectedLotteryId(null);
    form.reset();
  };

  // Handler for editing an existing lottery
  const handleEditLottery = (lotteryId: number) => {
    console.log("Editing lottery:", lotteryId);
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (lottery) {
      setIsCreating(false);
      setSelectedLotteryId(lotteryId);
      form.reset({
        title: lottery.title,
        description: lottery.description,
        image: lottery.image || '',
        value: lottery.value,
        status: lottery.status,
        featured: lottery.featured || false,
        targetParticipants: lottery.targetParticipants,
        currentParticipants: lottery.currentParticipants,
        drawDate: lottery.drawDate || '',
        endDate: lottery.endDate || '',
        linkedProducts: lottery.linkedProducts?.map(String) || [],
      });
    }
  };

  // Handler for deleting a lottery
  const handleDeleteLottery = async (lotteryId: number) => {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      toast.error("Impossible de supprimer la loterie - Mode hors-ligne", { position: "bottom-right" });
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette loterie ?')) {
      console.log("Deleting lottery:", lotteryId);
      const success = await deleteLottery(lotteryId);
      if (success) {
        setLotteries(prev => prev.filter(l => l.id !== lotteryId));
        if (selectedLotteryId === lotteryId) {
          setSelectedLotteryId(null);
          setIsCreating(false);
          form.reset();
        }
      }
    }
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting lottery form:", data);
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error("Impossible de sauvegarder - Mode hors-ligne", { position: "bottom-right" });
        return;
      }

      const lotteryData = {
        ...data,
        linkedProducts: data.linkedProducts.map(Number),
        value: Number(data.value),
        targetParticipants: Number(data.targetParticipants),
        currentParticipants: Number(data.currentParticipants),
      };

      if (isCreating) {
        const newLottery = await createLottery(lotteryData);
        if (newLottery) {
          setLotteries(prev => [...prev, newLottery]);
          setIsCreating(false);
          form.reset();
        }
      } else if (selectedLotteryId) {
        const updatedLottery = await updateLottery(selectedLotteryId, lotteryData);
        if (updatedLottery) {
          setLotteries(prev => prev.map(l => l.id === selectedLotteryId ? updatedLottery : l));
          setSelectedLotteryId(null);
          form.reset();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Erreur lors de la sauvegarde", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel form handler
  const handleCancel = () => {
    setIsCreating(false);
    setSelectedLotteryId(null);
    form.reset();
  };

  // Product selection handlers
  const toggleProduct = (productId: string) => {
    const currentProducts = form.getValues('linkedProducts') || [];
    const newProducts = currentProducts.includes(productId)
      ? currentProducts.filter(id => id !== productId)
      : [...currentProducts, productId];
    form.setValue('linkedProducts', newProducts);
  };

  const selectAllProducts = () => {
    const allProductIds = products.map(p => p.id.toString());
    form.setValue('linkedProducts', allProductIds);
  };

  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
  };

  // Draw winner handler
  const handleDrawWinner = async (lotteryId: number, winner: Participant) => {
    console.log("Drawing winner for lottery:", lotteryId, "Winner:", winner);
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (lottery) {
      const updatedLottery = await updateLottery(lotteryId, {
        status: 'completed',
      });
      if (updatedLottery) {
        setLotteries(prev => prev.map(l => l.id === lotteryId ? updatedLottery : l));
      }
    }
  };

  // Check lotteries ready for draw
  const checkLotteriesReadyForDraw = () => {
    return lotteries.filter(lottery => {
      const targetReached = lottery.currentParticipants >= lottery.targetParticipants;
      const endDatePassed = lottery.endDate ? new Date(lottery.endDate) <= new Date() : false;
      return (targetReached || endDatePassed) && lottery.status === 'active';
    });
  };

  // Toggle featured status
  const handleToggleFeatured = async (lotteryId: number, featured: boolean) => {
    console.log("Toggling featured status:", lotteryId, featured);
    const updatedLottery = await updateLottery(lotteryId, { featured });
    if (updatedLottery) {
      setLotteries(prev => prev.map(l => l.id === lotteryId ? updatedLottery : l));
    }
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

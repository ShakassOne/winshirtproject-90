
import { supabase } from "@/integrations/supabase/client";
import { ExtendedLottery, Participant } from "@/types/lottery";
import { toast } from "@/lib/toast";
import { useState, useEffect, useCallback } from "react";
import { fetchLotteries as apiFetchLotteries, createLottery as apiCreateLottery, updateLottery as apiUpdateLottery, deleteLottery as apiDeleteLottery } from "@/api/lotteryApi";

// Export the API functions so they can be used directly
export const createLottery = apiCreateLottery;
export const updateLottery = apiUpdateLottery;
export const deleteLottery = apiDeleteLottery;

// Standalone function to get lotteries (not hook-based)
export const getLotteries = async (activeOnly = false): Promise<ExtendedLottery[]> => {
  try {
    console.log("Getting lotteries from Supabase, activeOnly:", activeOnly);
    const fetchedLotteries = await apiFetchLotteries();
    
    // Filter by active status if needed
    const filteredLotteries = activeOnly 
      ? fetchedLotteries.filter(lottery => lottery.status === 'active')
      : fetchedLotteries;
    
    console.log(`Retrieved ${filteredLotteries.length} lotteries from Supabase`);
    return filteredLotteries;
  } catch (err) {
    console.error("Error fetching lotteries:", err);
    throw err instanceof Error ? err : new Error(String(err));
  }
};

// Add drawLotteryWinner function
export const drawLotteryWinner = async (lotteryId: number): Promise<Participant | null> => {
  try {
    // For now, simulate a winner draw by randomly selecting from participants
    const lottery = await apiFetchLotteries()
      .then(lotteries => lotteries.find(l => l.id === lotteryId));
    
    if (!lottery || !lottery.participants || lottery.participants.length === 0) {
      toast.error("No participants found for this lottery");
      return null;
    }
    
    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    const winner = lottery.participants[randomIndex];
    
    // Mark lottery as completed
    await apiUpdateLottery(lotteryId, { status: 'completed' });
    
    return winner;
  } catch (error) {
    console.error('Error drawing winner:', error);
    toast.error(`Error drawing winner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Hook for lottery management
 */
export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch lotteries from API
  const getLotteries = useCallback(async (activeOnly = false) => {
    setLoading(true);
    try {
      console.log("Getting lotteries from Supabase, activeOnly:", activeOnly);
      const fetchedLotteries = await fetchLotteries();
      
      // Filter by active status if needed
      const filteredLotteries = activeOnly 
        ? fetchedLotteries.filter(lottery => lottery.status === 'active')
        : fetchedLotteries;
      
      console.log(`Retrieved ${filteredLotteries.length} lotteries from Supabase`);
      setLotteries(filteredLotteries);
      return filteredLotteries;
    } catch (err) {
      console.error("Error fetching lotteries:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    getLotteries();
  }, [getLotteries]);

  return { 
    lotteries, 
    loading, 
    error, 
    getLotteries
  };
};

/**
 * Hook for lottery form management
 */
export const useLotteryForm = (
  lotteries: ExtendedLottery[], 
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: any[] = []
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    id: null as number | null,
    title: '',
    description: '',
    value: 0,
    targetParticipants: 10,
    status: 'active' as 'active' | 'completed' | 'relaunched' | 'cancelled',
    image: '',
    linkedProducts: [] as number[],
    endDate: '',
    featured: false
  });

  // Reset form for new lottery
  const handleCreateLottery = () => {
    setIsCreating(true);
    setSelectedLotteryId(null);
    setForm({
      id: null,
      title: '',
      description: '',
      value: 0,
      targetParticipants: 10,
      status: 'active',
      image: '',
      linkedProducts: [],
      endDate: '',
      featured: false
    });
  };

  // Load lottery data for editing
  const handleEditLottery = (lotteryId: number) => {
    const lotteryToEdit = lotteries.find(lottery => lottery.id === lotteryId);
    if (lotteryToEdit) {
      setIsCreating(false);
      setSelectedLotteryId(lotteryId);
      setForm({
        id: lotteryToEdit.id,
        title: lotteryToEdit.title || '',
        description: lotteryToEdit.description || '',
        value: lotteryToEdit.value || 0,
        targetParticipants: lotteryToEdit.targetParticipants || 10,
        status: lotteryToEdit.status as 'active' | 'completed' | 'relaunched' | 'cancelled',
        image: lotteryToEdit.image || '',
        linkedProducts: lotteryToEdit.linkedProducts || [],
        endDate: lotteryToEdit.endDate || '',
        featured: lotteryToEdit.featured || false
      });
    }
  };

  // Delete lottery
  const handleDeleteLottery = async (lotteryId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette loterie ?')) {
      try {
        await deleteLottery(lotteryId);
        // Update local state after successful deletion
        setLotteries(prevLotteries => prevLotteries.filter(lottery => lottery.id !== lotteryId));
        // Reset form if the deleted lottery was selected
        if (selectedLotteryId === lotteryId) {
          handleCancel();
        }
      } catch (error) {
        console.error('Error deleting lottery:', error);
        toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  // Handle form submission
  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isCreating) {
        // Create new lottery
        const newLottery = await createLottery({
          title: form.title,
          description: form.description,
          value: form.value,
          targetParticipants: form.targetParticipants,
          status: form.status,
          image: form.image,
          linkedProducts: form.linkedProducts,
          endDate: form.endDate,
          featured: form.featured,
          participants: [] // Add empty participants array to fix the type error
        });
        
        if (newLottery) {
          // Update local state with new lottery
          setLotteries(prevLotteries => [...prevLotteries, newLottery]);
          handleCancel(); // Reset form after creation
        }
      } else if (selectedLotteryId) {
        // Update existing lottery
        const updatedLottery = await updateLottery(selectedLotteryId, {
          title: form.title,
          description: form.description,
          value: form.value,
          targetParticipants: form.targetParticipants,
          status: form.status,
          image: form.image,
          linkedProducts: form.linkedProducts,
          endDate: form.endDate,
          featured: form.featured
        });
        
        if (updatedLottery) {
          // Update local state with updated lottery
          setLotteries(prevLotteries => prevLotteries.map(lottery => 
            lottery.id === selectedLotteryId ? updatedLottery : lottery
          ));
          handleCancel(); // Reset form after update
        }
      }
    } catch (error) {
      console.error('Error submitting lottery form:', error);
      toast.error(`Erreur lors de la soumission: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleCancel = () => {
    setIsCreating(false);
    setSelectedLotteryId(null);
    setForm({
      id: null,
      title: '',
      description: '',
      value: 0,
      targetParticipants: 10,
      status: 'active',
      image: '',
      linkedProducts: [],
      endDate: '',
      featured: false
    });
  };

  // Toggle product selection
  const toggleProduct = (productId: number) => {
    setForm(prevForm => {
      const linkedProducts = [...prevForm.linkedProducts];
      const index = linkedProducts.indexOf(productId);
      
      if (index !== -1) {
        linkedProducts.splice(index, 1);
      } else {
        linkedProducts.push(productId);
      }
      
      return {
        ...prevForm,
        linkedProducts
      };
    });
  };

  // Select all products
  const selectAllProducts = () => {
    if (products.length > 0) {
      setForm(prevForm => ({
        ...prevForm,
        linkedProducts: products.map(product => product.id)
      }));
    }
  };

  // Deselect all products
  const deselectAllProducts = () => {
    setForm(prevForm => ({
      ...prevForm,
      linkedProducts: []
    }));
  };

  // Handle drawing a winner for a lottery
  const handleDrawWinner = async (lotteryId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir effectuer le tirage au sort pour cette loterie ?')) {
      try {
        // TODO: Implement winner drawing logic
        
        // For now, simulate a winner draw by marking the lottery as completed
        const updatedLottery = await updateLottery(lotteryId, { status: 'completed' });
        
        if (updatedLottery) {
          // Update local state with updated lottery
          setLotteries(prevLotteries => prevLotteries.map(lottery => 
            lottery.id === lotteryId ? updatedLottery : lottery
          ));
          
          toast.success('Tirage au sort effectué avec succès!');
        }
      } catch (error) {
        console.error('Error drawing winner:', error);
        toast.error(`Erreur lors du tirage au sort: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  // Check if lotteries are ready for drawing
  const checkLotteriesReadyForDraw = () => {
    return lotteries.filter(lottery => {
      // Lottery is ready if it has reached the target number of participants
      const targetReached = lottery.currentParticipants >= lottery.targetParticipants;
      
      // Or if it has passed its end date
      const endDatePassed = lottery.endDate && new Date(lottery.endDate) < new Date();
      
      // And it must be active
      const isActive = lottery.status === 'active';
      
      return isActive && (targetReached || endDatePassed);
    });
  };

  // Toggle featured status
  const handleToggleFeatured = async (lotteryId: number) => {
    const lotteryToUpdate = lotteries.find(lottery => lottery.id === lotteryId);
    if (lotteryToUpdate) {
      try {
        const updatedLottery = await updateLottery(lotteryId, { 
          featured: !lotteryToUpdate.featured 
        });
        
        if (updatedLottery) {
          // Update local state with updated lottery
          setLotteries(prevLotteries => prevLotteries.map(lottery => 
            lottery.id === lotteryId ? updatedLottery : lottery
          ));
          
          toast.success(`Loterie ${updatedLottery.featured ? 'ajoutée aux' : 'retirée des'} favoris`);
        }
      } catch (error) {
        console.error('Error toggling featured status:', error);
        toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setForm(prevForm => ({
      ...prevForm,
      [field]: value
    }));
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
    handleChange,
    toggleProduct,
    selectAllProducts,
    deselectAllProducts,
    handleDrawWinner,
    checkLotteriesReadyForDraw,
    handleToggleFeatured
  };
};

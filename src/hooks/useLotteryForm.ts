
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { ExtendedProduct } from '@/types/product';

export const useLotteryForm = (
  lotteries: ExtendedLottery[],
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: ExtendedProduct[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [searchProductTerm, setSearchProductTerm] = useState('');
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      value: '',
      targetParticipants: '',
      status: 'active',
      linkedProducts: [] as string[],
      image: '',
      endDate: ''
    }
  });
  
  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      value: '',
      targetParticipants: '',
      status: 'active',
      linkedProducts: [],
      image: '',
      endDate: ''
    });
  };
  
  const handleCreateLottery = () => {
    setIsCreating(true);
    setSelectedLotteryId(null);
    resetForm();
    setSearchProductTerm('');
  };
  
  const handleEditLottery = (lotteryId: number) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery) return;
    
    setIsCreating(false);
    setSelectedLotteryId(lotteryId);
    setSearchProductTerm('');
    
    form.reset({
      title: lottery.title,
      description: lottery.description,
      value: lottery.value.toString(),
      targetParticipants: lottery.targetParticipants.toString(),
      status: lottery.status,
      linkedProducts: lottery.linkedProducts?.map(id => id.toString()) || [],
      image: lottery.image,
      endDate: lottery.endDate || ''
    });
  };
  
  const handleDeleteLottery = (lotteryId: number) => {
    // Update associated products before deleting
    try {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        
        // Remove the lottery from linkedLotteries of all products
        const updatedProducts = parsedProducts.map((product: any) => {
          if (product.linkedLotteries && Array.isArray(product.linkedLotteries)) {
            product.linkedLotteries = product.linkedLotteries.filter((id: number) => id !== lotteryId);
          }
          return product;
        });
        
        // Save updated products
        localStorage.setItem('products', JSON.stringify(updatedProducts));
      }
    } catch (error) {
      console.error("Error updating associated products:", error);
    }
    
    setLotteries(prevLotteries => {
      const updatedLotteries = prevLotteries.filter(l => l.id !== lotteryId);
      // Save to both localStorage and sessionStorage for compatibility
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      sessionStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      return updatedLotteries;
    });
    
    toast.success("Loterie supprimée avec succès");
    
    if (selectedLotteryId === lotteryId) {
      setSelectedLotteryId(null);
      resetForm();
    }
  };
  
  const onSubmit = (data: any) => {
    // Create a new ID for new lotteries
    const newId = isCreating ? Math.max(0, ...lotteries.map(l => l.id)) + 1 : selectedLotteryId!;
    
    // Find existing lottery to preserve unmodified data
    const existingLottery = lotteries.find(l => l.id === selectedLotteryId);
    
    const newLottery: ExtendedLottery = {
      id: newId,
      title: data.title,
      description: data.description,
      value: parseFloat(data.value),
      targetParticipants: parseInt(data.targetParticipants),
      currentParticipants: isCreating ? 0 : (existingLottery?.currentParticipants || 0),
      status: data.status,
      linkedProducts: data.linkedProducts.map(Number),
      image: data.image || 'https://placehold.co/600x400/png',
      participants: isCreating ? [] : (existingLottery?.participants || []),
      winner: isCreating ? null : (existingLottery?.winner || null),
      drawDate: isCreating ? null : (existingLottery?.drawDate || null),
      endDate: data.endDate || null
    };
    
    // Update associated products
    const linkedProductIds = data.linkedProducts.map(Number);
    
    try {
      // Load current products from localStorage
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        let parsedProducts = JSON.parse(savedProducts);
        
        // Update products: add the lottery to linkedLotteries of selected products
        // and remove the lottery from linkedLotteries of unselected products
        const updatedProducts = parsedProducts.map((product: any) => {
          // Ensure linkedLotteries is an array
          if (!product.linkedLotteries) {
            product.linkedLotteries = [];
          }
          
          // If the product is selected and doesn't already contain the lottery, add it
          if (linkedProductIds.includes(product.id)) {
            if (!product.linkedLotteries.includes(newId)) {
              product.linkedLotteries.push(newId);
            }
          } else {
            // If the product is not selected, remove the lottery if it exists
            product.linkedLotteries = product.linkedLotteries.filter((id: number) => id !== newId);
          }
          
          return product;
        });
        
        // Save updated products
        localStorage.setItem('products', JSON.stringify(updatedProducts));
      }
    } catch (error) {
      console.error("Error updating associated products:", error);
    }
    
    if (isCreating) {
      setLotteries(prev => {
        const updatedLotteries = [...prev, newLottery];
        // Save to both localStorage AND sessionStorage for compatibility
        localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        sessionStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        return updatedLotteries;
      });
      toast.success("Loterie créée avec succès");
    } else {
      setLotteries(prev => {
        const updatedLotteries = prev.map(l => l.id === selectedLotteryId ? newLottery : l);
        // Save to both localStorage AND sessionStorage for compatibility
        localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        sessionStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
        return updatedLotteries;
      });
      toast.success("Loterie mise à jour avec succès");
    }
    
    resetForm();
    setIsCreating(false);
    setSelectedLotteryId(null);
  };
  
  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setSelectedLotteryId(null);
    setSearchProductTerm('');
  };
  
  const toggleProduct = (productId: string) => {
    const currentProducts = form.getValues('linkedProducts') || [];
    
    if (currentProducts.includes(productId)) {
      form.setValue('linkedProducts', currentProducts.filter(id => id !== productId));
    } else {
      form.setValue('linkedProducts', [...currentProducts, productId]);
    }
    
    // Force rerender by updating form
    form.trigger('linkedProducts');
  };
  
  const selectAllProducts = () => {
    const allProductIds = products.map(product => product.id.toString());
    form.setValue('linkedProducts', allProductIds);
    form.trigger('linkedProducts');
  };
  
  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
    form.trigger('linkedProducts');
  };

  const handleDrawWinner = (lotteryId: number, winner: Participant) => {
    setLotteries(prevLotteries => {
      const updatedLotteries = prevLotteries.map(lottery => {
        if (lottery.id === lotteryId) {
          return {
            ...lottery,
            winner: winner,
            drawDate: new Date().toISOString(),
            status: 'completed'
          };
        }
        return lottery;
      });
      
      // Force update by storing in both localStorage AND sessionStorage
      localStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      sessionStorage.setItem('lotteries', JSON.stringify(updatedLotteries));
      
      return updatedLotteries;
    });
  };

  // Check for lotteries in localStorage on component mount
  useEffect(() => {
    const loadLotteries = () => {
      // Try localStorage first
      const localStorageLotteries = localStorage.getItem('lotteries');
      if (localStorageLotteries) {
        try {
          const parsedLotteries = JSON.parse(localStorageLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            return;
          }
        } catch (error) {
          console.error("Error loading lotteries from localStorage:", error);
        }
      }
      
      // Then try sessionStorage as fallback
      const sessionStorageLotteries = sessionStorage.getItem('lotteries');
      if (sessionStorageLotteries) {
        try {
          const parsedLotteries = JSON.parse(sessionStorageLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Sync with localStorage
            localStorage.setItem('lotteries', sessionStorageLotteries);
          }
        } catch (error) {
          console.error("Error loading lotteries from sessionStorage:", error);
        }
      }
    };
    
    loadLotteries();
  }, []);

  // Function to automatically check if lotteries can be drawn
  const checkLotteriesReadyForDraw = () => {
    const now = new Date();
    const lotteriesReadyForDraw = lotteries.filter(
      lottery => 
        lottery.status === 'active' && 
        ((lottery.currentParticipants >= lottery.targetParticipants) || 
        (lottery.endDate && new Date(lottery.endDate) <= now))
    );
    
    return lotteriesReadyForDraw;
  };

  return {
    isCreating,
    selectedLotteryId,
    searchProductTerm,
    setSearchProductTerm,
    form,
    handleCreateLottery,
    handleEditLottery,
    handleDeleteLottery,
    onSubmit,
    handleCancel,
    toggleProduct,
    selectAllProducts,
    deselectAllProducts,
    handleDrawWinner,
    checkLotteriesReadyForDraw
  };
};

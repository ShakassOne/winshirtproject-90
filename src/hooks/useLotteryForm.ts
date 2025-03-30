import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { Product } from '@/components/ProductCard';

export const useLotteryForm = (
  lotteries: ExtendedLottery[],
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: Product[]
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
    setLotteries(prevLotteries => prevLotteries.filter(l => l.id !== lotteryId));
    toast.success("Loterie supprimée avec succès");
    
    if (selectedLotteryId === lotteryId) {
      setSelectedLotteryId(null);
      resetForm();
    }
  };
  
  const onSubmit = (data: any) => {
    const newLottery: ExtendedLottery = {
      id: isCreating ? Math.max(...lotteries.map(l => l.id)) + 1 : selectedLotteryId!,
      title: data.title,
      description: data.description,
      value: parseFloat(data.value),
      targetParticipants: parseInt(data.targetParticipants),
      currentParticipants: isCreating ? 0 : lotteries.find(l => l.id === selectedLotteryId)?.currentParticipants || 0,
      status: data.status,
      linkedProducts: data.linkedProducts.map(Number),
      image: data.image || 'https://placehold.co/600x400/png',
      participants: isCreating ? [] : lotteries.find(l => l.id === selectedLotteryId)?.participants || [],
      winner: isCreating ? null : lotteries.find(l => l.id === selectedLotteryId)?.winner || null,
      drawDate: isCreating ? null : lotteries.find(l => l.id === selectedLotteryId)?.drawDate || null,
      endDate: data.endDate || null
    };
    
    if (isCreating) {
      setLotteries(prev => [...prev, newLottery]);
      toast.success("Loterie créée avec succès");
    } else {
      setLotteries(prev => prev.map(l => l.id === selectedLotteryId ? newLottery : l));
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
    const currentProducts = form.getValues('linkedProducts');
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
    setLotteries(prevLotteries => 
      prevLotteries.map(lottery => {
        if (lottery.id === lotteryId) {
          return {
            ...lottery,
            winner: winner,
            drawDate: new Date().toISOString(),
            status: 'completed'
          };
        }
        return lottery;
      })
    );
  };

  // Fonction pour vérifier automatiquement si des loteries peuvent être tirées au sort
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

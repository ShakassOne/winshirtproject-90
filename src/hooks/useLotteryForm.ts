import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedLottery, Participant } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit comporter au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères.",
  }),
  value: z.number().min(1, {
    message: "La valeur doit être supérieure à 0.",
  }),
  targetParticipants: z.number().min(2, {
    message: "Le nombre de participants doit être supérieur à 1.",
  }),
  status: z.string(),
  image: z.string().url({
    message: "Veuillez entrer une URL valide.",
  }),
  endDate: z.string().optional(),
  linkedProducts: z.array(z.string()).optional(),
});

export const useLotteryForm = (
  lotteries: ExtendedLottery[],
  setLotteries: React.Dispatch<React.SetStateAction<ExtendedLottery[]>>,
  products: ExtendedProduct[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      value: 1,
      targetParticipants: 5,
      status: 'active',
      image: "",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 7 days from now
      linkedProducts: [],
    },
  });

  const handleCreateLottery = () => {
    setIsCreating(true);
    setSelectedLotteryId(null);
    form.reset();
  };

  const handleEditLottery = (lotteryId: number) => {
    const lotteryToEdit = lotteries.find(lottery => lottery.id === lotteryId);
    if (lotteryToEdit) {
      setSelectedLotteryId(lotteryId);
      setIsCreating(false);
      form.reset({
        title: lotteryToEdit.title,
        description: lotteryToEdit.description,
        value: lotteryToEdit.value,
        targetParticipants: lotteryToEdit.targetParticipants,
        status: lotteryToEdit.status,
        image: lotteryToEdit.image,
        endDate: lotteryToEdit.endDate,
        linkedProducts: lotteryToEdit.linkedProducts?.map(String) || [],
      });
    }
  };

  const handleDeleteLottery = (lotteryId: number) => {
    setLotteries(prev => prev.filter(lottery => lottery.id !== lotteryId));
    setSelectedLotteryId(null);
    toast.success("Loterie supprimée avec succès !");
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isCreating) {
      const newLottery: ExtendedLottery = {
        id: Date.now(),
        ...data,
        value: Number(data.value),
        targetParticipants: Number(data.targetParticipants),
        currentParticipants: 0,
        linkedProducts: data.linkedProducts?.map(Number) || [],
        participants: [],
        winner: null,
        drawDate: null
      };
      setLotteries(prev => [...prev, newLottery]);
      toast.success("Loterie créée avec succès !");
    } else if (selectedLotteryId) {
      setLotteries(prev =>
        prev.map(lottery =>
          lottery.id === selectedLotteryId
            ? {
                ...lottery,
                ...data,
                value: Number(data.value),
                targetParticipants: Number(data.targetParticipants),
                linkedProducts: data.linkedProducts?.map(Number) || [],
              }
            : lottery
        )
      );
      toast.success("Loterie modifiée avec succès !");
    }
    setIsCreating(false);
    setSelectedLotteryId(null);
    form.reset();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedLotteryId(null);
    form.reset();
  };

  const toggleProduct = (productId: string) => {
    const currentProducts = form.getValues('linkedProducts') || [];
    const productIdString = String(productId);
  
    if (currentProducts.includes(productIdString)) {
      form.setValue(
        'linkedProducts',
        currentProducts.filter((id) => id !== productIdString)
      );
    } else {
      form.setValue('linkedProducts', [...currentProducts, productIdString]);
    }
  };
  
  const selectAllProducts = () => {
    const allProductIds = products.map((product) => String(product.id));
    form.setValue('linkedProducts', allProductIds);
  };
  
  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
  };

  const handleDrawWinner = (lotteryId: number, winner: Participant) => {
    setLotteries(prev => 
      prev.map(lottery => 
        lottery.id === lotteryId 
          ? { 
              ...lottery, 
              winner: winner,
              drawDate: new Date().toISOString(),
              status: 'completed' // Changer le statut en "completed"
            } 
          : lottery
      )
    );
  };

  const checkLotteriesReadyForDraw = useCallback(() => {
    const readyLotteries = lotteries.filter(lottery =>
      lottery.status === 'active' &&
      (lottery.currentParticipants >= lottery.targetParticipants ||
        (lottery.endDate && new Date(lottery.endDate) <= new Date()))
    );
    return readyLotteries;
  }, [lotteries]);

  return {
    isCreating,
    selectedLotteryId,
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


import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedLottery, Participant } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { 
  createLottery, 
  updateLottery, 
  deleteLottery, 
  toggleLotteryFeatured, 
  updateLotteryWinner 
} from '@/api/lotteryApi';

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
  status: z.enum(["active", "completed", "relaunched", "cancelled"]),
  image: z.string().url({
    message: "Veuillez entrer une URL valide.",
  }),
  endDate: z.string().optional(),
  linkedProducts: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
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
      status: 'active' as const,
      image: "",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 7 days from now
      linkedProducts: [],
      featured: false,
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
        endDate: lotteryToEdit.endDate || undefined,
        linkedProducts: lotteryToEdit.linkedProducts?.map(String) || [],
        featured: lotteryToEdit.featured || false,
      });
      
      // Debug: vérifier les données chargées dans le formulaire
      console.log("Données chargées pour édition:", {
        id: lotteryId,
        image: lotteryToEdit.image,
        formValue: form.getValues()
      });
    }
  };

  const handleDeleteLottery = async (lotteryId: number) => {
    const success = await deleteLottery(lotteryId);
    
    if (success) {
      setLotteries(prev => prev.filter(lottery => lottery.id !== lotteryId));
      setSelectedLotteryId(null);
      toast.success("Loterie supprimée avec succès !");
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Données du formulaire soumises:", data); // Debug: afficher les données envoyées
    
    if (isCreating) {
      // Créer une nouvelle loterie
      const newLotteryData: Omit<ExtendedLottery, 'id'> = {
        title: data.title,
        description: data.description,
        value: Number(data.value),
        targetParticipants: Number(data.targetParticipants),
        currentParticipants: 0,
        status: data.status,
        image: data.image,
        linkedProducts: data.linkedProducts?.map(Number) || [],
        participants: [],
        winner: null,
        drawDate: null,
        endDate: data.endDate,
        featured: data.featured || false,
      };
      
      const createdLottery = await createLottery(newLotteryData);
      
      if (createdLottery) {
        setLotteries(prev => [...prev, createdLottery]);
        toast.success("Loterie créée avec succès !");
      }
    } else if (selectedLotteryId) {
      // Trouver la loterie existante pour conserver ses propriétés non modifiables par le formulaire
      const existingLottery = lotteries.find(l => l.id === selectedLotteryId);
      
      if (existingLottery) {
        // Préparer les données pour la mise à jour
        const updatedLotteryData: ExtendedLottery = {
          ...existingLottery,
          title: data.title,
          description: data.description,
          value: Number(data.value),
          targetParticipants: Number(data.targetParticipants),
          status: data.status,
          image: data.image,
          endDate: data.endDate,
          linkedProducts: data.linkedProducts?.map(Number) || [],
          featured: data.featured || false,
        };
        
        const updatedLottery = await updateLottery(updatedLotteryData);
        
        if (updatedLottery) {
          setLotteries(prev => prev.map(lottery => 
            lottery.id === selectedLotteryId ? updatedLottery : lottery
          ));
          toast.success("Loterie modifiée avec succès !");
        }
      }
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

  const handleDrawWinner = async (lotteryId: number, winner: Participant) => {
    const success = await updateLotteryWinner(lotteryId, winner);
    
    if (success) {
      const updatedLotteries = lotteries.map(lottery => 
        lottery.id === lotteryId 
          ? { 
              ...lottery, 
              winner: winner,
              drawDate: new Date().toISOString(),
              status: 'completed' as const
            } 
          : lottery
      );
      
      setLotteries(updatedLotteries);
      toast.success(`Le gagnant de la loterie est ${winner.name} !`);
    }
  };

  const checkLotteriesReadyForDraw = useCallback(() => {
    const readyLotteries = lotteries.filter(lottery =>
      lottery.status === 'active' &&
      (lottery.currentParticipants >= lottery.targetParticipants ||
        (lottery.endDate && new Date(lottery.endDate) <= new Date()))
    );
    return readyLotteries;
  }, [lotteries]);

  const handleToggleFeatured = async (lotteryId: number, featured: boolean) => {
    const success = await toggleLotteryFeatured(lotteryId, featured);
    
    if (success) {
      const updatedLotteries = lotteries.map(lottery => 
        lottery.id === lotteryId 
          ? { ...lottery, featured } 
          : lottery
      );
      
      setLotteries(updatedLotteries);
      
      toast.success(featured 
        ? "Loterie ajoutée aux vedettes !" 
        : "Loterie retirée des vedettes !"
      );
    }
  };

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
    checkLotteriesReadyForDraw,
    handleToggleFeatured
  };
};

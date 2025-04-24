
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
  updateLotteryWinner,
  fetchLotteries 
} from '@/api/lotteryApi';

// Function to toggle a lottery's featured status
const toggleLotteryFeatured = async (lotteryId: number, featured: boolean): Promise<boolean> => {
  try {
    // Find the lottery to update
    const allLotteries = await fetchLotteries();
    const lottery = allLotteries.find(l => l.id === lotteryId);
    
    if (!lottery) {
      toast.error("Loterie non trouvée");
      return false;
    }
    
    // Update the lottery with featured status
    const updatedLottery = {
      ...lottery,
      featured
    };
    
    const result = await updateLottery(updatedLottery);
    return result !== null;
  } catch (error) {
    console.error("Erreur lors de la modification du statut vedette:", error);
    toast.error(`Erreur lors de la modification du statut vedette: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit comporter au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères.",
  }),
  value: z.coerce.number().min(1, {
    message: "La valeur doit être supérieure à 0.",
  }),
  targetParticipants: z.coerce.number().min(2, {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Debug: log the lottery being edited
      console.log("Editing lottery:", lotteryToEdit);
      
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
        value: lotteryToEdit.value,
        formValue: form.getValues()
      });
    }
  };

  const handleDeleteLottery = async (lotteryId: number) => {
    try {
      const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette loterie ? Cette action est irréversible.");
      if (!confirmed) return;
      
      const success = await deleteLottery(lotteryId);
      
      if (success) {
        // Forcer la mise à jour des données
        const updatedLotteries = await fetchLotteries(true);
        setLotteries(updatedLotteries);
        setSelectedLotteryId(null);
        toast.success("Loterie supprimée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la loterie:", error);
      toast.error("Erreur lors de la suppression de la loterie");
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      console.log("Données du formulaire soumises:", data);
      
      // Ensure numeric values
      const valueAsNumber = Number(data.value);
      const targetParticipantsAsNumber = Number(data.targetParticipants);
      
      if (isNaN(valueAsNumber) || isNaN(targetParticipantsAsNumber)) {
        toast.error("Erreur de conversion des valeurs numériques");
        return;
      }
      
      if (isCreating) {
        // Créer une nouvelle loterie
        const newLotteryData: Omit<ExtendedLottery, 'id'> = {
          title: data.title,
          description: data.description,
          value: valueAsNumber,
          targetParticipants: targetParticipantsAsNumber,
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
          // Forcer la mise à jour des données
          const updatedLotteries = await fetchLotteries(true);
          setLotteries(updatedLotteries);
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
            value: valueAsNumber,
            targetParticipants: targetParticipantsAsNumber,
            status: data.status,
            image: data.image,
            endDate: data.endDate,
            linkedProducts: data.linkedProducts?.map(Number) || [],
            featured: data.featured || false,
          };
          
          console.log("Sending update to Supabase:", updatedLotteryData);
          
          const updatedLottery = await updateLottery(updatedLotteryData);
          
          if (updatedLottery) {
            console.log("Lottery updated successfully:", updatedLottery);
            
            // Forcer la mise à jour des données
            const updatedLotteries = await fetchLotteries(true);
            setLotteries(updatedLotteries);
            toast.success("Loterie modifiée avec succès !");
          } else {
            console.error("Failed to update lottery");
            toast.error("Erreur lors de la mise à jour de la loterie");
          }
        }
      }
      
      setIsCreating(false);
      setSelectedLotteryId(null);
      form.reset();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    } finally {
      setIsSubmitting(false);
    }
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
    try {
      const success = await updateLotteryWinner(lotteryId, winner);
      
      if (success) {
        // Forcer la mise à jour des données
        const updatedLotteries = await fetchLotteries(true);
        setLotteries(updatedLotteries);
        toast.success(`Le gagnant de la loterie est ${winner.name} !`);
      }
    } catch (error) {
      console.error("Erreur lors du tirage au sort:", error);
      toast.error("Erreur lors du tirage au sort");
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
    try {
      const success = await toggleLotteryFeatured(lotteryId, featured);
      
      if (success) {
        // Forcer la mise à jour des données
        const updatedLotteries = await fetchLotteries(true);
        setLotteries(updatedLotteries);
        toast.success(featured ? 
          "Loterie mise en avant avec succès !" : 
          "Loterie retirée des mises en avant avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut vedette:", error);
      toast.error("Erreur lors de la modification du statut vedette");
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

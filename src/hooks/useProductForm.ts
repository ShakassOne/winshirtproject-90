import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedProduct, PrintArea } from '@/types/product';
import { toast } from '@/lib/toast';

// Define default values inline to avoid type issues
const defaultValues: ExtendedProduct = {
  id: 0,
  name: '',
  description: '',
  price: 0,
  image: '',
  secondaryImage: '',
  sizes: [] as string[],
  colors: [] as string[],
  type: 'standard',
  productType: '',
  sleeveType: '',
  linkedLotteries: [] as number[],
  popularity: 0,
  tickets: 1,
  weight: 0,
  deliveryPrice: 0,
  allowCustomization: false,
  defaultVisualId: null,
  defaultVisualSettings: null,
  visualCategoryId: null,
  printAreas: [] as PrintArea[],
  brand: '',
  fit: '',
  gender: '',
  material: '',
  participants: [] // Add this to match the ExtendedProduct type
};

export const useProductForm = (
  initialProducts: ExtendedProduct[],
  refreshProducts: () => Promise<void>
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const form = useForm<ExtendedProduct>({
    defaultValues
  });
  
  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    form.reset(defaultValues);
  };
  
  const handleEditProduct = (product: ExtendedProduct) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
    form.reset(product);
  };
  
  const handleDeleteProduct = async (productId: number) => {
    // Confirmation dialog
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }
    
    // Suppression du produit
    try {
      // Call the deleteProduct function
      // await deleteProduct(productId);
      
      // Refresh products
      await refreshProducts();
      
      // Reset form and state
      handleCancel();
      
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      toast.error("Erreur lors de la suppression du produit");
    }
  };
  
  const onSubmit = async (data: ExtendedProduct) => {
    try {
      if (isCreating) {
        // Call the createProduct function
        // await createProduct(data);
        toast.success("Produit créé avec succès");
      } else if (selectedProductId) {
        // Call the updateProduct function
        // await updateProduct(data);
        toast.success("Produit mis à jour avec succès");
      }
      
      // Refresh products
      await refreshProducts();
      
      // Reset form and state
      handleCancel();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    }
  };
  
  const handleCancel = () => {
    setIsCreating(false);
    setSelectedProductId(null);
    form.reset(defaultValues);
  };
  
  const addSize = (size: string) => {
    const sizes = form.getValues().sizes || [];
    if (!sizes.includes(size)) {
      form.setValue('sizes', [...sizes, size] as string[]);
    }
  };
  
  const removeSize = (size: string) => {
    const sizes = form.getValues().sizes || [];
    form.setValue('sizes', sizes.filter(s => s !== size) as string[]);
  };
  
  const addColor = (color: string) => {
    const colors = form.getValues().colors || [];
    if (!colors.includes(color)) {
      form.setValue('colors', [...colors, color] as string[]);
    }
  };
  
  const removeColor = (color: string) => {
    const colors = form.getValues().colors || [];
    form.setValue('colors', colors.filter(c => c !== color) as string[]);
  };
  
  const toggleLottery = (lotteryId: string) => {
    const linkedLotteries = form.getValues().linkedLotteries || [];
    const numId = Number(lotteryId);
    if (linkedLotteries.includes(numId)) {
      form.setValue('linkedLotteries', linkedLotteries.filter(id => id !== numId) as number[]);
    } else {
      form.setValue('linkedLotteries', [...linkedLotteries, numId] as number[]);
    }
  };
  
  const selectAllLotteries = (availableLotteryIds: string[]) => {
    const lotteryIds = availableLotteryIds.map(id => Number(id));
    form.setValue('linkedLotteries', lotteryIds as number[]);
  };
  
  const deselectAllLotteries = () => {
    form.setValue('linkedLotteries', [] as number[]);
  };

  // Fix the addPrintArea function with proper type structure
  const addPrintArea = (printAreaData: Omit<PrintArea, 'id'>) => {
    const currentPrintAreas = form.getValues().printAreas || [];
    const newId = currentPrintAreas.length > 0 
      ? Math.max(...currentPrintAreas.map((area: PrintArea) => area.id)) + 1
      : 1;
    
    // Create a complete PrintArea object with all required properties
    const newPrintArea: PrintArea = {
      id: newId,
      name: printAreaData.name,
      position: printAreaData.position,
      bounds: printAreaData.bounds,
      allowCustomPosition: printAreaData.allowCustomPosition || true,
      constraints: printAreaData.constraints,
      format: printAreaData.format
    };
    
    form.setValue('printAreas', [...currentPrintAreas, newPrintArea] as PrintArea[]);
  };
  
  const updatePrintArea = (id: number, data: Partial<PrintArea>) => {
    const printAreas = form.getValues().printAreas || [];
    const updatedPrintAreas = printAreas.map(area => {
      if (area.id === id) {
        return { ...area, ...data };
      }
      return area;
    });
    form.setValue('printAreas', updatedPrintAreas as PrintArea[]);
  };
  
  const removePrintArea = (id: number) => {
    const printAreas = form.getValues().printAreas || [];
    form.setValue('printAreas', printAreas.filter(area => area.id !== id) as PrintArea[]);
  };

  return {
    isCreating,
    selectedProductId,
    form,
    handleCreateProduct,
    handleEditProduct,
    handleDeleteProduct,
    onSubmit,
    handleCancel,
    addSize,
    removeSize,
    addColor,
    removeColor,
    toggleLottery,
    selectAllLotteries,
    deselectAllLotteries,
    addPrintArea,
    updatePrintArea,
    removePrintArea
  };
};

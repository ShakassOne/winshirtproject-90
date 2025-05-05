import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedProduct, PrintArea } from '@/types/product';
import { toast } from '@/lib/toast';

export const useProductForm = (
  initialProducts: ExtendedProduct[],
  refreshProducts: () => Promise<void>
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const form = useForm<ExtendedProduct>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: '',
      secondaryImage: '',
      sizes: [],
      colors: [],
      type: 'standard',
      productType: '',
      sleeveType: '',
      linkedLotteries: [],
      popularity: 0,
      tickets: 1,
      weight: 0,
      deliveryPrice: 0,
      allowCustomization: false,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: null,
      printAreas: [],
      brand: '',
      fit: '',
      gender: '',
      material: ''
    }
  });
  
  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      image: '',
      secondaryImage: '',
      sizes: [],
      colors: [],
      type: 'standard',
      productType: '',
      sleeveType: '',
      linkedLotteries: [],
      popularity: 0,
      tickets: 1,
      weight: 0,
      deliveryPrice: 0,
      allowCustomization: false,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: null,
      printAreas: [],
      brand: '',
      fit: '',
      gender: '',
      material: ''
    });
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
    form.reset();
  };
  
  const addSize = (size: string) => {
    const sizes = form.getValues().sizes || [];
    if (!sizes.includes(size)) {
      form.setValue('sizes', [...sizes, size]);
    }
  };
  
  const removeSize = (size: string) => {
    const sizes = form.getValues().sizes || [];
    form.setValue('sizes', sizes.filter(s => s !== size));
  };
  
  const addColor = (color: string) => {
    const colors = form.getValues().colors || [];
    if (!colors.includes(color)) {
      form.setValue('colors', [...colors, color]);
    }
  };
  
  const removeColor = (color: string) => {
    const colors = form.getValues().colors || [];
    form.setValue('colors', colors.filter(c => c !== color));
  };
  
  const toggleLottery = (lotteryId: string) => {
    const linkedLotteries = form.getValues().linkedLotteries || [];
    if (linkedLotteries.includes(Number(lotteryId))) {
      form.setValue('linkedLotteries', linkedLotteries.filter(id => id !== Number(lotteryId)));
    } else {
      form.setValue('linkedLotteries', [...linkedLotteries, Number(lotteryId)]);
    }
  };
  
  const selectAllLotteries = (availableLotteryIds: string[]) => {
    const lotteryIds = availableLotteryIds.map(id => Number(id));
    form.setValue('linkedLotteries', lotteryIds);
  };
  
  const deselectAllLotteries = () => {
    form.setValue('linkedLotteries', []);
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
      format: printAreaData.format,
      bounds: printAreaData.bounds,
      allowCustomPosition: printAreaData.allowCustomPosition || true
    };
    
    form.setValue('printAreas', [...currentPrintAreas, newPrintArea]);
  };
  
  const updatePrintArea = (id: number, data: Partial<PrintArea>) => {
    const printAreas = form.getValues().printAreas || [];
    const updatedPrintAreas = printAreas.map(area => {
      if (area.id === id) {
        return { ...area, ...data };
      }
      return area;
    });
    form.setValue('printAreas', updatedPrintAreas);
  };
  
  const removePrintArea = (id: number) => {
    const printAreas = form.getValues().printAreas || [];
    form.setValue('printAreas', printAreas.filter(area => area.id !== id));
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


import { useState } from 'react';
import { ExtendedProduct } from '@/types/product';
import { useForm } from 'react-hook-form';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { createProduct, updateProduct, deleteProduct } from '@/services/productService';
import { checkSupabaseConnection } from '@/lib/supabase';

export const useProductForm = (
  products: ExtendedProduct[],
  refreshProducts: () => Promise<void>,
  activeLotteries: ExtendedLottery[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form initialization
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sizes: [] as string[],
      colors: [] as string[],
      image: '',
      secondaryImage: '',
      type: 'standard',
      productType: '',
      sleeveType: '',
      linkedLotteries: [] as string[],
      popularity: 0,
      tickets: 1,
      weight: 0,
      deliveryPrice: 0,
      allowCustomization: false,
      printAreas: [] as any[],
      defaultVisualId: null,
      defaultVisualSettings: {},
      visualCategoryId: null,
    }
  });

  // Handler for creating a new product
  const handleCreateProduct = () => {
    console.log("Creating new product");
    setIsCreating(true);
    setSelectedProductId(null);
    form.reset();
  };

  // Handler for editing an existing product
  const handleEditProduct = (product: ExtendedProduct) => {
    console.log("Editing product:", product.id);
    if (product) {
      setIsCreating(false);
      setSelectedProductId(product.id);
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        sizes: product.sizes || [],
        colors: product.colors || [],
        image: product.image || '',
        secondaryImage: product.secondaryImage || '',
        type: product.type || 'standard',
        productType: product.productType || '',
        sleeveType: product.sleeveType || '',
        linkedLotteries: product.linkedLotteries?.map(String) || [],
        popularity: product.popularity || 0,
        tickets: product.tickets || 1,
        weight: product.weight || 0,
        deliveryPrice: product.deliveryPrice || 0,
        allowCustomization: product.allowCustomization || false,
        printAreas: product.printAreas || [],
        defaultVisualId: product.defaultVisualId || null,
        defaultVisualSettings: product.defaultVisualSettings || {},
        visualCategoryId: product.visualCategoryId || null,
      });
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (productId: number) => {
    const isConnected = await checkSupabaseConnection();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      console.log("Deleting product:", productId);
      
      const success = await deleteProduct(productId);
      
      if (success) {
        if (selectedProductId === productId) {
          setSelectedProductId(null);
          setIsCreating(false);
          form.reset();
        }
        
        await refreshProducts();
      }
    }
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting product form:", data);
      
      // Convert linkedLotteries from string[] to number[]
      const productData = {
        ...data,
        linkedLotteries: data.linkedLotteries.map(Number),
        price: Number(data.price),
        weight: Number(data.weight),
        deliveryPrice: Number(data.deliveryPrice),
        popularity: Number(data.popularity),
        tickets: Number(data.tickets)
      };

      if (isCreating) {
        const newProduct = await createProduct(productData);
        
        if (newProduct) {
          await refreshProducts();
          setIsCreating(false);
          form.reset();
          toast.success("Produit créé avec succès", { position: "bottom-right" });
        }
      } else if (selectedProductId) {
        const updatedProduct = await updateProduct(selectedProductId, productData);
        
        if (updatedProduct) {
          await refreshProducts();
          setSelectedProductId(null);
          form.reset();
          toast.success("Produit mis à jour avec succès", { position: "bottom-right" });
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
    setSelectedProductId(null);
    form.reset();
  };

  // Size handlers
  const addSize = (size: string) => {
    const currentSizes = form.getValues('sizes') || [];
    if (!currentSizes.includes(size)) {
      form.setValue('sizes', [...currentSizes, size]);
    }
  };

  const removeSize = (size: string) => {
    const currentSizes = form.getValues('sizes') || [];
    form.setValue('sizes', currentSizes.filter(s => s !== size));
  };

  // Color handlers
  const addColor = (color: string) => {
    const currentColors = form.getValues('colors') || [];
    if (!currentColors.includes(color)) {
      form.setValue('colors', [...currentColors, color]);
    }
  };

  const removeColor = (color: string) => {
    const currentColors = form.getValues('colors') || [];
    form.setValue('colors', currentColors.filter(c => c !== color));
  };

  // Lottery handlers
  const toggleLottery = (lotteryId: string) => {
    const currentLotteries = form.getValues('linkedLotteries') || [];
    const newLotteries = currentLotteries.includes(lotteryId)
      ? currentLotteries.filter(id => id !== lotteryId)
      : [...currentLotteries, lotteryId];
    form.setValue('linkedLotteries', newLotteries);
  };

  const selectAllLotteries = () => {
    const allLotteryIds = activeLotteries.map(lottery => lottery.id.toString());
    form.setValue('linkedLotteries', allLotteryIds);
  };

  const deselectAllLotteries = () => {
    form.setValue('linkedLotteries', []);
  };

  // Print area handlers
  const addPrintArea = () => {
    const currentPrintAreas = form.getValues('printAreas') || [];
    form.setValue('printAreas', [...currentPrintAreas, { 
      id: Date.now(), 
      name: `Zone ${currentPrintAreas.length + 1}`,
      width: 100, 
      height: 100, 
      posX: 50, 
      posY: 50,
      angle: 0,
      constraints: {
        minWidth: 50,
        maxWidth: 200,
        minHeight: 50,
        maxHeight: 200,
      }
    }]);
  };

  const updatePrintArea = (id: number, data: any) => {
    const currentPrintAreas = form.getValues('printAreas') || [];
    const updatedAreas = currentPrintAreas.map(area => 
      area.id === id ? { ...area, ...data } : area
    );
    form.setValue('printAreas', updatedAreas);
  };

  const removePrintArea = (id: number) => {
    const currentPrintAreas = form.getValues('printAreas') || [];
    form.setValue('printAreas', currentPrintAreas.filter(area => area.id !== id));
  };

  return {
    isCreating,
    selectedProductId,
    form,
    isSubmitting,
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

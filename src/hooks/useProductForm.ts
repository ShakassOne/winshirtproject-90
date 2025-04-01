
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

export const useProductForm = (
  products: ExtendedProduct[],
  setProducts: React.Dispatch<React.SetStateAction<ExtendedProduct[]>>,
  availableLotteries: any[] = []
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      type: 'standard',
      sizes: [] as string[],
      colors: [] as string[],
      linkedLotteries: [] as string[],
      image: ''
    }
  });
  
  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      price: '',
      type: 'standard',
      sizes: [],
      colors: [],
      linkedLotteries: [],
      image: ''
    });
  };
  
  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    resetForm();
  };
  
  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setIsCreating(false);
    setSelectedProductId(productId);
    
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type || 'standard',
      sizes: product.sizes,
      colors: product.colors,
      linkedLotteries: product.linkedLotteries?.map(id => id.toString()) || [],
      image: product.image
    });
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(p => p.id !== productId);
      // Sauvegarder dans localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
    
    toast.success("Produit supprimé avec succès");
    
    if (selectedProductId === productId) {
      setSelectedProductId(null);
      resetForm();
    }
  };
  
  const onSubmit = (data: any) => {
    const productId = isCreating ? Math.max(0, ...products.map(p => p.id)) + 1 : selectedProductId!;
    
    const newProduct: ExtendedProduct = {
      id: productId,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      type: data.type,
      sizes: data.sizes,
      colors: data.colors,
      linkedLotteries: data.linkedLotteries.map(Number),
      image: data.image || 'https://placehold.co/600x400/png',
      popularity: Math.random() * 100 // Just for mock data
    };
    
    if (isCreating) {
      setProducts(prev => {
        const updatedProducts = [...prev, newProduct];
        // Sauvegarder dans localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
      toast.success("Produit créé avec succès");
    } else {
      setProducts(prev => {
        const updatedProducts = prev.map(p => p.id === selectedProductId ? newProduct : p);
        // Sauvegarder dans localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
      toast.success("Produit mis à jour avec succès");
    }
    
    resetForm();
    setIsCreating(false);
    setSelectedProductId(null);
  };
  
  // Charger les produits depuis localStorage au montage du composant
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
    }
  }, []);
  
  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setSelectedProductId(null);
  };
  
  const addSize = (size: string) => {
    const currentSizes = form.getValues('sizes');
    if (!currentSizes.includes(size)) {
      form.setValue('sizes', [...currentSizes, size]);
    }
  };
  
  const removeSize = (size: string) => {
    const currentSizes = form.getValues('sizes');
    form.setValue('sizes', currentSizes.filter(s => s !== size));
  };
  
  const addColor = (color: string) => {
    const currentColors = form.getValues('colors');
    if (!currentColors.includes(color)) {
      form.setValue('colors', [...currentColors, color]);
    }
  };
  
  const removeColor = (color: string) => {
    const currentColors = form.getValues('colors');
    form.setValue('colors', currentColors.filter(c => c !== color));
  };
  
  const toggleLottery = (lotteryId: string) => {
    const currentLotteries = form.getValues('linkedLotteries') || [];
    
    if (currentLotteries.includes(lotteryId)) {
      form.setValue('linkedLotteries', currentLotteries.filter(id => id !== lotteryId));
    } else {
      form.setValue('linkedLotteries', [...currentLotteries, lotteryId]);
    }
    
    // Force rerender by updating form
    form.trigger('linkedLotteries');
  };

  // Functions to select/deselect all lotteries
  const selectAllLotteries = () => {
    const allLotteryIds = availableLotteries.map(lottery => lottery.id.toString());
    form.setValue('linkedLotteries', allLotteryIds);
    form.trigger('linkedLotteries');
  };
  
  const deselectAllLotteries = () => {
    form.setValue('linkedLotteries', []);
    form.trigger('linkedLotteries');
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
    deselectAllLotteries
  };
};

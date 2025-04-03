import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/api/productApi';
import { Visual, ProductVisualSettings } from '@/types/visual';

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
      productType: '',
      sleeveType: '',
      sizes: [] as string[],
      colors: [] as string[],
      linkedLotteries: [] as string[],
      image: '',
      secondaryImage: '',
      tickets: 1,
      weight: '', // Weight as string for the form
      deliveryPrice: '', // Delivery price as string for the form
      // Nouveaux champs pour les visuels
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: {
        position: { x: 50, y: 50 },
        size: { width: 200, height: 200 },
        opacity: 0.8
      }
    }
  });
  
  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      price: '',
      type: 'standard',
      productType: '',
      sleeveType: '',
      sizes: [],
      colors: [],
      linkedLotteries: [],
      image: '',
      secondaryImage: '',
      tickets: 1,
      weight: '',
      deliveryPrice: '',
      // Nouveaux champs pour les visuels
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: {
        position: { x: 50, y: 50 },
        size: { width: 200, height: 200 },
        opacity: 0.8
      }
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
    
    // Convert linkedLotteries to string array or use empty array if undefined
    const linkedLotteries = product.linkedLotteries
      ? product.linkedLotteries.map(id => id.toString())
      : [];
    
    // Ensure sizes and colors are arrays
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type || 'standard',
      productType: product.productType || '',
      sleeveType: product.sleeveType || '',
      sizes: sizes,
      colors: colors,
      linkedLotteries: linkedLotteries,
      image: product.image,
      secondaryImage: product.secondaryImage || '',
      tickets: product.tickets || 1,
      weight: product.weight ? product.weight.toString() : '',
      deliveryPrice: product.deliveryPrice ? product.deliveryPrice.toString() : '',
      // Nouveaux champs pour les visuels
      allowCustomization: product.allowCustomization !== false,
      defaultVisualId: product.defaultVisualId || null,
      defaultVisualSettings: product.defaultVisualSettings || {
        position: { x: 50, y: 50 },
        size: { width: 200, height: 200 },
        opacity: 0.8
      }
    });
    
    // Force update of form fields to trigger rerender
    form.trigger();
  };
  
  const handleDeleteProduct = async (productId: number) => {
    const success = await deleteProduct(productId);
    
    if (success) {
      setProducts(prevProducts => {
        return prevProducts.filter(p => p.id !== productId);
      });
      
      toast.success("Produit supprimé avec succès");
      
      if (selectedProductId === productId) {
        setSelectedProductId(null);
        resetForm();
      }
    }
  };
  
  const onSubmit = async (data: any) => {
    try {
      // Ensure all arrays are properly initialized
      const sizes = Array.isArray(data.sizes) ? data.sizes : [];
      const colors = Array.isArray(data.colors) ? data.colors : [];
      const linkedLotteries = Array.isArray(data.linkedLotteries) 
        ? data.linkedLotteries.map(Number) 
        : [];
      
      if (isCreating) {
        // Préparer les données du nouveau produit
        const newProductData: Omit<ExtendedProduct, 'id'> = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          type: data.type,
          productType: data.productType,
          sleeveType: data.sleeveType,
          sizes: sizes,
          colors: colors,
          linkedLotteries: linkedLotteries,
          image: data.image || 'https://placehold.co/600x400/png',
          secondaryImage: data.secondaryImage || '',
          popularity: Math.random() * 100, // Just for mock data
          tickets: parseInt(data.tickets, 10) || 1,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          deliveryPrice: data.deliveryPrice ? parseFloat(data.deliveryPrice) : undefined,
          // Nouveaux champs pour les visuels
          allowCustomization: data.allowCustomization,
          defaultVisualId: data.defaultVisualId,
          defaultVisualSettings: data.defaultVisualSettings
        };
        
        // Créer le produit dans Supabase
        const createdProduct = await createProduct(newProductData);
        
        if (createdProduct) {
          setProducts(prev => [...prev, createdProduct]);
          toast.success("Produit créé avec succès");
        }
      } else if (selectedProductId) {
        // Préparer les données pour la mise à jour
        const productToUpdate: ExtendedProduct = {
          id: selectedProductId,
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          type: data.type,
          productType: data.productType,
          sleeveType: data.sleeveType,
          sizes: sizes,
          colors: colors,
          linkedLotteries: linkedLotteries,
          image: data.image || 'https://placehold.co/600x400/png',
          secondaryImage: data.secondaryImage || '',
          popularity: products.find(p => p.id === selectedProductId)?.popularity || Math.random() * 100,
          tickets: parseInt(data.tickets, 10) || 1,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          deliveryPrice: data.deliveryPrice ? parseFloat(data.deliveryPrice) : undefined,
          // Nouveaux champs pour les visuels
          allowCustomization: data.allowCustomization,
          defaultVisualId: data.defaultVisualId,
          defaultVisualSettings: data.defaultVisualSettings
        };
        
        // Mettre à jour le produit dans Supabase
        const updatedProduct = await updateProduct(productToUpdate);
        
        if (updatedProduct) {
          setProducts(prev => prev.map(p => p.id === selectedProductId ? updatedProduct : p));
          toast.success("Produit mis à jour avec succès");
        }
      }
      
      resetForm();
      setIsCreating(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement du produit");
    }
  };
  
  // Charger les produits depuis Supabase au montage du composant
  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts();
      if (products.length > 0) {
        setProducts(products);
      }
    };
    
    loadProducts();
  }, []);
  
  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setSelectedProductId(null);
  };
  
  const addSize = (size: string) => {
    // Get current sizes
    const currentSizes = form.getValues('sizes') || [];
    
    // Only add if not already included
    if (!currentSizes.includes(size)) {
      // Set new sizes array
      form.setValue('sizes', [...currentSizes, size]);
      
      // Trigger validation to update UI
      form.trigger('sizes');
    }
  };
  
  const removeSize = (size: string) => {
    const currentSizes = form.getValues('sizes') || [];
    form.setValue('sizes', currentSizes.filter(s => s !== size));
    form.trigger('sizes');
  };
  
  const addColor = (color: string) => {
    const currentColors = form.getValues('colors') || [];
    if (!currentColors.includes(color)) {
      form.setValue('colors', [...currentColors, color]);
      form.trigger('colors');
    }
  };
  
  const removeColor = (color: string) => {
    const currentColors = form.getValues('colors') || [];
    form.setValue('colors', currentColors.filter(c => c !== color));
    form.trigger('colors');
  };
  
  const toggleLottery = (lotteryId: string) => {
    const currentLotteries = form.getValues('linkedLotteries') || [];
    
    if (currentLotteries.includes(lotteryId)) {
      form.setValue('linkedLotteries', currentLotteries.filter(id => id !== lotteryId));
    } else {
      // Dans l'interface admin, nous ne limitons pas le nombre de loteries
      form.setValue('linkedLotteries', [...currentLotteries, lotteryId]);
    }
    
    // Force rerender by updating form
    form.trigger('linkedLotteries');
  };

  // Functions to select/deselect all lotteries
  const selectAllLotteries = () => {
    // Dans l'admin, on permet de sélectionner toutes les loteries disponibles
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

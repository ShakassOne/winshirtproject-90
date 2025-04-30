import { useState, useEffect } from 'react';
import { ExtendedProduct, PrintArea } from '@/types/product';
import { useForm } from 'react-hook-form';
import { toast } from '@/lib/toast';
import { showNotification } from '@/lib/notifications';
import { createProduct, updateProduct, deleteProduct, syncProductsToSupabase } from '@/services/productService';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useProductForm = (products: ExtendedProduct[], setProducts: React.Dispatch<React.SetStateAction<ExtendedProduct[]>>) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printAreas, setPrintAreas] = useState<PrintArea[]>([]);
  const [selectedPrintAreaId, setSelectedPrintAreaId] = useState<number | null>(null);
  const [selectedLotteries, setSelectedLotteries] = useState<string[]>([]);
  
  // Initialize form with default values
  const form = useForm<ExtendedProduct>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: '',
      secondaryImage: '',
      sizes: [],
      colors: [],
      type: 'shirt',
      status: 'active',
      featured: false,
      allowCustomization: true,
      tickets: 0,
      weight: 0,
      deliveryPrice: 0,
      printAreas: [],
      linkedLotteries: []
    }
  });
  
  // Reset form when selected product changes
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        form.reset(product);
        
        // Initialize print areas
        setPrintAreas(product.printAreas || []);
        
        // Initialize selected lotteries
        setSelectedLotteries((product.linkedLotteries || []).map(id => id.toString()));
      }
    } else if (isCreating) {
      form.reset({
        name: '',
        description: '',
        price: 0,
        image: '',
        secondaryImage: '',
        sizes: [],
        colors: [],
        type: 'shirt',
        status: 'active',
        featured: false,
        allowCustomization: true,
        tickets: 0,
        weight: 0,
        deliveryPrice: 0,
        printAreas: [],
        linkedLotteries: []
      });
      setPrintAreas([]);
      setSelectedLotteries([]);
    }
  }, [selectedProductId, isCreating, products]);
  
  // Handle create product button click
  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    setPrintAreas([]);
    setSelectedLotteries([]);
  };
  
  // Handle edit product button click
  const handleEditProduct = (productId: number) => {
    setIsCreating(false);
    setSelectedProductId(productId);
    
    const product = products.find(p => p.id === productId);
    if (product) {
      setPrintAreas(product.printAreas || []);
      setSelectedLotteries((product.linkedLotteries || []).map(id => id.toString()));
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: ExtendedProduct) => {
    setIsSubmitting(true);
    
    try {
      // Add print areas to the data
      data.printAreas = printAreas;
      
      // Add linked lotteries to the data
      data.linkedLotteries = selectedLotteries.map(id => parseInt(id));
      
      if (isCreating) {
        // Create new product
        data.id = Date.now(); // Temporary ID for local storage
        
        // Create product and update state
        createProduct(data);
        setProducts(prev => [...prev, data]);
        
        // Show success notification
        showNotification('create', 'product', true);
        toast.success(`Produit "${data.name}" créé avec succès`);
      } else {
        // Update existing product
        updateProduct(data.id, data);
        
        // Update products state
        setProducts(prev => prev.map(p => p.id === data.id ? data : p));
        
        // Show success notification
        showNotification('update', 'product', true);
        toast.success(`Produit "${data.name}" mis à jour avec succès`);
      }
      
      // Reset form state
      handleCancel();
    } catch (error) {
      console.error('Error submitting product form:', error);
      showNotification(isCreating ? 'create' : 'update', 'product', false, error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Erreur lors de la ${isCreating ? 'création' : 'mise à jour'} du produit`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        // Delete product
        deleteProduct(productId);
        
        // Update products state
        setProducts(prev => prev.filter(p => p.id !== productId));
        
        // Reset selection if the deleted product was selected
        if (selectedProductId === productId) {
          setSelectedProductId(null);
          setIsCreating(false);
        }
        
        // Show success notification
        showNotification('delete', 'product', true);
        toast.success('Produit supprimé avec succès');
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('delete', 'product', false, error instanceof Error ? error.message : 'Unknown error');
        toast.error('Erreur lors de la suppression du produit');
      }
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setIsCreating(false);
    setSelectedProductId(null);
    form.reset();
    setPrintAreas([]);
    setSelectedLotteries([]);
  };
  
  // Handle sync to Supabase
  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase n\'est pas configuré. Veuillez configurer Supabase dans les paramètres.');
      return;
    }
    
    try {
      await syncProductsToSupabase();
      toast.success('Produits synchronisés avec Supabase avec succès');
    } catch (error) {
      console.error('Error syncing products to Supabase:', error);
      toast.error('Erreur lors de la synchronisation des produits avec Supabase');
    }
  };
  
  // Handle print area selection
  const handleSelectPrintArea = (areaId: number) => {
    setSelectedPrintAreaId(areaId);
  };
  
  // Handle print area position update
  const handleUpdateAreaPosition = (areaId: number, x: number, y: number) => {
    setPrintAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          bounds: {
            ...area.bounds,
            x,
            y
          }
        };
      }
      return area;
    }));
  };
  
  // Handle add print area
  const handleAddPrintArea = (position: 'front' | 'back') => {
    const newArea: PrintArea = {
      id: Date.now(),
      name: `Zone ${position === 'front' ? 'Recto' : 'Verso'} ${printAreas.filter(a => a.position === position).length + 1}`,
      position,
      bounds: {
        x: 50,
        y: 50,
        width: 200,
        height: 200
      }
    };
    
    setPrintAreas(prev => [...prev, newArea]);
    setSelectedPrintAreaId(newArea.id);
  };
  
  // Handle delete print area
  const handleDeletePrintArea = (areaId: number) => {
    setPrintAreas(prev => prev.filter(area => area.id !== areaId));
    if (selectedPrintAreaId === areaId) {
      setSelectedPrintAreaId(null);
    }
  };
  
  // Handle update print area name
  const handleUpdatePrintAreaName = (areaId: number, name: string) => {
    setPrintAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          name
        };
      }
      return area;
    }));
  };
  
  // Handle update print area size
  const handleUpdatePrintAreaSize = (areaId: number, width: number, height: number) => {
    setPrintAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          bounds: {
            ...area.bounds,
            width,
            height
          }
        };
      }
      return area;
    }));
  };
  
  // Handle lottery selection
  const toggleLottery = (lotteryId: string) => {
    setSelectedLotteries(prev => {
      if (prev.includes(lotteryId)) {
        return prev.filter(id => id !== lotteryId);
      } else {
        return [...prev, lotteryId];
      }
    });
  };
  
  // Handle select all lotteries
  const selectAllLotteries = (availableLotteryIds: string[]) => {
    setSelectedLotteries(availableLotteryIds);
  };
  
  // Handle deselect all lotteries
  const deselectAllLotteries = () => {
    setSelectedLotteries([]);
  };
  
  return {
    isCreating,
    selectedProductId,
    form,
    isSubmitting,
    printAreas,
    selectedPrintAreaId,
    selectedLotteries,
    handleCreateProduct,
    handleEditProduct,
    onSubmit,
    handleDeleteProduct,
    handleCancel,
    handleSyncToSupabase,
    handleSelectPrintArea,
    handleUpdateAreaPosition,
    handleAddPrintArea,
    handleDeletePrintArea,
    handleUpdatePrintAreaName,
    handleUpdatePrintAreaSize,
    toggleLottery,
    selectAllLotteries,
    deselectAllLotteries
  };
};

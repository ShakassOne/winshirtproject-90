import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { ExtendedProduct, PrintArea } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import { useProductForm } from '@/hooks/useProductForm';
import ProductList from '@/components/admin/products/ProductList';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from "@/components/ui/button";
import { Download, Upload, RefreshCw } from "lucide-react";
import { toast } from '@/lib/toast';
import { syncProductsToSupabase, useProducts } from '@/services/productService';
import { useLotteries } from '@/services/lotteryService';

const AdminProductsPage: React.FC = () => {
  // Utiliser le hook useProducts
  const { products, loading: productsLoading, error: productsError, refreshProducts } = useProducts();
  const { lotteries, loading: lotteriesLoading } = useLotteries();
  
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  const [syncingProducts, setSyncingProducts] = useState(false);
  
  // Load visual categories on mount
  useEffect(() => {
    const loadVisualCategories = () => {
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories)) {
            setVisualCategories(parsedCategories);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des catégories de visuels:", error);
        }
      }
    };
    
    loadVisualCategories();
  }, []);
  
  // Gérer la synchronisation manuelle des produits avec Supabase
  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    try {
      // Changed to properly check boolean return value
      const success = await syncProductsToSupabase();
      if (success) {
        await refreshProducts();
        toast.success("Produits synchronisés avec Supabase", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setSyncingProducts(false);
    }
  };
  
  const {
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
  } = useProductForm(products, refreshProducts);
  
  // Export products to JSON file
  const handleExportProducts = () => {
    try {
      const dataStr = JSON.stringify(products, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `winshirt-products-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Produits exportés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation des produits");
    }
  };
  
  // Import products from JSON file
  const handleImportProducts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedProducts = JSON.parse(event.target?.result as string);
          
          if (Array.isArray(importedProducts)) {
            // Mise à jour du localStorage
            localStorage.setItem('products', JSON.stringify(importedProducts));
            
            // Rafraîchir les produits
            await refreshProducts();
            
            toast.success(`${importedProducts.length} produits importés avec succès`);
          } else {
            toast.error("Format de fichier invalide. Attendu: tableau de produits");
          }
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          toast.error("Erreur lors de l'importation des produits");
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Fixed selectAllLotteries to accept parameter
  const handleSelectAllLotteries = () => {
    const availableLotteryIds = lotteries.map(lottery => lottery.id.toString());
    selectAllLotteries(availableLotteryIds);
  };
  
  // Fixed to correctly create a PrintArea object
  const handleAddPrintArea = (position: 'front' | 'back') => {
    const newArea: Omit<PrintArea, 'id'> = {
      name: `Zone ${position === 'front' ? 'Recto' : 'Verso'} ${(form.getValues().printAreas || []).filter(a => a.position === position).length + 1}`,
      position,
      format: 'custom' as const,
      bounds: {
        x: 50,
        y: 50,
        width: 200,
        height: 200
      },
      allowCustomPosition: true
    };
    
    addPrintArea(newArea);
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-white">Gestion des Produits</h1>
            <div className="flex gap-3">
              <Button 
                onClick={handleSyncProducts}
                disabled={syncingProducts}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                {syncingProducts ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Synchroniser
              </Button>
              <Button 
                onClick={handleExportProducts}
                className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
              >
                <Download size={16} className="mr-2" /> Exporter
              </Button>
              <Button 
                onClick={handleImportProducts}
                variant="outline"
                className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
              >
                <Upload size={16} className="mr-2" /> Importer
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product list */}
            <div className="w-full lg:w-1/3">
              <ProductList
                products={products}
                selectedProductId={selectedProductId}
                loading={productsLoading}
                onCreateProduct={handleCreateProduct}
                onEditProduct={(id: number) => handleEditProduct(products.find(p => p.id === id)!)}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
            
            {/* Enhanced product form */}
            <div className="w-full lg:w-2/3">
              <div className="winshirt-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isCreating ? "Créer un nouveau produit" : selectedProductId ? "Modifier le produit" : "Sélectionnez ou créez un produit"}
                </h2>
                
                <EnhancedProductForm
                  isCreating={isCreating}
                  selectedProductId={selectedProductId}
                  form={form}
                  activeLotteries={lotteries}
                  visualCategories={visualCategories}
                  onCancel={handleCancel}
                  onSubmit={onSubmit}
                  onCreateProduct={handleCreateProduct}
                  addSize={addSize}
                  removeSize={removeSize}
                  addColor={addColor}
                  removeColor={removeColor}
                  toggleLottery={toggleLottery}
                  selectAllLotteries={handleSelectAllLotteries}
                  deselectAllLotteries={deselectAllLotteries}
                  addPrintArea={handleAddPrintArea}
                  updatePrintArea={updatePrintArea}
                  removePrintArea={removePrintArea}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminNavigation />
    </>
  );
};

export default AdminProductsPage;

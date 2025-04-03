
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import { useProductForm } from '@/hooks/useProductForm';
import ProductList from '@/components/admin/products/ProductList';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson } from "lucide-react";
import { toast } from '@/lib/toast';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>(mockProducts as ExtendedProduct[]);
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>(mockLotteries as ExtendedLottery[]);
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  
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
  
  // Load lotteries from both storage types on mount
  useEffect(() => {
    const loadLotteries = () => {
      // Try localStorage first
      const localLotteries = localStorage.getItem('lotteries');
      if (localLotteries) {
        try {
          const parsedLotteries = JSON.parse(localLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Sync with sessionStorage
            sessionStorage.setItem('lotteries', localLotteries);
            return;
          }
        } catch (error) {
          console.error("Error loading lotteries from localStorage:", error);
        }
      }
      
      // Fallback to sessionStorage
      const sessionLotteries = sessionStorage.getItem('lotteries');
      if (sessionLotteries) {
        try {
          const parsedLotteries = JSON.parse(sessionLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Sync with localStorage
            localStorage.setItem('lotteries', sessionLotteries);
          }
        } catch (error) {
          console.error("Error loading lotteries from sessionStorage:", error);
        }
      }
    };
    
    loadLotteries();
  }, []);
  
  // Load products
  useEffect(() => {
    const loadProducts = () => {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
          }
        } catch (error) {
          console.error("Error loading products from localStorage:", error);
        }
      }
    };
    
    loadProducts();
  }, []);
  
  // Filter for active lotteries to assign to products
  const activeLotteries = lotteries.filter(lottery => lottery.status === 'active') as ExtendedLottery[];
  
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
    deselectAllLotteries
  } = useProductForm(products, setProducts, activeLotteries);
  
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
      reader.onload = (event) => {
        try {
          const importedProducts = JSON.parse(event.target?.result as string);
          
          if (Array.isArray(importedProducts)) {
            setProducts(importedProducts);
            localStorage.setItem('products', JSON.stringify(importedProducts));
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
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Gestion des Produits</h1>
            <div className="flex gap-3">
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
                onCreateProduct={handleCreateProduct}
                onEditProduct={handleEditProduct}
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
                  activeLotteries={activeLotteries}
                  visualCategories={visualCategories}
                  onCancel={handleCancel}
                  onSubmit={onSubmit}
                  onCreateProduct={handleCreateProduct}
                  addSize={addSize}
                  removeSize={removeSize}
                  addColor={addColor}
                  removeColor={removeColor}
                  toggleLottery={toggleLottery}
                  selectAllLotteries={selectAllLotteries}
                  deselectAllLotteries={deselectAllLotteries}
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

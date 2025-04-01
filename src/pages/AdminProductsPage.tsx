
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { useProductForm } from '@/hooks/useProductForm';
import ProductList from '@/components/admin/products/ProductList';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>(mockProducts as ExtendedProduct[]);
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>(mockLotteries as ExtendedLottery[]);
  
  // Charger les loteries depuis les deux types de stockage au montage
  useEffect(() => {
    const loadLotteries = () => {
      // Essayer d'abord localStorage
      const localLotteries = localStorage.getItem('lotteries');
      if (localLotteries) {
        try {
          const parsedLotteries = JSON.parse(localLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Synchroniser avec sessionStorage
            sessionStorage.setItem('lotteries', localLotteries);
            return;
          }
        } catch (error) {
          console.error("Erreur lors du chargement des loteries depuis localStorage:", error);
        }
      }
      
      // Fallback à sessionStorage
      const sessionLotteries = sessionStorage.getItem('lotteries');
      if (sessionLotteries) {
        try {
          const parsedLotteries = JSON.parse(sessionLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Synchroniser avec localStorage
            localStorage.setItem('lotteries', sessionLotteries);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des loteries depuis sessionStorage:", error);
        }
      }
    };
    
    loadLotteries();
  }, []);
  
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
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Liste des produits */}
            <div className="w-full lg:w-1/3">
              <ProductList
                products={products}
                selectedProductId={selectedProductId}
                onCreateProduct={handleCreateProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
            
            {/* Formulaire de produit amélioré */}
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
    </>
  );
};

export default AdminProductsPage;

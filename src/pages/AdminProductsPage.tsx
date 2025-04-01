
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { useProductForm } from '@/hooks/useProductForm';
import ProductList from '@/components/admin/products/ProductList';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>(mockProducts as ExtendedProduct[]);
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>(mockLotteries as ExtendedLottery[]);
  
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
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4 md:px-8">
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

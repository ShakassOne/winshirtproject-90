
import React, { useState } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { useProductForm } from '@/hooks/useProductForm';
import ProductList from '@/components/admin/products/ProductList';
import ProductForm from '@/components/admin/products/ProductForm';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>(mockProducts as ExtendedProduct[]);
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
    toggleLottery
  } = useProductForm(products, setProducts);
  
  const activeLotteries = mockLotteries.filter(lottery => lottery.status === 'active') as ExtendedLottery[];
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product List */}
            <div className="w-full lg:w-1/3">
              <ProductList
                products={products}
                selectedProductId={selectedProductId}
                onCreateProduct={handleCreateProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
            
            {/* Product Form */}
            <div className="w-full lg:w-2/3">
              <div className="winshirt-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isCreating ? "Créer un nouveau produit" : selectedProductId ? "Modifier le produit" : "Sélectionnez ou créez un produit"}
                </h2>
                
                <ProductForm
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

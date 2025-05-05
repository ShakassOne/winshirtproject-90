
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminSetup from '@/components/AdminSetup';
import ProductTable from '@/components/admin/products/ProductTable';
import ProductForm from '@/components/admin/products/ProductForm';
import { useProductForm } from '@/hooks/useProductForm';
import { createProduct, updateProduct, deleteProduct } from '@/api/productApi';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

const ProductsAdminPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      // Try to get from localStorage first
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        } else {
          console.log("Admin: No products found, initializing empty array");
          setProducts([]);
        }
      } else {
        console.log("Admin: No products found, initializing empty array");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update to use our API hooks
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
  
  useEffect(() => {
    refreshProducts();
  }, []);
  
  // Override submit handler to use our API
  const handleSubmit = async (data: ExtendedProduct) => {
    try {
      if (isCreating) {
        const newProduct = await createProduct(data);
        if (newProduct) {
          toast.success(`Produit "${data.name}" créé avec succès`);
          refreshProducts();
          handleCancel();
        }
      } else if (selectedProductId) {
        const updatedProduct = await updateProduct(data);
        if (updatedProduct) {
          toast.success(`Produit "${data.name}" mis à jour avec succès`);
          refreshProducts();
          handleCancel();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    }
  };
  
  // Override delete handler to use our API
  const handleProductDelete = async (productId: number) => {
    try {
      const success = await deleteProduct(productId);
      if (success) {
        toast.success("Produit supprimé avec succès");
        refreshProducts();
        if (selectedProductId === productId) {
          handleCancel();
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erreur lors de la suppression du produit");
    }
  };
  
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion des Produits
          </h1>
          
          <AdminSetup />
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ProductTable 
                products={products}
                loading={isLoading}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleProductDelete}
                onCreateProduct={handleCreateProduct}
              />
            </div>
            
            <div>
              <ProductForm
                form={form}
                isCreating={isCreating}
                selectedProductId={selectedProductId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                addSize={addSize}
                removeSize={removeSize}
                addColor={addColor}
                removeColor={removeColor}
                toggleLottery={toggleLottery}
                selectAllLotteries={selectAllLotteries}
                deselectAllLotteries={deselectAllLotteries}
                addPrintArea={addPrintArea}
                updatePrintArea={updatePrintArea}
                removePrintArea={removePrintArea}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsAdminPage;

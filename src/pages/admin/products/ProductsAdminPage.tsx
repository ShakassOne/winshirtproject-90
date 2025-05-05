import React, { useEffect, useState } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminSetup from '@/components/admin/AdminSetup';
import ProductTable from '@/components/admin/products/ProductTable';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';
import { useProducts, createProduct, updateProduct, deleteProduct, syncProductsToSupabase } from '@/services/productService';
import { getLotteries } from '@/services/lotteryService';
import { useProductForm } from '@/hooks/useProductForm';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { VisualCategory } from '@/types/visual';
import { getVisualCategories } from '@/utils/visualUtils';
import { Sync } from 'lucide-react';

const AdminProductsPage: React.FC = () => {
  const { products, loading: productsLoading, refreshProducts } = useProducts();
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  const [activeLotteries, setActiveLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create productForm with the imported custom hook
  const productForm = useProductForm(products, refreshProducts);
  
  // Load necessary data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load visual categories
        const categories = getVisualCategories();
        setVisualCategories(categories);
        
        // Load active lotteries
        const lotteries = await getLotteries(true);
        setActiveLotteries(lotteries);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Define adapter functions to match the expected function signatures
  const selectAllLotteriesAdapter = () => {
    const availableLotteryIds = activeLotteries.map(lottery => lottery.id.toString());
    productForm.selectAllLotteries(availableLotteryIds);
  };
  
  const addPrintAreaAdapter = (position: 'front' | 'back') => {
    const newArea: Omit<PrintArea, 'id'> = {
      name: `Zone ${position === 'front' ? 'Recto' : 'Verso'}`,
      position,
      format: 'custom',
      bounds: {
        x: 50,
        y: 50,
        width: 200,
        height: 200
      },
      allowCustomPosition: true
    };
    
    productForm.addPrintArea(newArea);
  };
  
  return (
    <>
      <StarBackground />
      <AdminNavigation />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion des produits
          </h1>

          <div className="mb-8 flex items-center justify-between">
            <Button
              onClick={productForm.handleCreateProduct}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Ajouter un produit
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const success = await syncProductsToSupabase();
                if (success) {
                  await productForm.refreshProducts();
                }
              }}
              className="border-winshirt-purple/30 text-white"
            >
              <Sync className="h-4 w-4 mr-2 animate-spin" />
              Synchroniser
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              <ProductTable
                products={products || []}
                loading={productsLoading}
                onEditProduct={productForm.handleEditProduct}
                onDeleteProduct={productForm.handleDeleteProduct}
                onCreateProduct={productForm.handleCreateProduct}
              />
            </div>

            <div className="col-span-1">
              <EnhancedProductForm
                isCreating={productForm.isCreating}
                selectedProductId={productForm.selectedProductId}
                form={productForm.form}
                activeLotteries={activeLotteries}
                visualCategories={visualCategories || []}
                onCancel={productForm.handleCancel}
                onSubmit={productForm.onSubmit}
                onCreateProduct={productForm.handleCreateProduct}
                addSize={productForm.addSize}
                removeSize={productForm.removeSize}
                addColor={productForm.addColor}
                removeColor={productForm.removeColor}
                toggleLottery={productForm.toggleLottery}
                selectAllLotteries={selectAllLotteriesAdapter}
                deselectAllLotteries={productForm.deselectAllLotteries}
                addPrintArea={addPrintAreaAdapter}
                updatePrintArea={productForm.updatePrintArea}
                removePrintArea={productForm.removePrintArea}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminProductsPage;

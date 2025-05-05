import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  useProducts,
  syncProductsToSupabase,
} from '@/services/productService';
import { useLotteries } from '@/services/lotteryService';
import { useVisualCategories } from '@/services/visualCategoryService';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ProductColumn } from '@/components/admin/products/ProductColumn';
import EnhancedProductForm from '@/components/admin/products/EnhancedProductForm';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from '@/lib/validations/product';
import { Product } from '@/types/database.types';
import { supabaseToAppProduct } from '@/lib/dataConverters';
import { useAuth } from '@/contexts/AuthContext';

const AdminProductsPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { products, loading, error, refreshProducts } = useProducts();
  const { lotteries } = useLotteries();
  const { visualCategories } = useVisualCategories();
  const [activeLotteries, setActiveLotteries] = useState<ExtendedLottery[]>([]);
  const [selectedLotteries, setSelectedLotteries] = useState<string[]>([]);
  
  // Use auth context
  const { isAdmin } = useAuth();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      secondaryImage: "",
      sizes: [],
      colors: [],
      visualCategoryId: null,
      linkedLotteries: [],
      printAreas: []
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (error) {
      toast.error(`Erreur lors du chargement des produits: ${error.message}`);
    }
  }, [error]);

  useEffect(() => {
    // Initialize activeLotteries when lotteries data is available
    if (lotteries) {
      setActiveLotteries(lotteries);
    }
  }, [lotteries]);

  useEffect(() => {
    // When a product is selected, populate the form with its data
    if (selectedProductId && products) {
      const productToEdit = products.find(product => product.id === selectedProductId);
      if (productToEdit) {
        form.reset(productToEdit);
        // Convert lottery IDs from numbers to strings
        const lotteryIds = productToEdit.linkedLotteries ? 
          productToEdit.linkedLotteries.map(id => String(id)) : 
          [];
        setSelectedLotteries(lotteryIds);
      }
    }
  }, [selectedProductId, products, form]);

  const onCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      image: "",
      secondaryImage: "",
      sizes: [],
      colors: [],
      visualCategoryId: null,
      linkedLotteries: [],
      printAreas: []
    });
  };

  const onEditProduct = (id: number) => {
    setIsCreating(false);
    setSelectedProductId(id);
  };

  const onCancel = () => {
    setIsCreating(false);
    setSelectedProductId(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (isCreating) {
        await createProduct(data);
        toast.success('Produit créé avec succès!');
      } else if (selectedProductId) {
        await updateProduct(selectedProductId, data);
        toast.success('Produit mis à jour avec succès!');
      }
      await refreshProducts();
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Erreur lors de la soumission du formulaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const onDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      toast.success('Produit supprimé avec succès!');
      await refreshProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Erreur lors de la suppression du produit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addSize = (size: string) => {
    if (!form.getValues().sizes.includes(size)) {
      form.setValue("sizes", [...form.getValues().sizes, size]);
    }
  };

  const removeSize = (size: string) => {
    form.setValue("sizes", form.getValues().sizes.filter((s: string) => s !== size));
  };

  const addColor = (color: string) => {
    if (!form.getValues().colors.includes(color)) {
      form.setValue("colors", [...form.getValues().colors, color]);
    }
  };

  const removeColor = (color: string) => {
    form.setValue("colors", form.getValues().colors.filter((c: string) => c !== color));
  };

  const toggleLottery = (lotteryId: string) => {
    const linkedLotteries = form.getValues().linkedLotteries || [];
    if (linkedLotteries.includes(lotteryId)) {
      form.setValue("linkedLotteries", linkedLotteries.filter((id: string) => id !== lotteryId));
    } else {
      form.setValue("linkedLotteries", [...linkedLotteries, lotteryId]);
    }
  };

  const selectAllLotteries = () => {
    const allLotteryIds = activeLotteries.map(lottery => String(lottery.id));
    form.setValue("linkedLotteries", allLotteryIds);
  };

  const deselectAllLotteries = () => {
    form.setValue("linkedLotteries", []);
  };
  
  const addPrintArea = (printArea: any) => {
    const printAreas = form.getValues().printAreas || [];
    const newId = printAreas.length > 0 ? Math.max(...printAreas.map((a: any) => a.id)) + 1 : 1;
    form.setValue("printAreas", [...printAreas, { ...printArea, id: newId }]);
  };
  
  const updatePrintArea = (id: number, data: Partial<any>) => {
    const printAreas = form.getValues().printAreas || [];
    const updatedAreas = printAreas.map((area: any) => area.id === id ? { ...area, ...data } : area);
    form.setValue("printAreas", updatedAreas);
  };
  
  const removePrintArea = (id: number) => {
    const printAreas = form.getValues().printAreas || [];
    const filteredAreas = printAreas.filter((area: any) => area.id !== id);
    form.setValue("printAreas", filteredAreas);
  };

  // Handler function that converts boolean result to void return
  const handleRefreshProducts = async () => {
    try {
      const success = await syncProductsToSupabase();
      if (success) {
        await refreshProducts();
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  const columns: ProductColumn[] = [
    {
      accessorKey: 'name',
      header: 'Nom',
    },
    {
      accessorKey: 'price',
      header: 'Prix',
    },
    {
      accessorKey: 'visualCategoryId',
      header: 'Catégorie',
      cell: ({ row }) => {
        const visualCategory = row.original.visualCategory;
        return visualCategory?.name || '';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEditProduct(row.original.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteProduct(row.original.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

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
              onClick={onCreateProduct}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const success = await syncProductsToSupabase();
                if (success) {
                  await handleRefreshProducts();
                }
              }}
              className="border-winshirt-purple/30 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchroniser
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              <Card className="p-6">
                {loading ? (
                  <div className="text-center">Chargement des produits...</div>
                ) : error ? (
                  <div className="text-center text-red-500">Erreur: {error.message}</div>
                ) : (
                  <DataTable columns={columns} data={products || []} />
                )}
              </Card>
            </div>

            <div className="col-span-1">
              <EnhancedProductForm
                isCreating={isCreating}
                selectedProductId={selectedProductId}
                form={form}
                activeLotteries={activeLotteries}
                visualCategories={visualCategories || []}
                onCancel={onCancel}
                onSubmit={onSubmit}
                onCreateProduct={onCreateProduct}
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

export default AdminProductsPage;

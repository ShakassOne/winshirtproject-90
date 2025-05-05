
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Edit, Search, RefreshCw } from "lucide-react";
import { ExtendedProduct } from '@/types/product';
import { getVisualCategoryName } from '@/utils/visualUtils';

interface ProductTableProps {
  products: ExtendedProduct[];
  loading: boolean;
  onEditProduct: (product: ExtendedProduct) => void;
  onDeleteProduct: (productId: number) => void;
  onCreateProduct: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  loading, 
  onEditProduct, 
  onDeleteProduct,
  onCreateProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visualCategories, setVisualCategories] = useState<Record<number, string>>({});
  
  // Load visual categories from localStorage for display
  React.useEffect(() => {
    try {
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        const categories = JSON.parse(storedCategories);
        const categoryMap: Record<number, string> = {};
        
        if (Array.isArray(categories)) {
          categories.forEach((cat: any) => {
            if (cat.id && cat.name) {
              categoryMap[cat.id] = cat.name;
            }
          });
        }
        
        setVisualCategories(categoryMap);
      }
    } catch (error) {
      console.error("Error loading visual categories:", error);
    }
  }, []);
  
  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get category name helper function
  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId) return 'Aucune';
    return visualCategories[categoryId] || `Catégorie #${categoryId}`;
  };
  
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <div className="winshirt-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Produits</h2>
        <div className="flex gap-2">
          <Button onClick={handleReload} variant="outline" size="icon">
            <RefreshCw size={16} />
          </Button>
          <Button onClick={onCreateProduct} className="bg-winshirt-blue hover:bg-winshirt-blue-dark">
            <Plus size={16} className="mr-1" /> Nouveau produit
          </Button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 bg-winshirt-space-light border-winshirt-purple/30 text-white"
        />
      </div>
      
      <div className="rounded-md border border-winshirt-purple/30 overflow-hidden">
        <Table>
          <TableHeader className="bg-winshirt-space-light">
            <TableRow>
              <TableHead className="text-white">Nom</TableHead>
              <TableHead className="text-white">Prix</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Personnalisable</TableHead>
              <TableHead className="text-white">Catégorie visuelle</TableHead>
              <TableHead className="text-white w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  Chargement des produits...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  Aucun produit trouvé. {searchTerm && "Essayez une recherche différente ou "}
                  <Button 
                    onClick={onCreateProduct} 
                    variant="link" 
                    className="px-0 text-winshirt-blue hover:text-winshirt-blue-dark"
                  >
                    créez un nouveau produit
                  </Button>.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-t border-winshirt-purple/20 hover:bg-winshirt-space-light/50">
                  <TableCell className="font-medium text-white">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-white">{product.price.toFixed(2)} €</TableCell>
                  <TableCell className="text-white">{product.type}</TableCell>
                  <TableCell className="text-white">
                    {product.allowCustomization ? "Oui" : "Non"}
                  </TableCell>
                  <TableCell className="text-white">
                    {getCategoryName(product.visualCategoryId)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        onClick={() => onEditProduct(product)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-winshirt-purple hover:text-winshirt-purple-light hover:bg-transparent"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => onDeleteProduct(product.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-transparent"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;

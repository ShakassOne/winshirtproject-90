
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Palette } from "lucide-react";
import { ExtendedProduct } from '@/types/product';
import { Badge } from '@/components/ui/badge';

interface ProductListProps {
  products: ExtendedProduct[];
  selectedProductId: number | null;
  onCreateProduct: () => void;
  onEditProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  selectedProductId,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrer les produits par nom ou description
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="winshirt-card p-6 h-full">
      <h2 className="text-2xl font-bold text-white mb-6">Liste des Produits</h2>
      
      <Button
        className="w-full mb-6 bg-winshirt-purple hover:bg-winshirt-purple-dark"
        onClick={onCreateProduct}
      >
        <Plus className="mr-2 h-4 w-4" />
        Créer un nouveau produit
      </Button>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Aucun produit trouvé</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className={`border p-3 rounded-md cursor-pointer transition-colors ${
                selectedProductId === product.id
                  ? 'border-winshirt-purple bg-winshirt-space-light'
                  : 'border-gray-700 hover:border-winshirt-purple/50'
              }`}
              onClick={() => onEditProduct(product.id)}
            >
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 overflow-hidden rounded bg-gray-800 flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No img
                    </div>
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white text-ellipsis overflow-hidden whitespace-nowrap">
                      {product.name}
                    </h3>
                    {product.allowCustomization && (
                      <Badge className="bg-winshirt-blue-light text-xs flex items-center gap-1">
                        <Palette size={10} />
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {product.price.toFixed(2)} € - {product.type}
                  </p>
                  
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {product.productType && (
                      <span className="text-xs bg-winshirt-space px-1.5 py-0.5 rounded text-gray-300">
                        {product.productType}
                      </span>
                    )}
                    {product.tickets && (
                      <span className="text-xs bg-winshirt-purple/30 text-winshirt-purple-light px-1.5 py-0.5 rounded">
                        {product.tickets} {product.tickets > 1 ? 'tickets' : 'ticket'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product.id);
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;

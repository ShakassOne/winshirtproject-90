
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { ExtendedProduct } from '@/types/product';

interface ProductSelectionProps {
  products: ExtendedProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  selectedProducts,
  onToggleProduct,
  onSelectAll,
  onDeselectAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-2">
        <FormLabel className="text-white">Produits associés</FormLabel>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            className="border-winshirt-blue/30 text-winshirt-blue-light hover:bg-winshirt-blue/20"
          >
            Tout sélectionner
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onDeselectAll}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Tout désélectionner
          </Button>
        </div>
      </div>
      
      {/* Product search */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher des produits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-winshirt-space-light border-winshirt-purple/30"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
        {filteredProducts.map(product => {
          const isSelected = selectedProducts.includes(product.id.toString());
          return (
            <div 
              key={product.id}
              className={`p-3 rounded-lg cursor-pointer flex items-center ${isSelected ? 'bg-winshirt-blue/30' : 'bg-winshirt-space-light'}`}
              onClick={() => onToggleProduct(product.id.toString())}
            >
              <div className="mr-3 flex items-center justify-center w-5 h-5">
                {isSelected ? (
                  <Check size={16} className="text-winshirt-blue-light" />
                ) : (
                  <div className="w-4 h-4 border border-gray-400 rounded" />
                )}
              </div>
              <div className="flex items-center flex-grow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded mr-3"
                />
                <div>
                  <h4 className="font-medium text-white">{product.name}</h4>
                  <p className="text-sm text-gray-400">
                    {product.type && <span className="mr-2">{product.type}</span>}
                    <span>Prix: {product.price.toFixed(2)} €</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredProducts.length === 0 && (
          <p className="text-gray-400 text-center py-4">Aucun produit ne correspond à votre recherche</p>
        )}
      </div>
    </div>
  );
};

export default ProductSelection;

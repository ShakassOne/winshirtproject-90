
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shirt, Trash, Plus } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';

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
  return (
    <div className="winshirt-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Produits</h2>
        <Button 
          onClick={onCreateProduct}
          className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
        >
          <Plus size={16} className="mr-1" /> Nouveau
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {products.map(product => (
          <div 
            key={product.id}
            className={`p-4 rounded-lg transition-colors flex items-center justify-between ${selectedProductId === product.id ? 'bg-winshirt-purple/20' : 'bg-winshirt-space-light hover:bg-winshirt-space-light/70'}`}
          >
            <div 
              className="flex items-center cursor-pointer flex-grow"
              onClick={() => onEditProduct(product.id)}
            >
              <Shirt className="mr-3 text-winshirt-purple-light" />
              <div>
                <h3 className="font-medium text-white">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.price.toFixed(2)} €</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProduct(product.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash size={16} />
            </Button>
          </div>
        ))}
        
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucun produit disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

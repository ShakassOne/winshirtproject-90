
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="winshirt-card overflow-hidden h-full flex flex-col hover:shadow-lg hover:shadow-winshirt-purple/20 transition-all duration-300">
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {product.allowCustomization && (
            <Badge className="absolute top-2 right-2 bg-winshirt-blue-light text-white flex items-center gap-1">
              <Palette size={14} />
              <span>Personnalisable</span>
            </Badge>
          )}

          {product.tickets && product.tickets > 0 && (
            <Badge className="absolute bottom-2 left-2 bg-winshirt-purple text-white">
              {product.tickets} {product.tickets > 1 ? 'tickets' : 'ticket'}
            </Badge>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3 flex-grow">
            {product.description}
          </p>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-lg font-bold text-winshirt-purple-light">
              {product.price.toFixed(2)} €
            </span>
            {product.productType && (
              <span className="text-xs text-gray-400 bg-winshirt-space-light px-2 py-1 rounded">
                {product.productType}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

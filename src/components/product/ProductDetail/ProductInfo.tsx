
import React from 'react';
import { Ticket } from 'lucide-react';

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  tickets?: number;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ name, price, description, tickets }) => {
  return (
    <div className="space-y-6">
      {/* Product Title and Price */}
      <div>
        <h1 className="text-3xl font-bold text-white">{name}</h1>
        <div className="flex items-center mt-2">
          <span className="text-2xl font-bold text-winshirt-purple-light">{price.toFixed(2)} €</span>
          {tickets && tickets > 0 && (
            <span className="ml-2 bg-winshirt-purple text-white text-sm px-2 py-1 rounded-full flex items-center">
              <Ticket size={14} className="mr-1" />
              {tickets} {tickets > 1 ? 'tickets' : 'ticket'}
            </span>
          )}
        </div>
      </div>
      
      {/* Product Description */}
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default ProductInfo;

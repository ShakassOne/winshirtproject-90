
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="winshirt-card winshirt-card-hover h-full flex flex-col">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-60 object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-winshirt-purple-dark/80 text-white px-3 py-1 rounded-tl-lg">
          {product.price.toFixed(2)} €
        </div>
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-medium text-white truncate">{product.name}</h3>
        <div className="mt-2 border-t border-winshirt-purple/20 pt-2">
          <p className="text-xs text-gray-400">Participe à la loterie</p>
          <div className="flex items-center mt-1 space-x-2">
            <img 
              src={product.lotteryImage || 'https://placehold.co/100x100/png'} 
              alt={product.lotteryName || 'Loterie'} 
              className="w-8 h-8 rounded-full object-cover border border-winshirt-purple/50"
            />
            <span className="text-sm text-winshirt-blue-light">{product.lotteryName || 'Sélectionnez une loterie'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 justify-between">
        <Link to={`/products/${product.id}`}>
          <Button variant="outline" size="sm" className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/20">
            Détails
          </Button>
        </Link>
        <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

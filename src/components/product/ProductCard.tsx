
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Ajouter au panier sans ouvrir la page détaillée
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} ajouté au panier`);
  };

  // Gérer l'affichage des étoiles de notation
  const renderRating = (rating: number = 4) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${i < rating ? 'text-winshirt-purple' : 'text-gray-400'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  // Afficher les variantes de couleurs disponibles
  const renderColorOptions = () => {
    return (
      <div className="flex mt-2 space-x-1">
        {(product.colors || []).slice(0, 4).map((color) => (
          <span
            key={color}
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: color.toLowerCase() }}
          ></span>
        ))}
      </div>
    );
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-winshirt-space rounded-lg overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative overflow-hidden">
          {/* Badge de promotion si applicable */}
          {product.price > 50 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-winshirt-pink text-black">-50€</Badge>
            </div>
          )}

          {/* Image du produit */}
          <img 
            src={product.image || 'https://placehold.co/600x400/png'} 
            alt={product.name} 
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay avec boutons d'action */}
          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col gap-2">
              <Button 
                size="sm"
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ajouter au panier
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-winshirt-purple"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir le détail
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {/* Nom et prix */}
          <div className="mb-2 text-center">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{product.productType}</h3>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h2>
            <p className="text-winshirt-purple-light font-bold">{product.price.toFixed(2)} €</p>
          </div>

          {/* Évaluation */}
          <div className="flex justify-center mb-2">
            {renderRating(4)}
          </div>

          {/* Options de couleur */}
          <div className="flex justify-center">
            {renderColorOptions()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

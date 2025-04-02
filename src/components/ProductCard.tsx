
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLottery, setSelectedLottery] = useState<number | null>(
    product.linkedLotteries && product.linkedLotteries.length > 0 
      ? product.linkedLotteries[0] 
      : null
  );

  // Vérifier que le produit existe avant de l'afficher
  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
    // Ici, vous ajouteriez la logique pour ajouter le produit au panier
    // avec les options sélectionnées
    toast.success(`${product.name} ajouté au panier`, {
      description: `Taille: ${selectedSize}, Couleur: ${selectedColor}`,
      duration: 3000
    });
    setIsDialogOpen(false);
    
    // Réinitialiser les sélections
    setSelectedSize('');
    setSelectedColor('');
  };

  return (
    <>
      <Card className="winshirt-card winshirt-card-hover h-full flex flex-col">
        <Link to={`/products/${product.id}`} className="relative cursor-pointer block">
          <img 
            src={product.image || 'https://placehold.co/600x400/png'} 
            alt={product.name} 
            className="w-full h-60 object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-winshirt-purple-dark/80 text-white px-3 py-1 rounded-tl-lg">
            {product.price.toFixed(2)} €
          </div>
        </Link>
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
          <Button 
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog pour les options du produit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-winshirt-blue-light">
              Options pour {product.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Sélection de taille */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">Taille</label>
                <RadioGroup 
                  value={selectedSize} 
                  onValueChange={setSelectedSize}
                  className="flex flex-wrap gap-2"
                >
                  {product.sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={`size-${size}`} className="text-winshirt-purple" />
                      <label 
                        htmlFor={`size-${size}`} 
                        className="text-sm cursor-pointer"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            {/* Sélection de couleur */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">Couleur</label>
                <ToggleGroup 
                  type="single" 
                  value={selectedColor} 
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-2"
                >
                  {product.colors.map((color) => (
                    <ToggleGroupItem 
                      key={color} 
                      value={color}
                      className="bg-winshirt-space-light border border-winshirt-purple/20 data-[state=on]:bg-winshirt-purple/20 data-[state=on]:border-winshirt-purple"
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: color.toLowerCase() }} 
                      />
                      {color}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
            
            {/* Sélection de loterie */}
            {product.linkedLotteries && product.linkedLotteries.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">Loterie</label>
                <RadioGroup value={String(selectedLottery)} onValueChange={(value) => setSelectedLottery(Number(value))}>
                  {product.linkedLotteries.map((lotteryId) => (
                    <div key={lotteryId} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(lotteryId)} id={`lottery-${lotteryId}`} className="text-winshirt-purple" />
                      <label 
                        htmlFor={`lottery-${lotteryId}`} 
                        className="text-sm cursor-pointer"
                      >
                        Loterie #{lotteryId}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-winshirt-purple/30 text-winshirt-blue-light hover:bg-winshirt-purple/10"
            >
              Annuler
            </Button>
            <Button 
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              onClick={handleConfirmAddToCart}
              disabled={
                (product.sizes && product.sizes.length > 0 && !selectedSize) || 
                (product.colors && product.colors.length > 0 && !selectedColor)
              }
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;

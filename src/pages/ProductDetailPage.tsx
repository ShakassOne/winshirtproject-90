
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';
import { mockProducts, mockLotteries } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';
import { toast } from '@/lib/toast';
import { ExtendedProduct } from '@/types/product';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ExtendedProduct | undefined>(undefined);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLottery, setSelectedLottery] = useState<string>('');
  
  // Charger le produit
  useEffect(() => {
    // D'abord, essayer de le charger depuis localStorage
    const loadProduct = () => {
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts) as ExtendedProduct[];
          const foundProduct = parsedProducts.find(p => p.id === Number(id));
          
          if (foundProduct) {
            setProduct(foundProduct);
            return;
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Fallback aux données mock
      const mockProduct = mockProducts.find(p => p.id === Number(id)) as ExtendedProduct;
      setProduct(mockProduct);
    };
    
    loadProduct();
  }, [id]);
  
  if (!product) {
    return (
      <div className="pt-32 pb-8 text-center">
        <h1 className="text-2xl text-white">Produit en cours de chargement ou non trouvé</h1>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Veuillez sélectionner une taille");
      return;
    }
    
    if (!selectedColor) {
      toast.error("Veuillez sélectionner une couleur");
      return;
    }
    
    if (!selectedLottery) {
      toast.error("Veuillez sélectionner une loterie");
      return;
    }
    
    toast.success("Produit ajouté au panier!");
    
    // Dans une application réelle, vous ajouteriez ici la logique pour ajouter au panier
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                  <p className="text-2xl text-winshirt-purple-light">{product.price.toFixed(2)} €</p>
                </div>
                
                <p className="text-gray-300">{product.description}</p>
                
                {/* Size Selection */}
                <div className="space-y-2">
                  <Label htmlFor="size-select" className="text-white">Taille</Label>
                  <Select
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger id="size-select" className="bg-winshirt-space-light border-winshirt-purple/30">
                      <SelectValue placeholder="Sélectionner une taille" />
                    </SelectTrigger>
                    <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                      {product.sizes && product.sizes.length > 0 ? (
                        product.sizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="unique">Taille unique</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Color Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Couleur</Label>
                  <RadioGroup
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    className="flex flex-wrap gap-4"
                  >
                    {product.colors && product.colors.length > 0 ? (
                      product.colors.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={color} 
                            id={`color-${color}`} 
                            className="bg-winshirt-space-light border-winshirt-purple/30"
                          />
                          <Label htmlFor={`color-${color}`} className="capitalize text-gray-300">
                            {color}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="default" 
                          id="color-default" 
                          className="bg-winshirt-space-light border-winshirt-purple/30"
                        />
                        <Label htmlFor="color-default" className="text-gray-300">
                          Couleur standard
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>
                
                {/* Lottery Selection */}
                <div className="space-y-2">
                  <Label htmlFor="lottery-select" className="text-white">Loterie associée</Label>
                  <Select
                    value={selectedLottery}
                    onValueChange={setSelectedLottery}
                  >
                    <SelectTrigger id="lottery-select" className="bg-winshirt-space-light border-winshirt-purple/30">
                      <SelectValue placeholder="Sélectionner une loterie" />
                    </SelectTrigger>
                    <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                      {mockLotteries
                        .filter(lottery => lottery.status === 'active')
                        .map((lottery) => (
                          <SelectItem key={lottery.id} value={lottery.id.toString()}>
                            {lottery.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">
                    Chaque achat de produit vous donne droit à une participation à la loterie de votre choix
                  </p>
                </div>
                
                {/* Add to Cart */}
                <Button 
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Ticket, Truck, Weight } from 'lucide-react';
import { mockProducts, mockLotteries } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';
import { toast } from '@/lib/toast';
import { ExtendedProduct } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { VisualCategory, Visual } from '@/types/visual';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Nouveaux imports pour la sélection de visuels
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisualSelector from '@/components/product/VisualSelector';
import VisualPositioner from '@/components/product/VisualPositioner';
import { useVisualSelector } from '@/hooks/useVisualSelector';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ExtendedProduct | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  const [categoryVisuals, setCategoryVisuals] = useState<Visual[]>([]);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  // Tableau de loteries sélectionnées pour gérer plusieurs tickets
  const [selectedLotteries, setSelectedLotteries] = useState<string[]>([]);
  
  // Nouveau state pour le visuel sélectionné
  const { 
    selectedVisual, 
    visualSettings, 
    handleSelectVisual, 
    handleUpdateSettings 
  } = useVisualSelector();
  
  // Charger le produit
  useEffect(() => {
    const loadProduct = () => {
      setLoading(true);
      
      // D'abord, essayer de le charger depuis localStorage
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts) as ExtendedProduct[];
          const foundProduct = parsedProducts.find(p => p.id === Number(id));
          
          if (foundProduct) {
            setProduct(foundProduct);
            // Initialiser le tableau des loteries sélectionnées
            setSelectedLotteries(Array(foundProduct.tickets || 1).fill(''));
            setLoading(false);
            
            // Charger les catégories visuelles et les visuels associés
            if (foundProduct.visualCategoryId) {
              loadVisualsByCategory(foundProduct.visualCategoryId);
            }
            return;
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Fallback aux données mock
      const mockProduct = mockProducts.find(p => p.id === Number(id)) as ExtendedProduct;
      setProduct(mockProduct);
      // Initialiser le tableau des loteries sélectionnées
      setSelectedLotteries(Array(mockProduct?.tickets || 1).fill(''));
      setLoading(false);
      
      if (mockProduct && mockProduct.visualCategoryId) {
        loadVisualsByCategory(mockProduct.visualCategoryId);
      }
    };
    
    loadProduct();
  }, [id]);
  
  // Charger les catégories de visuels
  useEffect(() => {
    const loadVisualCategories = () => {
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories)) {
            setVisualCategories(parsedCategories);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des catégories de visuels:", error);
        }
      }
    };
    
    loadVisualCategories();
  }, []);
  
  // Charger les visuels d'une catégorie spécifique
  const loadVisualsByCategory = (categoryId: number) => {
    const storedVisuals = localStorage.getItem('visuals');
    if (storedVisuals) {
      try {
        const parsedVisuals = JSON.parse(storedVisuals) as Visual[];
        const filteredVisuals = parsedVisuals.filter(visual => 
          visual.categoryId === categoryId
        );
        setCategoryVisuals(filteredVisuals);
      } catch (error) {
        console.error("Erreur lors du chargement des visuels:", error);
      }
    }
  };
  
  // Mise à jour d'une loterie spécifique dans le tableau des loteries sélectionnées
  const handleLotteryChange = (lotteryId: string, index: number) => {
    const newSelectedLotteries = [...selectedLotteries];
    newSelectedLotteries[index] = lotteryId;
    setSelectedLotteries(newSelectedLotteries);
  };
  
  if (loading) {
    return (
      <div className="pt-32 pb-8 text-center">
        <h1 className="text-2xl text-white">Chargement du produit...</h1>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="pt-32 pb-8 text-center">
        <h1 className="text-2xl text-white">Produit non trouvé</h1>
        <Button 
          onClick={() => navigate('/products')}
          className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
        >
          Retour aux produits
        </Button>
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
    
    // Vérification de chaque sélection de loterie
    for (let i = 0; i < (product.tickets || 1); i++) {
      if (!selectedLotteries[i]) {
        toast.error(`Veuillez sélectionner une loterie pour le ticket ${i + 1}`);
        return;
      }
    }
    
    // Récupérer le panier actuel
    const cartString = localStorage.getItem('cart');
    const cart = cartString ? JSON.parse(cartString) : [];
    
    // Obtenir les informations des loteries sélectionnées
    const selectedLotteriesInfo = selectedLotteries.map(lotteryId => {
      const lottery = mockLotteries.find(l => l.id.toString() === lotteryId);
      return {
        id: parseInt(lotteryId),
        name: lottery?.title || "Loterie inconnue"
      };
    });
    
    // Ajouter le produit au panier avec toutes les loteries sélectionnées et le visuel si présent
    const cartItem = {
      id: Date.now(), // ID unique pour cet élément du panier
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      image: product.image,
      secondaryImage: product.secondaryImage, // Inclure l'image secondaire si présente
      tickets: product.tickets || 1,
      selectedLotteries: selectedLotteriesInfo, // Tableau des loteries sélectionnées
      // Ajouter les informations du visuel sélectionné
      visualDesign: selectedVisual ? {
        visualId: selectedVisual.id,
        visualName: selectedVisual.name,
        visualImage: selectedVisual.image,
        settings: visualSettings
      } : null
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    toast.success("Produit ajouté au panier!");
    
    // Inciter à aller au panier
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };
  
  // Récupérer les loteries actives
  const activeLotteries = mockLotteries.filter(lottery => lottery.status === 'active');
  
  // Préparer les images pour le carrousel
  const productImages = [product.image];
  if (product.secondaryImage) {
    productImages.push(product.secondaryImage);
  }
  
  // Vérifier si la personnalisation est permise
  const canCustomize = product.allowCustomization !== false && product.visualCategoryId && categoryVisuals.length > 0;
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Image Carousel with Visual Overlay */}
              <div className="rounded-lg overflow-hidden">
                {canCustomize ? (
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                      <TabsTrigger value="preview">Aperçu</TabsTrigger>
                      <TabsTrigger value="customize">Personnaliser</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="mt-0">
                      <VisualPositioner
                        productImage={product.image}
                        visual={selectedVisual}
                        visualSettings={visualSettings}
                        onUpdateSettings={handleUpdateSettings}
                        readOnly={true}
                      />
                    </TabsContent>
                    
                    <TabsContent value="customize" className="mt-0 space-y-6">
                      <VisualPositioner
                        productImage={product.image}
                        visual={selectedVisual}
                        visualSettings={visualSettings}
                        onUpdateSettings={handleUpdateSettings}
                      />
                      
                      <VisualSelector
                        selectedVisualId={selectedVisual?.id || null}
                        onSelectVisual={handleSelectVisual}
                        categoryId={product.visualCategoryId}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {productImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="flex items-center justify-center p-1">
                            <img 
                              src={image} 
                              alt={`${product.name} ${index === 0 ? 'principale' : 'secondaire'}`} 
                              className="rounded-lg max-h-[500px] object-contain w-full"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {productImages.length > 1 && (
                      <>
                        <CarouselPrevious className="text-white" />
                        <CarouselNext className="text-white" />
                      </>
                    )}
                  </Carousel>
                )}
              </div>
              
              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl text-winshirt-purple-light">{product.price.toFixed(2)} €</p>
                    
                    {/* Display delivery price if available */}
                    {product.deliveryPrice && (
                      <div className="flex items-center text-gray-300">
                        <Truck size={16} className="mr-1" />
                        <span>Livraison: {product.deliveryPrice.toFixed(2)} €</span>
                      </div>
                    )}
                    
                    {/* Display weight if available */}
                    {product.weight && (
                      <div className="flex items-center text-gray-300">
                        <Weight size={16} className="mr-1" />
                        <span>{product.weight}g</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tickets info */}
                  {(product.tickets && product.tickets > 1) ? (
                    <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-md p-2 flex items-center">
                      <Ticket className="text-blue-400 mr-2" size={18} />
                      <p className="text-blue-100">
                        Ce produit vous offre {product.tickets} tickets de participation à des loteries
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-md p-2 flex items-center">
                      <Ticket className="text-blue-400 mr-2" size={18} />
                      <p className="text-blue-100">
                        Ce produit vous offre 1 ticket de participation à une loterie
                      </p>
                    </div>
                  )}
                  
                  {/* Information sur la personnalisation */}
                  {canCustomize && (
                    <div className="mt-2 bg-winshirt-purple/10 border border-winshirt-purple/30 rounded-md p-2">
                      <p className="text-gray-200">
                        Personnalisez votre {product.name} avec un visuel dans l'onglet "Personnaliser".
                      </p>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-300">{product.description}</p>
                
                {/* Delivery info section */}
                {(product.weight || product.deliveryPrice) && (
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold text-white flex items-center mb-2">
                      <Truck size={18} className="mr-2" /> Informations de livraison
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      {product.weight && (
                        <div className="flex items-center">
                          <Weight size={14} className="mr-1" /> 
                          <span>Poids: {product.weight}g</span>
                        </div>
                      )}
                      {product.deliveryPrice && (
                        <div className="flex items-center">
                          <Truck size={14} className="mr-1" /> 
                          <span>Frais: {product.deliveryPrice.toFixed(2)} €</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
                
                {/* Multiple Lottery Selections - One per ticket */}
                {Array.from({ length: product.tickets || 1 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`lottery-select-${index}`} className="text-white flex items-center">
                      <Ticket className="mr-2" size={16} />
                      {product.tickets && product.tickets > 1 
                        ? `Loterie ${index + 1} sur ${product.tickets}` 
                        : "Loterie associée"}
                    </Label>
                    <Select
                      value={selectedLotteries[index]}
                      onValueChange={(value) => handleLotteryChange(value, index)}
                    >
                      <SelectTrigger 
                        id={`lottery-select-${index}`} 
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      >
                        <SelectValue placeholder="Sélectionner une loterie" />
                      </SelectTrigger>
                      <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                        {activeLotteries.map((lottery) => (
                          <SelectItem key={`${lottery.id}-${index}`} value={lottery.id.toString()}>
                            {lottery.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">
                      Chaque ticket vous donne droit à une participation à la loterie de votre choix
                    </p>
                  </div>
                ))}
                
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

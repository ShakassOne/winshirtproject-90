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
import { ExtendedProduct, PrintArea } from '@/types/product';
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
import { useVisuals } from '@/data/mockVisuals';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ExtendedProduct | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { getCategories } = useVisuals();
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  // Tableau de loteries sélectionnées pour gérer plusieurs tickets
  const [selectedLotteries, setSelectedLotteries] = useState<string[]>([]);
  
  // Pour gérer la zone d'impression sélectionnée
  const [selectedPrintArea, setSelectedPrintArea] = useState<PrintArea | null>(null);
  
  // Nouveau state pour le visuel sélectionné avec settings initiaux si disponibles
  const { 
    selectedVisual, 
    visualSettings, 
    handleSelectVisual, 
    handleUpdateSettings,
    activePosition,
    setPosition
  } = useVisualSelector(
    product?.defaultVisualId || null,
    product?.defaultVisualSettings || undefined,
    product?.printAreas
  );
  
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
            // Définir la catégorie par défaut si elle existe
            if (foundProduct.visualCategoryId) {
              setSelectedCategoryId(foundProduct.visualCategoryId);
            }
            // Initialiser le tableau des loteries sélectionnées
            setSelectedLotteries(Array(foundProduct.tickets || 1).fill(''));
            
            // Initialiser la zone d'impression si disponible
            if (foundProduct.printAreas && foundProduct.printAreas.length > 0) {
              setSelectedPrintArea(foundProduct.printAreas[0]);
            }
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Fallback aux données mock
      const mockProduct = mockProducts.find(p => p.id === Number(id)) as ExtendedProduct;
      if (mockProduct?.visualCategoryId) {
        setSelectedCategoryId(mockProduct.visualCategoryId);
      }
      setProduct(mockProduct);
      // Initialiser le tableau des loteries sélectionnées
      setSelectedLotteries(Array(mockProduct?.tickets || 1).fill(''));
      setLoading(false);
    };
    
    loadProduct();
  }, [id]);
  
  // Charger les catégories de visuels
  useEffect(() => {
    const loadVisualCategories = () => {
      // Charger depuis useVisuals hook
      setVisualCategories(getCategories());
      
      // Fallback aux données localStorage si nécessaire
      if (visualCategories.length === 0) {
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
      }
    };
    
    loadVisualCategories();
  }, [getCategories]);
  
  // Mise à jour d'une loterie spécifique dans le tableau des loteries sélectionnées
  const handleLotteryChange = (lotteryId: string, index: number) => {
    const newSelectedLotteries = [...selectedLotteries];
    newSelectedLotteries[index] = lotteryId;
    setSelectedLotteries(newSelectedLotteries);
  };
  
  // Gérer le changement de zone d'impression
  const handlePrintAreaChange = (areaId: number) => {
    if (product && product.printAreas) {
      const selectedArea = product.printAreas.find(area => area.id === areaId);
      if (selectedArea) {
        setSelectedPrintArea(selectedArea);
      }
    }
  };
  
  // Gérer le changement de catégorie de visuels
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };
  
  // Synchroniser le changement entre les onglets recto/verso avec le composant VisualPositioner
  const handleTabChange = (position: 'front' | 'back') => {
    setPosition(position);
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
        settings: visualSettings,
        printAreaId: selectedPrintArea ? selectedPrintArea.id : null
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
  
  // Vérifier si la personnalisation est permise - simplifié pour utiliser juste le flag allowCustomization
  const canCustomize = product.allowCustomization === true;
  
  // Vérifier si le produit a des zones d'impression
  const hasPrintAreas = product.printAreas && product.printAreas.length > 0;
  
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
                        productSecondaryImage={product.secondaryImage}
                        visual={selectedVisual}
                        visualSettings={visualSettings}
                        onUpdateSettings={handleUpdateSettings}
                        readOnly={true}
                        printAreas={product.printAreas}
                        selectedPrintArea={selectedPrintArea}
                      />
                    </TabsContent>
                    
                    <TabsContent value="customize" className="mt-0 space-y-6">
                      {/* Sélection de la catégorie de visuels */}
                      <div className="space-y-2">
                        <Label className="text-white">Catégorie de visuels</Label>
                        <Select
                          value={selectedCategoryId ? selectedCategoryId.toString() : ""}
                          onValueChange={(value) => handleCategoryChange(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                            {visualCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Sélecteur de visuel */}
                      <VisualSelector
                        selectedVisualId={selectedVisual?.id || null}
                        onSelectVisual={handleSelectVisual}
                        categoryId={selectedCategoryId}
                      />
                      
                      {/* Séparateur */}
                      {selectedVisual && <div className="border-t border-winshirt-purple/20 my-6"></div>}
                      
                      {/* Zone de positionnement du visuel */}
                      {selectedVisual && (
                        <>
                          <Tabs defaultValue={activePosition} onValueChange={(value) => handleTabChange(value as 'front' | 'back')} className="w-full">
                            <TabsList className="grid grid-cols-2 w-full">
                              <TabsTrigger value="front">Recto</TabsTrigger>
                              <TabsTrigger value="back">Verso</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="front" className="mt-0">
                              <VisualPositioner
                                productImage={product.image}
                                productSecondaryImage={product.secondaryImage}
                                visual={selectedVisual}
                                visualSettings={visualSettings}
                                onUpdateSettings={handleUpdateSettings}
                                printAreas={product.printAreas?.filter(area => area.position === 'front')}
                                selectedPrintArea={selectedPrintArea}
                              />
                            </TabsContent>
                            
                            <TabsContent value="back" className="mt-0">
                              <VisualPositioner
                                productImage={product.secondaryImage || product.image}
                                visual={selectedVisual}
                                visualSettings={visualSettings}
                                onUpdateSettings={handleUpdateSettings}
                                printAreas={product.printAreas?.filter(area => area.position === 'back')}
                                selectedPrintArea={selectedPrintArea}
                              />
                            </TabsContent>
                          </Tabs>
                          
                          {/* Sélection de la zone d'impression si disponible */}
                          {hasPrintAreas && (
                            <div className="space-y-2 mt-4">
                              <Label className="text-white">Zone d'impression</Label>
                              <Select
                                value={selectedPrintArea ? selectedPrintArea.id.toString() : ''}
                                onValueChange={(value) => handlePrintAreaChange(parseInt(value))}
                              >
                                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                                  <SelectValue placeholder="Choisir une zone d'impression" />
                                </SelectTrigger>
                                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                                  {product.printAreas?.filter(area => area.position === activePosition).map(area => (
                                    <SelectItem key={area.id} value={area.id.toString()}>
                                      {area.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  // Si la personnalisation n'est pas autorisée, montrer le carrousel d'images simple
                  <Carousel className="w-full">
                    <CarouselContent>
                      {productImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="flex justify-center items-center p-1">
                            <img
                              src={image}
                              alt={`${product.name} - Image ${index + 1}`}
                              className="max-h-96 object-contain"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-winshirt-purple" />
                    <CarouselNext className="text-winshirt-purple" />
                  </Carousel>
                )}
              </div>

              {/* Product Info and Options */}
              <div className="space-y-6">
                {/* Product Title and Price */}
                <div>
                  <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                  <div className="flex items-center mt-2">
                    <span className="text-2xl font-bold text-winshirt-purple-light">{product.price.toFixed(2)} €</span>
                    {product.tickets && product.tickets > 0 && (
                      <span className="ml-2 bg-winshirt-purple text-white text-sm px-2 py-1 rounded-full flex items-center">
                        <Ticket size={14} className="mr-1" />
                        {product.tickets} {product.tickets > 1 ? 'tickets' : 'ticket'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Product Description */}
                <p className="text-gray-300">{product.description}</p>
                
                {/* Size Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Taille</Label>
                  <RadioGroup 
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                    className="flex flex-wrap gap-2"
                  >
                    {product.sizes?.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="text-winshirt-purple"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="text-gray-200 cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Color Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Couleur</Label>
                  <RadioGroup 
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    className="flex flex-wrap gap-2"
                  >
                    {product.colors?.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={color}
                          id={`color-${color}`}
                          className="text-winshirt-purple"
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className="flex items-center cursor-pointer"
                        >
                          <span
                            className="w-4 h-4 mr-2 rounded-full border border-gray-600"
                            style={{ backgroundColor: color }}
                          ></span>
                          <span className="text-gray-200">{color}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Lottery Selection for tickets */}
                {product.tickets && product.tickets > 0 && (
                  <div className="space-y-4">
                    <Label className="text-white flex items-center">
                      <Ticket size={16} className="mr-2" />
                      Choisissez {product.tickets > 1 ? 'vos loteries' : 'votre loterie'}
                    </Label>
                    
                    {Array.from({ length: product.tickets }).map((_, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-sm text-gray-400">Ticket {index + 1}</Label>
                        <Select
                          value={selectedLotteries[index] || ''}
                          onValueChange={(value) => handleLotteryChange(value, index)}
                        >
                          <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                            <SelectValue placeholder="Choisir une loterie" />
                          </SelectTrigger>
                          <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                            {activeLotteries.map((lottery) => (
                              <SelectItem key={lottery.id} value={lottery.id.toString()}>
                                {lottery.title} - {lottery.value}€
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Additional Info */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {product.weight && (
                    <div className="flex items-center text-gray-400">
                      <Weight size={16} className="mr-2" />
                      <span>{product.weight}g</span>
                    </div>
                  )}
                  {product.deliveryPrice !== undefined && (
                    <div className="flex items-center text-gray-400">
                      <Truck size={16} className="mr-2" />
                      <span>
                        Livraison: {product.deliveryPrice > 0 
                          ? `${product.deliveryPrice.toFixed(2)} €` 
                          : 'Gratuite'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark py-6 mt-6"
                >
                  <ShoppingCart className="mr-2" />
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

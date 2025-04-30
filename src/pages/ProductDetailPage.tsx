import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts } from '@/data/mockData';
import { toast } from '@/lib/toast';
import { ExtendedProduct, PrintArea } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { Visual, VisualCategory } from '@/types/visual';
import StarBackground from '@/components/StarBackground';
import { useVisualSelector } from '@/hooks/useVisualSelector';
import { useVisuals } from '@/data/mockVisuals';
import { getLotteries } from '@/services/lotteryService';

// Import refactored components
import ProductGallery from '@/components/product/ProductDetail/ProductGallery';
import ProductInfo from '@/components/product/ProductDetail/ProductInfo';
import ProductOptions from '@/components/product/ProductDetail/ProductOptions';
import LotterySelection from '@/components/product/ProductDetail/LotterySelection';
import AdditionalInfo from '@/components/product/ProductDetail/AdditionalInfo';
import ProductCustomization from '@/components/product/ProductDetail/ProductCustomization';
import AddToCartButton from '@/components/product/ProductDetail/AddToCartButton';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
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
      console.log("Loading product with ID:", productId);
      
      // D'abord, essayer de le charger depuis localStorage
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts) as ExtendedProduct[];
          const foundProduct = parsedProducts.find(p => p.id === Number(productId));
          
          if (foundProduct) {
            console.log("Product found in localStorage:", foundProduct);
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
      const mockProduct = mockProducts.find(p => p.id === Number(productId)) as ExtendedProduct;
      console.log("Using mockProduct:", mockProduct);
      
      if (mockProduct) {
        if (mockProduct?.visualCategoryId) {
          setSelectedCategoryId(mockProduct.visualCategoryId);
        }
        // Initialiser le tableau des loteries sélectionnées
        setSelectedLotteries(Array(mockProduct?.tickets || 1).fill(''));
      }
      
      setProduct(mockProduct);
      setLoading(false);
    };
    
    loadProduct();
  }, [productId]);
  
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
  
  // Gérer l'upload de visuel personnalisé
  const handleVisualUpload = (file: File, previewUrl: string) => {
    // Créer un visuel personnalisé basé sur le fichier uploadé
    const customVisual: Visual = {
      id: -Date.now(), // ID négatif pour distinguer les visuels personnalisés
      name: file.name,
      description: 'Visuel personnalisé',
      image: previewUrl,
      categoryId: -1, // Catégorie spéciale pour les uploads
      categoryName: 'Uploads personnalisés'
    };
    
    handleSelectVisual(customVisual);
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
        <AddToCartButton onClick={() => navigate('/products')} />
      </div>
    );
  }
  
  const handleAddToCart = async () => {
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
    
    // Récupérer les loteries actives pour avoir les informations complètes
    const allLotteries = await getLotteries();
    const activeLotteries = allLotteries.filter(lottery => lottery.status === 'active');
    
    // Obtenir les informations des loteries sélectionnées
    const selectedLotteriesInfo = selectedLotteries.map(lotteryId => {
      const lottery = activeLotteries.find(l => l.id.toString() === lotteryId);
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
  
  // Préparer les images pour le carrousel
  const productImages = [product.image];
  if (product.secondaryImage) {
    productImages.push(product.secondaryImage);
  }
  
  // Vérifier si la personnalisation est permise
  const canCustomize = product.allowCustomization === true;
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Left Column: Product Image or Customization Interface */}
              <div className="rounded-lg overflow-hidden">
                {canCustomize ? (
                  <ProductCustomization 
                    productImage={product.image}
                    productSecondaryImage={product.secondaryImage}
                    visual={selectedVisual}
                    visualSettings={visualSettings}
                    onUpdateSettings={handleUpdateSettings}
                    position={activePosition}
                    setPosition={setPosition}
                    handleSelectVisual={handleSelectVisual}
                    selectedCategoryId={selectedCategoryId}
                    handleCategoryChange={handleCategoryChange}
                    visualCategories={visualCategories}
                    printAreas={product.printAreas}
                    selectedPrintArea={selectedPrintArea}
                    handlePrintAreaChange={handlePrintAreaChange}
                    handleVisualUpload={handleVisualUpload}
                  />
                ) : (
                  <ProductGallery 
                    images={productImages} 
                    productName={product.name} 
                  />
                )}
              </div>

              {/* Right Column: Product Info and Options */}
              <div className="space-y-6">
                <ProductInfo 
                  name={product.name}
                  price={product.price}
                  description={product.description}
                  tickets={product.tickets}
                />
                
                <ProductOptions 
                  sizes={product.sizes}
                  colors={product.colors}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  setSelectedSize={setSelectedSize}
                  setSelectedColor={setSelectedColor}
                />
                
                {product.tickets && product.tickets > 0 && (
                  <LotterySelection 
                    tickets={product.tickets}
                    selectedLotteries={selectedLotteries}
                    handleLotteryChange={handleLotteryChange}
                  />
                )}
                
                <AdditionalInfo 
                  weight={product.weight}
                  deliveryPrice={product.deliveryPrice}
                />
                
                <AddToCartButton onClick={handleAddToCart} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;


import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockProducts, mockLotteries } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import StarBackground from '../components/StarBackground';
import AdminNavigationHandler from '@/components/AdminNavigationHandler';
import { ExtendedProduct, ProductFilters } from '@/types/product';
import AdvancedFilters from '@/components/product/AdvancedFilters';

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lotteryIdParam = searchParams.get('lottery');
  
  // Filtres basiques
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedSleeveType, setSelectedSleeveType] = useState<string>('all');
  
  // Filtres avancés
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedFit, setSelectedFit] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [selectedLotteryId, setSelectedLotteryId] = useState<string | null>(lotteryIdParam);
  const [products, setProducts] = useState<ExtendedProduct[]>(mockProducts as ExtendedProduct[]);
  const [lotteries, setLotteries] = useState(mockLotteries);
  
  // Extraire tous les filtres disponibles des produits
  const [availableFilters, setAvailableFilters] = useState<ProductFilters>({
    productTypes: ['T-shirt', 'Sweatshirt', 'Polo', 'Casquette', 'Autre'],
    sleeveTypes: ['Courtes', 'Longues', 'Sans manches'],
    genders: ['homme', 'femme', 'enfant', 'unisexe'],
    materials: ['coton', 'polyester', 'bio', 'technique'],
    fits: ['regular', 'ajusté', 'oversize'],
    brands: ['WinShirt', 'Premium', 'Eco'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Orange', 'Gris', 'Violet']
  });
  
  // Set the selected lottery ID from URL parameters
  useEffect(() => {
    if (lotteryIdParam) {
      setSelectedLotteryId(lotteryIdParam);
    }
  }, [lotteryIdParam]);
  
  // Charger les produits et loteries depuis localStorage
  useEffect(() => {
    const loadData = () => {
      // Chargement des produits
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
            
            // Extraire tous les filtres disponibles des produits réels
            const filters: ProductFilters = {
              productTypes: [...new Set(parsedProducts.map(p => p.productType).filter(Boolean))],
              sleeveTypes: [...new Set(parsedProducts.map(p => p.sleeveType).filter(Boolean))],
              genders: [...new Set(parsedProducts.map(p => p.gender).filter(Boolean))],
              materials: [...new Set(parsedProducts.map(p => p.material).filter(Boolean))],
              fits: [...new Set(parsedProducts.map(p => p.fit).filter(Boolean))],
              brands: [...new Set(parsedProducts.map(p => p.brand).filter(Boolean))],
              sizes: [...new Set([].concat(...parsedProducts.map(p => p.sizes || [])))],
              colors: [...new Set([].concat(...parsedProducts.map(p => p.colors || [])))],
            };
            
            // Fusionner avec les valeurs par défaut
            setAvailableFilters({
              productTypes: [...availableFilters.productTypes, ...filters.productTypes].filter(Boolean),
              sleeveTypes: [...availableFilters.sleeveTypes, ...filters.sleeveTypes].filter(Boolean),
              genders: [...availableFilters.genders, ...filters.genders].filter(Boolean),
              materials: [...availableFilters.materials, ...filters.materials].filter(Boolean),
              fits: [...availableFilters.fits, ...filters.fits].filter(Boolean),
              brands: [...availableFilters.brands, ...filters.brands].filter(Boolean),
              sizes: [...availableFilters.sizes, ...filters.sizes].filter(Boolean),
              colors: [...availableFilters.colors, ...filters.colors].filter(Boolean),
            });
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Chargement des loteries
      const savedLotteries = localStorage.getItem('lotteries');
      if (savedLotteries) {
        try {
          const parsedLotteries = JSON.parse(savedLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des loteries:", error);
        }
      }
    };
    
    loadData();
    
    // Écouter les changements d'URL
    window.addEventListener('popstate', loadData);
    
    return () => {
      window.removeEventListener('popstate', loadData);
    };
  }, []);
  
  // Get the lottery details if a lottery ID is selected
  const selectedLottery = selectedLotteryId 
    ? lotteries.find(lottery => lottery.id.toString() === selectedLotteryId)
    : null;
  
  const filteredProducts = products.filter(product => {
    // Filtres de base
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQualityType = selectedType === 'all' || product.type === selectedType;
    const matchesProductType = selectedProductType === 'all' || product.productType === selectedProductType;
    const matchesSleeveType = selectedSleeveType === 'all' || product.sleeveType === selectedSleeveType;
    
    // Filtres avancés 
    const matchesGender = selectedGender === 'all' || product.gender === selectedGender;
    const matchesMaterial = selectedMaterial === 'all' || product.material === selectedMaterial;
    const matchesFit = selectedFit === 'all' || product.fit === selectedFit;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    
    // Filtres multi-sélection (tailles et couleurs)
    const matchesSizes = selectedSizes.length === 0 || 
      (product.sizes && selectedSizes.some(size => product.sizes.includes(size)));
    
    const matchesColors = selectedColors.length === 0 || 
      (product.colors && selectedColors.some(color => product.colors.includes(color)));
    
    // Filter by lottery if a lottery ID is selected
    const matchesLottery = !selectedLotteryId || 
      (product.linkedLotteries && product.linkedLotteries.includes(Number(selectedLotteryId)));
    
    return matchesSearch && matchesQualityType && matchesProductType && matchesSleeveType && 
           matchesGender && matchesMaterial && matchesFit && matchesBrand && 
           matchesSizes && matchesColors && matchesLottery;
  });
  
  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigationHandler />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Nos Produits
          </h1>
          
          {/* Lottery filter info */}
          {selectedLottery && (
            <div className="mb-6 text-center">
              <p className="text-winshirt-blue-light text-xl">
                Produits associés à la loterie: <span className="font-semibold">{selectedLottery.title}</span>
              </p>
            </div>
          )}
          
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Découvrez notre collection de vêtements tendance qui vous permettent de participer à nos loteries exclusives.
          </p>
          
          {/* Advanced Filters */}
          <AdvancedFilters 
            availableFilters={availableFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedProductType={selectedProductType}
            setSelectedProductType={setSelectedProductType}
            selectedSleeveType={selectedSleeveType}
            setSelectedSleeveType={setSelectedSleeveType}
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            selectedFit={selectedFit}
            setSelectedFit={setSelectedFit}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
          />
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-400 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500">
                {selectedLotteryId 
                  ? "Aucun produit n'est associé à cette loterie"
                  : "Veuillez modifier vos critères de recherche"
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsPage;

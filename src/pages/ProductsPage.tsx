import React, { useState, useEffect } from 'react';
import { mockProducts } from '@/data/mockData';
import { ExtendedProduct, ProductFilters } from '@/types/product';
import StarBackground from '@/components/StarBackground';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedFilters from '@/components/product/AdvancedFilters';
import FiltersBar from '@/components/product/FiltersBar';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProductType, setSelectedProductType] = useState('all');
  const [selectedSleeveType, setSelectedSleeveType] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedFit, setSelectedFit] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState('latest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Load products
  useEffect(() => {
    const loadProducts = () => {
      // Try to load from localStorage first
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
            return;
          }
        } catch (error) {
          console.error("Error loading products:", error);
        }
      }
      
      // Fallback to mock data
      setProducts(mockProducts as ExtendedProduct[]);
    };
    
    loadProducts();
  }, []);
  
  // Extract available filters
  const availableFilters: ProductFilters = {
    productTypes: [...new Set(products.map(p => p.productType).filter(Boolean))],
    sleeveTypes: [...new Set(products.map(p => p.sleeveType).filter(Boolean))],
    genders: [...new Set(products.map(p => p.gender).filter(Boolean))],
    materials: [...new Set(
      products.flatMap(p => p.material ? p.material.split(',').map(m => m.trim()) : [])
    )],
    fits: [...new Set(products.map(p => p.fit).filter(Boolean))],
    brands: [...new Set(products.map(p => p.brand).filter(Boolean))],
    sizes: [...new Set(products.flatMap(p => p.sizes || []))],
    colors: [...new Set(products.flatMap(p => p.colors || []))],
    categories: [...new Set(products.map(p => p.productType).filter(Boolean))], // Add categories
    price: { min: 0, max: 1000 } // Add price range
  };
  
  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      // Search filtering
      const matchesSearch = 
        !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Product type filtering
      const matchesProductType = 
        selectedProductType === 'all' || 
        (product.productType && product.productType === selectedProductType);
      
      // Sleeve type filtering
      const matchesSleeveType = 
        selectedSleeveType === 'all' || 
        (product.sleeveType && product.sleeveType === selectedSleeveType);
      
      // Gender filtering
      const matchesGender = 
        selectedGender === 'all' || 
        (product.gender && product.gender === selectedGender);
      
      // Material filtering
      const matchesMaterial = 
        selectedMaterial === 'all' || 
        (product.material && product.material.toLowerCase().includes(selectedMaterial.toLowerCase()));
      
      // Fit filtering
      const matchesFit = 
        selectedFit === 'all' || 
        (product.fit && product.fit === selectedFit);
      
      // Brand filtering
      const matchesBrand = 
        selectedBrand === 'all' || 
        (product.brand && product.brand === selectedBrand);
      
      // Size filtering
      const matchesSizes = 
        selectedSizes.length === 0 || 
        (product.sizes && selectedSizes.some(size => product.sizes!.includes(size)));
      
      // Color filtering
      const matchesColors = 
        selectedColors.length === 0 || 
        (product.colors && selectedColors.some(color => product.colors!.includes(color)));
      
      // Price filtering
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && 
        matchesProductType && 
        matchesSleeveType && 
        matchesGender && 
        matchesMaterial && 
        matchesFit && 
        matchesBrand &&
        matchesSizes && 
        matchesColors &&
        matchesPrice;
    })
    .sort((a, b) => {
      // Product sorting
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'latest':
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedProductType('all');
    setSelectedSleeveType('all');
    setSelectedGender('all');
    setSelectedMaterial('all');
    setSelectedFit('all');
    setSelectedBrand('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 1000]);
    setSortBy('latest');
  };
  
  // Toggle for advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Nos Produits</h1>
            
            <Button
              variant="outline"
              onClick={toggleAdvancedFilters}
              className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/10"
            >
              {showAdvancedFilters ? 'Filtres simples' : 'Filtres avancés'}
            </Button>
          </div>
          
          {/* Horizontal filters bar */}
          <FiltersBar 
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={resetFilters}
          />
          
          {/* Advanced filters shown below when toggled */}
          {showAdvancedFilters && (
            <div className="winshirt-card p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Filtres avancés</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher un produit..."
                    className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
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
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          )}
          
          {/* Product list */}
          <div className="w-full">
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="winshirt-card p-8 text-center">
                <h2 className="text-xl text-white mb-2">Aucun produit trouvé</h2>
                <p className="text-gray-400">
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </p>
                <Button 
                  className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;

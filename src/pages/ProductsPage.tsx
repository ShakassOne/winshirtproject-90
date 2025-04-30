
import React, { useState, useEffect } from 'react';
import { mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import StarBackground from '@/components/StarBackground';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedFilters from '@/components/product/AdvancedFilters';

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
  
  // Chargement des produits
  useEffect(() => {
    const loadProducts = () => {
      // Essayer d'abord de charger depuis localStorage
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
            return;
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Fallback aux données mock
      setProducts(mockProducts as ExtendedProduct[]);
    };
    
    loadProducts();
  }, []);
  
  // Extraire les filtres disponibles
  const availableFilters = {
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
  };
  
  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    // Filtrage par recherche
    const matchesSearch = 
      !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrage par type de produit
    const matchesProductType = 
      selectedProductType === 'all' || 
      (product.productType && product.productType === selectedProductType);
    
    // Filtrage par type de manches
    const matchesSleeveType = 
      selectedSleeveType === 'all' || 
      (product.sleeveType && product.sleeveType === selectedSleeveType);
    
    // Filtrage par genre
    const matchesGender = 
      selectedGender === 'all' || 
      (product.gender && product.gender === selectedGender);
    
    // Filtrage par matière
    const matchesMaterial = 
      selectedMaterial === 'all' || 
      (product.material && product.material.toLowerCase().includes(selectedMaterial.toLowerCase()));
    
    // Filtrage par coupe
    const matchesFit = 
      selectedFit === 'all' || 
      (product.fit && product.fit === selectedFit);
    
    // Filtrage par marque
    const matchesBrand = 
      selectedBrand === 'all' || 
      (product.brand && product.brand === selectedBrand);
    
    // Filtrage par tailles
    const matchesSizes = 
      selectedSizes.length === 0 || 
      (product.sizes && selectedSizes.some(size => product.sizes!.includes(size)));
    
    // Filtrage par couleurs
    const matchesColors = 
      selectedColors.length === 0 || 
      (product.colors && selectedColors.some(color => product.colors!.includes(color)));
    
    return matchesSearch && 
           matchesProductType && 
           matchesSleeveType && 
           matchesGender && 
           matchesMaterial && 
           matchesFit && 
           matchesBrand &&
           matchesSizes && 
           matchesColors;
  });
  
  // Réinitialiser tous les filtres
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
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Nos Produits</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative lg:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Rechercher un produit..."
                  className="pl-10 bg-winshirt-space-light border-winshirt-purple/30 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filtres fixes à gauche sur grands écrans */}
            <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
              <div className="winshirt-card p-6 sticky top-32">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Filtres</h2>
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
            </div>
            
            {/* Liste des produits */}
            <div className="w-full lg:w-3/4 xl:w-4/5">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
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
        </div>
      </section>
    </>
  );
};

export default ProductsPage;

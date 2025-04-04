
import React, { useState, useEffect } from 'react';
import { mockProducts } from '@/data/mockData';
import { ExtendedProduct } from '@/types/product';
import StarBackground from '@/components/StarBackground';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Search, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    productTypes: [] as string[],
    sleeveTypes: [] as string[],
    genders: [] as string[],
    materials: [] as string[],
    fits: [] as string[],
    brands: [] as string[],
    allowCustomization: false,
  });
  
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
      !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtrage par type de produit
    const matchesProductType = 
      filters.productTypes.length === 0 || 
      (product.productType && filters.productTypes.includes(product.productType));
    
    // Filtrage par type de manches
    const matchesSleeveType = 
      filters.sleeveTypes.length === 0 || 
      (product.sleeveType && filters.sleeveTypes.includes(product.sleeveType));
    
    // Filtrage par genre
    const matchesGender = 
      filters.genders.length === 0 || 
      (product.gender && filters.genders.includes(product.gender));
    
    // Filtrage par matière
    const matchesMaterial = 
      filters.materials.length === 0 || 
      (product.material && filters.materials.some(mat => 
        product.material!.toLowerCase().includes(mat.toLowerCase())
      ));
    
    // Filtrage par coupe
    const matchesFit = 
      filters.fits.length === 0 || 
      (product.fit && filters.fits.includes(product.fit));
    
    // Filtrage par marque
    const matchesBrand = 
      filters.brands.length === 0 || 
      (product.brand && filters.brands.includes(product.brand));
    
    // Filtrage par personnalisation
    const matchesCustomization = 
      !filters.allowCustomization || 
      product.allowCustomization === true;
    
    return matchesSearch && 
           matchesProductType && 
           matchesSleeveType && 
           matchesGender && 
           matchesMaterial && 
           matchesFit && 
           matchesBrand && 
           matchesCustomization;
  });
  
  // Mise à jour d'un filtre
  const toggleFilter = (category: string, value: string) => {
    setFilters(prevFilters => {
      const currentFilters = [...(prevFilters[category as keyof typeof prevFilters] as string[])];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        // Ajouter le filtre s'il n'existe pas
        return {
          ...prevFilters,
          [category]: [...currentFilters, value]
        };
      } else {
        // Retirer le filtre s'il existe déjà
        currentFilters.splice(index, 1);
        return {
          ...prevFilters,
          [category]: currentFilters
        };
      }
    });
  };
  
  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      productTypes: [],
      sleeveTypes: [],
      genders: [],
      materials: [],
      fits: [],
      brands: [],
      allowCustomization: false,
    });
    setSearchQuery('');
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Nos Produits</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Rechercher un produit..."
                  className="pl-10 bg-winshirt-space-light border-winshirt-purple/30 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-winshirt-purple/30">
                    <Sliders size={18} className="mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-winshirt-space border-l border-winshirt-purple/30 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filtres</SheetTitle>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Filtre Personnalisable */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="custom"
                          checked={filters.allowCustomization}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, allowCustomization: checked === true }))
                          }
                          className="data-[state=checked]:bg-winshirt-purple"
                        />
                        <Label htmlFor="custom">Personnalisable</Label>
                      </div>
                    </div>
                    
                    {/* Types de produit */}
                    {availableFilters.productTypes.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Type de produit</h3>
                        <div className="space-y-2">
                          {availableFilters.productTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type}`}
                                checked={filters.productTypes.includes(type)}
                                onCheckedChange={() => toggleFilter('productTypes', type)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`type-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Types de manches */}
                    {availableFilters.sleeveTypes.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Type de manches</h3>
                        <div className="space-y-2">
                          {availableFilters.sleeveTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`sleeve-${type}`}
                                checked={filters.sleeveTypes.includes(type)}
                                onCheckedChange={() => toggleFilter('sleeveTypes', type)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`sleeve-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Genres */}
                    {availableFilters.genders.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Genre</h3>
                        <div className="space-y-2">
                          {availableFilters.genders.map(gender => (
                            <div key={gender} className="flex items-center space-x-2">
                              <Checkbox
                                id={`gender-${gender}`}
                                checked={filters.genders.includes(gender)}
                                onCheckedChange={() => toggleFilter('genders', gender)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`gender-${gender}`}>
                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Coupes */}
                    {availableFilters.fits.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Coupe</h3>
                        <div className="space-y-2">
                          {availableFilters.fits.map(fit => (
                            <div key={fit} className="flex items-center space-x-2">
                              <Checkbox
                                id={`fit-${fit}`}
                                checked={filters.fits.includes(fit)}
                                onCheckedChange={() => toggleFilter('fits', fit)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`fit-${fit}`}>
                                {fit.charAt(0).toUpperCase() + fit.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Matières */}
                    {availableFilters.materials.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Matière</h3>
                        <div className="space-y-2">
                          {availableFilters.materials.map(material => (
                            <div key={material} className="flex items-center space-x-2">
                              <Checkbox
                                id={`material-${material}`}
                                checked={filters.materials.includes(material)}
                                onCheckedChange={() => toggleFilter('materials', material)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`material-${material}`}>{material}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Marques */}
                    {availableFilters.brands.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Marque</h3>
                        <div className="space-y-2">
                          {availableFilters.brands.map(brand => (
                            <div key={brand} className="flex items-center space-x-2">
                              <Checkbox
                                id={`brand-${brand}`}
                                checked={filters.brands.includes(brand)}
                                onCheckedChange={() => toggleFilter('brands', brand)}
                                className="data-[state=checked]:bg-winshirt-purple"
                              />
                              <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-6 border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
                      onClick={resetFilters}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </section>
    </>
  );
};

export default ProductsPage;

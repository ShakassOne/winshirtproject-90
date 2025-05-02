
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Palette, Filter } from "lucide-react";
import { ExtendedProduct } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductListProps {
  products: ExtendedProduct[];
  selectedProductId: number | null;
  loading?: boolean;
  onCreateProduct: () => void;
  onEditProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  selectedProductId,
  loading = false,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  
  // Extraire toutes les valeurs uniques pour les filtres
  const availableProductTypes = Array.from(
    new Set(products.map(p => p.productType).filter(Boolean))
  );
  
  const availableColors = Array.from(
    new Set(products.flatMap(p => p.colors || []))
  );
  
  const availableSizes = Array.from(
    new Set(products.flatMap(p => p.sizes || []))
  );
  
  // Trouver le prix max
  const maxPrice = Math.max(...products.map(p => p.price), 1000);
  
  // Toggle une couleur dans la sélection
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };
  
  // Toggle une taille dans la sélection
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };
  
  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProductType('all');
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, maxPrice]);
  };
  
  // Filtrer les produits par nom, description et filtres sélectionnés
  const filteredProducts = products.filter(product => {
    const matchesText = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase() || '');
    
    const matchesType = 
      selectedProductType === 'all' || 
      product.productType === selectedProductType;
    
    const matchesColors = 
      selectedColors.length === 0 || 
      (product.colors && selectedColors.some(color => product.colors!.includes(color)));
    
    const matchesSizes = 
      selectedSizes.length === 0 || 
      (product.sizes && selectedSizes.some(size => product.sizes!.includes(size)));
    
    const matchesPrice = 
      product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesText && matchesType && matchesColors && matchesSizes && matchesPrice;
  });
  
  return (
    <div className="winshirt-card p-6 h-full">
      <h2 className="text-2xl font-bold text-white mb-6">Liste des Produits</h2>
      
      <Button
        className="w-full mb-6 bg-winshirt-purple hover:bg-winshirt-purple-dark"
        onClick={onCreateProduct}
      >
        <Plus className="mr-2 h-4 w-4" />
        Créer un nouveau produit
      </Button>
      
      <div className="flex items-center gap-3 mb-4">
        {/* Barre de recherche */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Bouton pour afficher/masquer les filtres */}
        <Button 
          variant="outline" 
          className="border-winshirt-purple/30 text-winshirt-purple-light"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} className="mr-2" />
          Filtres
        </Button>
      </div>
      
      {/* Section des filtres avancés */}
      {showFilters && (
        <div className="bg-winshirt-space-light p-4 rounded-md mb-4 border border-winshirt-purple/20">
          <Accordion type="single" collapsible defaultValue="filters">
            <AccordionItem value="filters" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium text-winshirt-purple-light">
                Options de filtres
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Type de produit */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type de produit</label>
                    <Select 
                      value={selectedProductType} 
                      onValueChange={setSelectedProductType}
                    >
                      <SelectTrigger className="bg-winshirt-space border-winshirt-purple/20">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {availableProductTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Couleurs */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Couleurs</label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`w-6 h-6 rounded-full ${
                            selectedColors.includes(color) 
                              ? 'ring-2 ring-winshirt-purple' 
                              : 'ring-1 ring-gray-700'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Tailles */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tailles</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`min-w-8 h-8 px-2 flex items-center justify-center rounded ${
                            selectedSizes.includes(size)
                              ? 'bg-winshirt-purple text-white'
                              : 'bg-winshirt-space-light border border-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Prix */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Prix: {priceRange[0]}€ - {priceRange[1]}€
                    </label>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={maxPrice}
                      step={10}
                      onValueChange={setPriceRange}
                      className="mt-2"
                    />
                  </div>
                  
                  {/* Réinitialiser */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-2 border-winshirt-purple/30 text-winshirt-purple-light"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <p>Chargement des produits...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Aucun produit trouvé</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className={`border p-3 rounded-md cursor-pointer transition-colors ${
                  selectedProductId === product.id
                    ? 'border-winshirt-purple bg-winshirt-space-light'
                    : 'border-gray-700 hover:border-winshirt-purple/50'
                }`}
                onClick={() => onEditProduct(product.id)}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 overflow-hidden rounded bg-gray-800 flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        No img
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white text-ellipsis overflow-hidden whitespace-nowrap">
                        {product.name}
                      </h3>
                      {product.allowCustomization && (
                        <Badge className="bg-winshirt-blue-light text-xs flex items-center gap-1">
                          <Palette size={10} />
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {product.price.toFixed(2)} € - {product.type}
                    </p>
                    
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {product.productType && (
                        <span className="text-xs bg-winshirt-space px-1.5 py-0.5 rounded text-gray-300">
                          {product.productType}
                        </span>
                      )}
                      {product.tickets && (
                        <span className="text-xs bg-winshirt-purple/30 text-winshirt-purple-light px-1.5 py-0.5 rounded">
                          {product.tickets} {product.tickets > 1 ? 'tickets' : 'ticket'}
                        </span>
                      )}
                      
                      {/* Afficher quelques couleurs si disponibles */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1 ml-1">
                          {product.colors.slice(0, 3).map((color, idx) => (
                            <span 
                              key={idx} 
                              className="w-3 h-3 rounded-full border border-gray-600"
                              style={{ backgroundColor: color }}
                            ></span>
                          ))}
                          {product.colors.length > 3 && (
                            <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product.id);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProduct(product.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;


import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, RotateCcw } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface FiltersBarProps {
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onReset: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onReset
}) => {
  // Available colors for the filter
  const colors = [
    { name: 'Rouge', value: 'red' },
    { name: 'Bleu', value: 'blue' },
    { name: 'Vert', value: 'green' },
    { name: 'Jaune', value: 'yellow' },
    { name: 'Noir', value: 'black' },
    { name: 'Blanc', value: 'white' }
  ];

  // Available sizes for the filter
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  
  // Maximum price for slider
  const maxPrice = 1000;

  // Handle color selection/deselection
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Handle size selection/deselection
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Format price for display
  const formatPrice = (value: number) => {
    return `$${value}`;
  };

  return (
    <div className="bg-white dark:bg-winshirt-space-light p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Color filter */}
        <div>
          <h3 className="text-sm font-medium mb-3">Couleur</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => toggleColor(color.value)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColors.includes(color.value) 
                    ? 'ring-2 ring-winshirt-purple scale-110' 
                    : 'ring-1 ring-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {colors.length > 0 && (
              <button
                onClick={() => setSelectedColors([])}
                className={`w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center ${
                  selectedColors.length === 0 ? 'ring-2 ring-winshirt-purple' : ''
                }`}
                title="Réinitialiser les couleurs"
              >
                <span className="text-xs">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Size filter */}
        <div>
          <h3 className="text-sm font-medium mb-3">Taille</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
                  selectedSizes.includes(size)
                    ? 'bg-winshirt-purple text-white border-winshirt-purple'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-winshirt-purple/50'
                }`}
              >
                {size}
              </button>
            ))}
            {sizes.length > 0 && (
              <button
                onClick={() => setSelectedSizes([])}
                className={`w-8 h-8 rounded-md bg-white border border-gray-300 flex items-center justify-center ${
                  selectedSizes.length === 0 ? 'ring-2 ring-winshirt-purple' : ''
                }`}
                title="Réinitialiser les tailles"
              >
                <span>×</span>
              </button>
            )}
          </div>
        </div>

        {/* Price slider */}
        <div>
          <h3 className="text-sm font-medium mb-3">Prix</h3>
          <div className="px-2">
            <Slider
              defaultValue={[0, maxPrice]}
              value={priceRange}
              onValueChange={setPriceRange}
              max={maxPrice}
              step={10}
              className="mb-6"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
          </div>
        </div>

        {/* Sort by dropdown */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full">
            <h3 className="text-sm font-medium mb-3">Trier Par</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Reset button */}
          <Button
            variant="ghost" 
            onClick={onReset}
            className="mt-4 md:mt-0 h-10 w-10 p-0 rounded-full"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;

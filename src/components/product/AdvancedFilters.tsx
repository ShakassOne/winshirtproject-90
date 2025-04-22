import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProductFilters } from '@/types/product';
import { Slider } from "@/components/ui/slider"

interface AdvancedFiltersProps {
  availableFilters: ProductFilters;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedProductType: string;
  setSelectedProductType: (value: string) => void;
  selectedSleeveType: string;
  setSelectedSleeveType: (value: string) => void;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (value: string) => void;
  selectedFit: string;
  setSelectedFit: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedSizes: string[];
  setSelectedSizes: (value: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (value: string[]) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  availableFilters,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedProductType,
  setSelectedProductType,
  selectedSleeveType,
  setSelectedSleeveType,
  selectedGender,
  setSelectedGender,
  selectedMaterial,
  setSelectedMaterial,
  selectedFit,
  setSelectedFit,
  selectedBrand,
  setSelectedBrand,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors
}) => {
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <div className="winshirt-card p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Catégories</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded bg-winshirt-purple text-white">
            Toutes les catégories
          </button>
          {availableFilters.productTypes.map(type => (
            <button 
              key={type}
              className="w-full text-left px-3 py-2 rounded hover:bg-winshirt-purple/20 text-gray-300"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Prix</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 100]}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>0€</span>
            <span>100€</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Tailles</h3>
        <div className="flex flex-wrap gap-2">
          {availableFilters.sizes.map(size => (
            <button
              key={size}
              className="px-3 py-1 rounded border border-winshirt-purple/30 hover:bg-winshirt-purple/20 text-gray-300"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Couleurs</h3>
        <div className="flex flex-wrap gap-2">
          {availableFilters.colors.map(color => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border border-white/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Tri</h3>
        <select className="w-full bg-winshirt-space-light border border-winshirt-purple/30 rounded px-3 py-2 text-white">
          <option value="popularity">Popularité</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>
    </div>
  );
};

export default AdvancedFilters;

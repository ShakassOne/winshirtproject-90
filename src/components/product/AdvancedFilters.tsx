
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProductFilters } from '@/types/product';

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
    <div className="winshirt-card p-6 mb-10">
      <Accordion type="single" collapsible defaultValue="basic" className="w-full">
        <AccordionItem value="basic">
          <AccordionTrigger className="text-lg font-medium">Filtres de base</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-400 mb-2">Rechercher</label>
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Gamme</label>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Toutes les gammes" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Toutes les gammes</SelectItem>
                    {['entrée de gamme', 'standard', 'premium'].map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Type de produit</label>
                <Select
                  value={selectedProductType}
                  onValueChange={setSelectedProductType}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Tous les types</SelectItem>
                    {availableFilters.productTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-lg font-medium">Filtres avancés</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 mb-2">Type de manches</label>
                <Select
                  value={selectedSleeveType}
                  onValueChange={setSelectedSleeveType}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Tous les types</SelectItem>
                    {availableFilters.sleeveTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Genre</label>
                <Select
                  value={selectedGender}
                  onValueChange={setSelectedGender}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Tous les genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Tous les genres</SelectItem>
                    {availableFilters.genders.map(gender => (
                      <SelectItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Matière</label>
                <Select
                  value={selectedMaterial}
                  onValueChange={setSelectedMaterial}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {availableFilters.materials.map(material => (
                      <SelectItem key={material} value={material}>
                        {material.charAt(0).toUpperCase() + material.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Coupe</label>
                <Select
                  value={selectedFit}
                  onValueChange={setSelectedFit}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Toutes les coupes" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Toutes les coupes</SelectItem>
                    {availableFilters.fits.map(fit => (
                      <SelectItem key={fit} value={fit}>
                        {fit.charAt(0).toUpperCase() + fit.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-gray-400 mb-2">Marque</label>
                <Select
                  value={selectedBrand}
                  onValueChange={setSelectedBrand}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Toutes les marques" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Toutes les marques</SelectItem>
                    {availableFilters.brands.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-gray-400 mb-3">Tailles</label>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.sizes.map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`size-${size}`} 
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={() => toggleSize(size)}
                      />
                      <Label 
                        htmlFor={`size-${size}`}
                        className="text-sm cursor-pointer"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-3">Couleurs</label>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.colors.map(color => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`color-${color}`} 
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => toggleColor(color)}
                      />
                      <Label 
                        htmlFor={`color-${color}`}
                        className="text-sm cursor-pointer"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AdvancedFilters;

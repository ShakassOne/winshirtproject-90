
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { isLightColor } from '@/lib/utils';

interface AdvancedFiltersFormProps {
  form: UseFormReturn<any>;
}

const AdvancedFiltersForm: React.FC<AdvancedFiltersFormProps> = ({ form }) => {
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [colorPickerValue, setColorPickerValue] = useState('#000000');
  
  const addSize = (size: string) => {
    if (!size.trim()) return;
    
    const currentSizes = form.getValues().sizes || [];
    if (!currentSizes.includes(size.trim())) {
      form.setValue("sizes", [...currentSizes, size.trim()]);
    }
    setNewSize('');
  };
  
  const removeSize = (size: string) => {
    const currentSizes = form.getValues().sizes || [];
    form.setValue("sizes", currentSizes.filter(s => s !== size));
  };
  
  const addColor = (color: string, name?: string) => {
    if (!color.trim()) return;
    
    // Use custom name if provided, otherwise use the hex value
    const colorToAdd = name && name.trim() ? name.trim() : color.trim();
    
    const currentColors = form.getValues().colors || [];
    if (!currentColors.includes(colorToAdd)) {
      form.setValue("colors", [...currentColors, colorToAdd]);
    }
    
    // Reset the fields
    setNewColor('');
    setNewColorName('');
    setColorPickerValue('#000000');
  };
  
  const removeColor = (color: string) => {
    const currentColors = form.getValues().colors || [];
    form.setValue("colors", currentColors.filter(c => c !== color));
  };
  
  // Handle color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colorValue = e.target.value;
    setColorPickerValue(colorValue);
    setNewColor(colorValue);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-white">Filtres avancés</h3>
      
      {/* Sizes */}
      <div className="space-y-3">
        <FormLabel>Tailles disponibles</FormLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.getValues().sizes?.map((size: string) => (
            <Badge
              key={size}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 bg-winshirt-space-light"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="ml-1 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Nouvelle taille"
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
          <Button
            type="button"
            onClick={() => addSize(newSize)}
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            disabled={!newSize.trim()}
          >
            <Plus size={16} className="mr-1" />
            Ajouter
          </Button>
        </div>
      </div>
      
      {/* Enhanced color selector */}
      <div className="space-y-3">
        <FormLabel>Couleurs disponibles</FormLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.getValues().colors?.map((color: string) => (
            <Badge
              key={color}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5"
              style={{
                backgroundColor: color.startsWith('#') ? color : 'rgb(30, 30, 30)', // Use hex color or dark background for named colors
                color: color.startsWith('#') ? (isLightColor(color) ? 'black' : 'white') : 'white',
              }}
            >
              {color}
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="ml-1 hover:opacity-80"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        
        {/* Improved color selection with color picker */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={colorPickerValue}
              onChange={handleColorPickerChange}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <div className="flex-1">
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Code couleur (ex: #FF0000)"
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Nom de la couleur (ex: Rouge vif)"
              className="bg-winshirt-space-light border-winshirt-purple/30"
            />
            
            <Button
              type="button"
              onClick={() => addColor(newColor, newColorName)}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark whitespace-nowrap"
              disabled={!newColor.trim()}
            >
              <Plus size={16} className="mr-1" />
              Ajouter
            </Button>
          </div>
          
          <p className="text-xs text-gray-400">
            Choisissez une couleur avec le sélecteur et donnez-lui un nom pour une meilleure identification
          </p>
        </div>
      </div>
      
      {/* Gender */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Genre</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionnez un genre" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="femme">Femme</SelectItem>
                <SelectItem value="enfant">Enfant</SelectItem>
                <SelectItem value="unisexe">Unisexe</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* Material */}
      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Matière</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Coton, Polyester, Bio..."
                className="bg-winshirt-space-light border-winshirt-purple/30"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-gray-400">
              Séparez les différentes matières par des virgules
            </FormDescription>
          </FormItem>
        )}
      />
      
      {/* Fit */}
      <FormField
        control={form.control}
        name="fit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Coupe</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionnez une coupe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="ajusté">Ajusté</SelectItem>
                <SelectItem value="oversize">Oversize</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* Brand */}
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marque</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Nike, Adidas, etc."
                className="bg-winshirt-space-light border-winshirt-purple/30"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {/* Allow Customization Toggle */}
      <FormField
        control={form.control}
        name="allowCustomization"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-5 w-5 rounded border-gray-300 bg-winshirt-space-light text-winshirt-purple focus:ring-winshirt-purple"
              />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">Produit personnalisable</FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdvancedFiltersForm;

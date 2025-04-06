
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProductOptionsProps {
  sizes?: string[];
  colors?: string[];
  selectedSize: string;
  selectedColor: string;
  setSelectedSize: (size: string) => void;
  setSelectedColor: (color: string) => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor
}) => {
  return (
    <>
      {/* Size Selection */}
      {sizes && sizes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-white">Taille</Label>
          <RadioGroup 
            value={selectedSize}
            onValueChange={setSelectedSize}
            className="flex flex-wrap gap-2"
          >
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={size}
                  id={`size-${size}`}
                  className="text-winshirt-purple"
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="text-gray-200 cursor-pointer"
                >
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      {/* Color Selection */}
      {colors && colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-white">Couleur</Label>
          <RadioGroup 
            value={selectedColor}
            onValueChange={setSelectedColor}
            className="flex flex-wrap gap-2"
          >
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={color}
                  id={`color-${color}`}
                  className="text-winshirt-purple"
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="flex items-center cursor-pointer"
                >
                  <span
                    className="w-4 h-4 mr-2 rounded-full border border-gray-600"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="text-gray-200">{color}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </>
  );
};

export default ProductOptions;

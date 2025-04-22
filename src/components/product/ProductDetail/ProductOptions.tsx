
import React from 'react';
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
  sizes = [],
  colors = [],
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor,
}) => {
  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-foreground">Taille</div>
          <RadioGroup 
            value={selectedSize} 
            onValueChange={setSelectedSize}
            className="flex flex-wrap gap-2"
          >
            {sizes.map(size => (
              <RadioGroupItem 
                key={size}
                value={size}
                aria-label={size}
                className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold
                  ${selectedSize === size ? 'border-2 border-winshirt-purple bg-winshirt-purple/20 text-winshirt-purple' : 'border border-gray-300 text-foreground'}
                  transition-colors duration-200`}
              >
                {size}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-foreground">Couleur</div>
          <RadioGroup 
            value={selectedColor} 
            onValueChange={setSelectedColor}
            className="flex flex-wrap gap-2"
          >
            {colors.map(color => (
              <RadioGroupItem 
                key={color}
                value={color}
                aria-label={color}
                className={`w-10 h-10 rounded-full border-2
                  ${selectedColor === color ? 'border-winshirt-blue bg-winshirt-blue/10' : 'border-gray-300 bg-muted'}
                  transition-colors duration-200 flex items-center justify-center
                  `}
              >
                <span 
                  className="block w-6 h-6 rounded-full"
                  style={{ backgroundColor: color, border: selectedColor === color ? '2px solid #0FA0CE' : '1px solid #ccc' }}
                ></span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;

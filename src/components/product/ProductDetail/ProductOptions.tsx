
import React from 'react';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

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
          <Label className="text-lg">Taille</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm
                  ${selectedSize === size 
                    ? 'bg-winshirt-purple text-white ring-2 ring-offset-1 ring-offset-winshirt-space ring-winshirt-purple' 
                    : 'bg-transparent text-gray-300 border border-gray-600 hover:border-winshirt-purple/50 hover:bg-winshirt-purple/20'}
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Color Selection */}
      {colors && colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-lg">Couleur</Label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-10 h-10 rounded-full transition-all flex items-center justify-center
                  ${selectedColor === color 
                    ? 'ring-2 ring-offset-1 ring-offset-winshirt-space ring-winshirt-purple transform scale-110' 
                    : 'hover:scale-105 border-2 border-transparent'}
                `}
                title={color}
              >
                <span
                  className="w-full h-full rounded-full relative flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check 
                      className={`w-4 h-4 ${getContrastColor(color) === 'white' ? 'text-white' : 'text-black'}`} 
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to determine if text should be black or white based on background color
function getContrastColor(hexColor: string): 'white' | 'black' {
  // For named colors, return a default
  if (hexColor.charAt(0) !== '#') {
    const namedColors: Record<string, string> = {
      black: '#000000',
      white: '#FFFFFF',
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      purple: '#800080',
      gray: '#808080',
      grey: '#808080',
    };
    
    hexColor = namedColors[hexColor.toLowerCase()] || '#000000';
  }
  
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 7) {
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  } else if (hexColor.length === 4) {
    r = parseInt(hexColor.substring(1, 2) + hexColor.substring(1, 2), 16);
    g = parseInt(hexColor.substring(2, 3) + hexColor.substring(2, 3), 16);
    b = parseInt(hexColor.substring(3, 4) + hexColor.substring(3, 4), 16);
  }
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? 'black' : 'white';
}

export default ProductOptions;

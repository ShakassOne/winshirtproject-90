
import React from 'react';
import { Label } from '@/components/ui/label';

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
        <div className="space-y-3">
          <Label className="text-white text-lg">Taille</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  px-4 py-2 rounded-full border transition-all
                  ${selectedSize === size 
                    ? 'bg-winshirt-purple text-white border-winshirt-purple' 
                    : 'bg-transparent text-gray-300 border-gray-600 hover:border-winshirt-purple/50'}
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
        <div className="space-y-3">
          <Label className="text-white text-lg">Couleur</Label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-10 h-10 rounded-full transition-all flex items-center justify-center
                  ${selectedColor === color 
                    ? 'ring-2 ring-offset-2 ring-offset-winshirt-space ring-winshirt-purple scale-110' 
                    : 'hover:scale-105'}
                `}
              >
                <span
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: color }}
                  title={color}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductOptions;


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
          <Label className="text-white text-xl">Taille</Label>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  px-6 py-3 rounded-full border text-lg transition-all
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
          <Label className="text-white text-xl">Couleur</Label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-12 h-12 rounded-full transition-all flex items-center justify-center
                  ${selectedColor === color 
                    ? 'ring-3 ring-offset-3 ring-offset-winshirt-space ring-winshirt-purple scale-115' 
                    : 'hover:scale-110 border-2 border-transparent'}
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

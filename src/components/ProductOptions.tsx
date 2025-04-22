
import React from 'react';

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
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-theme-content">Taille</div>
          <div className="flex flex-wrap gap-0">
            {sizes.map(size => (
              <div 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`size-circle${selectedSize === size ? ' selected' : ''}`}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-theme-content">Couleur</div>
          <div className="flex flex-wrap gap-0">
            {colors.map(color => (
              <div 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`color-circle${selectedColor === color ? ' selected' : ''}`}
              >
                <div 
                  className="color-circle-inner" 
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;

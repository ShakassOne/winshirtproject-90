
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
          <div className="mb-2 text-sm font-semibold text-foreground">Taille</div>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => (
              <div 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`size-circle ${selectedSize === size ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedSize === size ? 'rgba(155, 135, 245, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                  border: selectedSize === size ? '2px solid #9b87f5' : '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-foreground">Couleur</div>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <div 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`color-circle ${selectedColor === color ? 'selected' : ''}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: selectedColor === color ? '2px solid #9b87f5' : '1px solid rgba(255, 255, 255, 0.3)'
                }}
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

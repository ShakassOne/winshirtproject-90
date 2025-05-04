
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
  // Fonction pour obtenir un nom lisible pour la couleur
  const getColorName = (color: string): string => {
    // Mapping de couleurs hexadécimales vers des noms
    const colorMap: Record<string, string> = {
      '#000000': 'Noir',
      '#FFFFFF': 'Blanc',
      '#FF0000': 'Rouge',
      '#00FF00': 'Vert',
      '#0000FF': 'Bleu',
      '#FFFF00': 'Jaune',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#808080': 'Gris',
      '#800000': 'Bordeaux',
      '#808000': 'Olive',
      '#008000': 'Vert foncé',
      '#800080': 'Violet',
      '#008080': 'Turquoise',
      '#000080': 'Bleu marine',
      '#FFA500': 'Orange',
      '#A52A2A': 'Marron',
      '#FFC0CB': 'Rose',
      '#D3D3D3': 'Gris clair',
      '#90EE90': 'Vert clair',
      '#ADD8E6': 'Bleu clair',
      '#F5F5DC': 'Beige',
    };
    
    // Si la couleur est un code hexadécimal et qu'elle est dans notre mapping
    if (color.startsWith('#') && colorMap[color.toUpperCase()]) {
      return colorMap[color.toUpperCase()];
    } 
    
    // Si c'est une couleur nommée, on la retourne directement
    return color;
  };

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
                  backgroundColor: '#000000', // Black background for better contrast with white text
                  border: selectedSize === size ? '2px solid #9b87f5' : '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white' // White text for contrast
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
            {colors.map(color => {
              const colorName = getColorName(color);
              return (
                <div 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`color-circle flex flex-col items-center ${selectedColor === color ? 'selected' : ''}`}
                  style={{
                    backgroundColor: 'rgba(34, 34, 34, 0.9)', // Dark background for outer circle
                    border: selectedColor === color ? '2px solid #9b87f5' : '1px solid rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    padding: '20px 10px 5px'
                  }}
                >
                  <div 
                    className="color-circle-inner"
                    style={{ 
                      backgroundColor: color.startsWith('#') ? color : color,
                      position: 'absolute',
                      top: '5px'
                    }}
                  />
                  <span className="text-xs mt-3 text-white">{colorName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;

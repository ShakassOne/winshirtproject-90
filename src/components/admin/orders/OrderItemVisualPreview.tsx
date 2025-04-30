
import React, { useMemo } from 'react';
import { Visual } from '@/types/visual';
import { useVisuals } from '@/data/mockVisuals';

interface OrderItemVisualPreviewProps {
  visualDesign?: {
    front?: { visualId?: number; settings?: any };
    back?: { visualId?: number; settings?: any };
  };
  productImage?: string;
}

const OrderItemVisualPreview: React.FC<OrderItemVisualPreviewProps> = ({
  visualDesign,
  productImage
}) => {
  const { getVisualById } = useVisuals();
  
  const frontVisual = useMemo(() => {
    const frontVisualId = visualDesign?.front?.visualId;
    if (frontVisualId) {
      return getVisualById(frontVisualId);
    }
    return null;
  }, [visualDesign?.front?.visualId, getVisualById]);
  
  const backVisual = useMemo(() => {
    const backVisualId = visualDesign?.back?.visualId;
    if (backVisualId) {
      return getVisualById(backVisualId);
    }
    return null;
  }, [visualDesign?.back?.visualId, getVisualById]);

  const hasVisuals = !!frontVisual || !!backVisual;
  
  // Fallback image if no product image is provided
  const fallbackImage = "https://placehold.co/600x400/555/fff?text=Product+Image";
  
  // Use product image if available, otherwise fallback
  const displayImage = productImage || fallbackImage;
  
  if (!hasVisuals) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
          <img 
            src={displayImage} 
            alt="Product" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>
        <span className="text-xs text-gray-500">Pas de visuel</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {frontVisual && (
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden relative">
            <img 
              src={displayImage} 
              alt="Product front" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={frontVisual.image} 
                alt={frontVisual.name}
                className="max-w-[80%] max-h-[80%]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">Recto</span>
        </div>
      )}
      
      {backVisual && (
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden relative">
            <img 
              src={displayImage} 
              alt="Product back" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={backVisual.image} 
                alt={backVisual.name}
                className="max-w-[80%] max-h-[80%]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">Verso</span>
        </div>
      )}
    </div>
  );
};

export default OrderItemVisualPreview;

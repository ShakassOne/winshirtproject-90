
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface VisualSettings {
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  opacity?: number;
}

interface VisualDesign {
  visualId: number;
  visualName: string;
  visualImage: string;
  settings?: VisualSettings;
  backVisualId?: number;
  backVisualName?: string;
  backVisualImage?: string;
  backSettings?: VisualSettings;
}

interface OrderItemVisualPreviewProps {
  productImage: string;
  visualDesign: VisualDesign | null;
  productName: string;
}

const OrderItemVisualPreview: React.FC<OrderItemVisualPreviewProps> = ({
  productImage,
  visualDesign,
  productName
}) => {
  const [activeTab, setActiveTab] = useState('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  // Use proper error fallbacks for images
  useEffect(() => {
    if (productImage) {
      if (productImage.includes('placeholder') || !productImage) {
        // Try to load a product image based on the product name
        const fallbackImage = `/products/${productName?.toLowerCase().replace(/\s+/g, '_')}.jpg`;
        setFrontImage(fallbackImage);
      } else {
        setFrontImage(productImage);
      }
    } else {
      setFrontImage('/placeholder.svg');
    }
    
    // Set back image to the same as front for now, could be replaced with a back view later
    setBackImage(productImage || '/placeholder.svg');
  }, [productImage, productName]);

  // Check if design exists
  if (!visualDesign) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Pas de personnalisation</p>
      </div>
    );
  }

  // Calculate visual position percentages for front
  const frontPositionX = visualDesign.settings?.position?.x ? 
    `${visualDesign.settings.position.x * 100}%` : '50%';
  const frontPositionY = visualDesign.settings?.position?.y ? 
    `${visualDesign.settings.position.y * 100}%` : '50%';
  
  // Calculate visual position percentages for back
  const backPositionX = visualDesign.backSettings?.position?.x ? 
    `${visualDesign.backSettings.position.x * 100}%` : '50%';
  const backPositionY = visualDesign.backSettings?.position?.y ? 
    `${visualDesign.backSettings.position.y * 100}%` : '50%';
  
  // Calculate visual size for front
  const frontWidth = visualDesign.settings?.size?.width ? 
    `${visualDesign.settings.size.width * 100}%` : '40%';
  const frontHeight = visualDesign.settings?.size?.height ? 
    'auto' : 'auto';
  
  // Calculate visual size for back
  const backWidth = visualDesign.backSettings?.size?.width ? 
    `${visualDesign.backSettings.size.width * 100}%` : '40%';
  const backHeight = visualDesign.backSettings?.size?.height ? 
    'auto' : 'auto';
  
  // Visual may be missing opacity
  const frontOpacity = visualDesign.settings?.opacity !== undefined ? 
    visualDesign.settings.opacity : 1;
  const backOpacity = visualDesign.backSettings?.opacity !== undefined ? 
    visualDesign.backSettings.opacity : 1;

  // Properly handle front/back designs
  const hasFrontDesign = !!visualDesign.visualImage;
  const hasBackDesign = !!visualDesign.backVisualImage;

  return (
    <div className="border rounded-md overflow-hidden bg-white/5">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="front">Recto</TabsTrigger>
          <TabsTrigger value="back">Verso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="front" className="p-0">
          <div 
            className="relative h-60 w-full bg-gray-100 flex items-center justify-center"
            style={{ backgroundColor: '#1e293b' }}
          >
            {/* Product image */}
            {frontImage && (
              <img 
                src={frontImage} 
                alt={`${productName} - vue de face`}
                className="h-full w-auto object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            )}
            
            {/* Visual design overlay */}
            {hasFrontDesign && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: frontPositionY,
                  left: frontPositionX,
                  transform: 'translate(-50%, -50%)',
                  width: frontWidth,
                  height: frontHeight,
                  opacity: frontOpacity,
                }}
              >
                <img 
                  src={visualDesign.visualImage} 
                  alt={visualDesign.visualName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback for visual
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            
            {/* Visual info overlay */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {visualDesign.visualName || 'Visuel personnalisé'}
              </Badge>
              <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                Position: X: {Math.round(Number(frontPositionX.replace('%', '')))}%, 
                Y: {Math.round(Number(frontPositionY.replace('%', '')))}%
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="back" className="p-0">
          <div 
            className="relative h-60 w-full bg-gray-100 flex items-center justify-center"
            style={{ backgroundColor: '#1e293b' }}
          >
            {/* Product image */}
            {backImage && (
              <img 
                src={backImage} 
                alt={`${productName} - vue de dos`}
                className="h-full w-auto object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            )}
            
            {/* Visual design overlay */}
            {hasBackDesign && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: backPositionY,
                  left: backPositionX,
                  transform: 'translate(-50%, -50%)',
                  width: backWidth,
                  height: backHeight,
                  opacity: backOpacity,
                }}
              >
                <img 
                  src={visualDesign.backVisualImage} 
                  alt={visualDesign.backVisualName || 'Visuel dos'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback for visual
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            
            {/* Visual info overlay */}
            {hasBackDesign ? (
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {visualDesign.backVisualName || 'Visuel personnalisé'}
                </Badge>
                <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Position: X: {Math.round(Number(backPositionX.replace('%', '')))}%, 
                  Y: {Math.round(Number(backPositionY.replace('%', '')))}%
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white bg-black/50 px-4 py-2 rounded">Pas de visuel au dos</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderItemVisualPreview;

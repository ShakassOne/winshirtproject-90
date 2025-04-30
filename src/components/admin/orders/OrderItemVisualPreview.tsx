
import React, { useState } from 'react';
import { OrderItem } from '@/types/order';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Visual } from '@/types/visual';

interface OrderItemVisualPreviewProps {
  orderItem: OrderItem;
}

const OrderItemVisualPreview: React.FC<OrderItemVisualPreviewProps> = ({ orderItem }) => {
  const [activePosition, setActivePosition] = useState<'front' | 'back'>('front');

  if (!orderItem.visualDesign) {
    return null;
  }

  // Extraire les données du visuel à partir du orderItem
  const visualDesign = orderItem.visualDesign;
  const productImage = orderItem.productImage;
  
  // Créer un composant pour l'affichage de l'aperçu
  return (
    <div className="mb-2">
      <Tabs 
        defaultValue="front" 
        onValueChange={(val) => setActivePosition(val as 'front' | 'back')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full mb-2">
          <TabsTrigger value="front">Recto</TabsTrigger>
          <TabsTrigger value="back">Verso</TabsTrigger>
        </TabsList>
        
        {/* Contenu du tab recto avec l'aperçu du produit et visuel positionné */}
        <TabsContent value="front" className="h-64">
          <div className="relative h-full overflow-hidden rounded-lg bg-black/20">
            {/* Image du produit en arrière-plan */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={productImage} 
                alt={orderItem.productName}
                className="object-contain max-h-full max-w-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Produit';
                }}
              />
            </div>
            
            {/* Visuel superposé et positionné */}
            {visualDesign && (
              <div 
                className="absolute" 
                style={{
                  top: `${visualDesign.settings?.position?.y ?? 50}%`,
                  left: `${visualDesign.settings?.position?.x ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: visualDesign.settings?.opacity ?? 1,
                  width: `${visualDesign.settings?.size?.width ?? 150}px`,
                  height: `${visualDesign.settings?.size?.height ?? 150}px`,
                }}
              >
                <img
                  src={visualDesign.visualImage}
                  alt={visualDesign.visualName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Affichage des détails du positionnement */}
          <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-x-4">
            <span>Visuel: {visualDesign.visualName}</span>
            <span>Position: X: {visualDesign.settings?.position?.x.toFixed(0) || 50}%, Y: {visualDesign.settings?.position?.y.toFixed(0) || 50}%</span>
            <span>Taille: {visualDesign.settings?.size?.width.toFixed(0) || 150}px × {visualDesign.settings?.size?.height.toFixed(0) || 150}px</span>
          </div>
        </TabsContent>
        
        {/* Contenu du tab verso avec l'aperçu du produit (verso) et visuel positionné */}
        <TabsContent value="back" className="h-64">
          <div className="relative h-full overflow-hidden rounded-lg bg-black/20">
            {/* Image du produit en arrière-plan (verso) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={productImage} 
                alt={`${orderItem.productName} (verso)`}
                className="object-contain max-h-full max-w-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Produit+(verso)';
                }}
              />
            </div>
            
            {/* Si la face verso a un visuel différent, on l'affiche ici */}
            {visualDesign && (
              <div 
                className="absolute" 
                style={{
                  top: `${visualDesign.settings?.position?.y ?? 50}%`,
                  left: `${visualDesign.settings?.position?.x ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: visualDesign.settings?.opacity ?? 1,
                  width: `${visualDesign.settings?.size?.width ?? 150}px`,
                  height: `${visualDesign.settings?.size?.height ?? 150}px`,
                }}
              >
                <img
                  src={visualDesign.visualImage}
                  alt={visualDesign.visualName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Affichage des détails du positionnement (verso) */}
          <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-x-4">
            <span>Visuel: {visualDesign.visualName}</span>
            <span>Position: X: {visualDesign.settings?.position?.x.toFixed(0) || 50}%, Y: {visualDesign.settings?.position?.y.toFixed(0) || 50}%</span>
            <span>Taille: {visualDesign.settings?.size?.width.toFixed(0) || 150}px × {visualDesign.settings?.size?.height.toFixed(0) || 150}px</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderItemVisualPreview;

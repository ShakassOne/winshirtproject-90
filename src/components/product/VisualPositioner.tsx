import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Visual, ProductVisualSettings } from '@/types/visual';
import { PrintArea } from '@/types/product';

interface VisualPositionerProps {
  productImage: string;
  productSecondaryImage?: string;
  visual: Visual | null;
  visualSettings: ProductVisualSettings;
  onUpdateSettings: (settings: ProductVisualSettings) => void;
  onPositionChange?: (position: 'front' | 'back') => void; // Callback pour notifier du changement
  position: 'front' | 'back'; // Position actuelle passée en prop
  readOnly?: boolean;
  printAreas?: PrintArea[]; // Zones d'impression
  selectedPrintArea?: PrintArea | null; // Zone d'impression sélectionnée
}

const VisualPositioner: React.FC<VisualPositionerProps> = ({
  productImage,
  productSecondaryImage,
  visual,
  visualSettings,
  onUpdateSettings,
  onPositionChange,
  position,
  readOnly = false,
  printAreas = [],
  selectedPrintArea = null
}) => {
  const frontContainerRef = useRef<HTMLDivElement>(null);
  const backContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  
  // Handler pour le changement de position (recto/verso)
  const handlePositionChange = (newPosition: string) => {
    if (onPositionChange && (newPosition === 'front' || newPosition === 'back')) {
      onPositionChange(newPosition as 'front' | 'back');
    }
  };
  
  // Récupérer les dimensions du conteneur
  useEffect(() => {
    if (position === 'front' && frontContainerRef.current) {
      setContainerRect(frontContainerRef.current.getBoundingClientRect());
    } else if (position === 'back' && backContainerRef.current) {
      setContainerRect(backContainerRef.current.getBoundingClientRect());
    }
    
    // Recalculer le containerRect quand le composant est monté ou mis à jour
    const handleResize = () => {
      if (position === 'front' && frontContainerRef.current) {
        setContainerRect(frontContainerRef.current.getBoundingClientRect());
      } else if (position === 'back' && backContainerRef.current) {
        setContainerRect(backContainerRef.current.getBoundingClientRect());
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [position, frontContainerRef.current, backContainerRef.current]);
  
  // Détermine automatiquement la zone d'impression active en fonction de la position
  const getActivePrintArea = () => {
    if (!printAreas || printAreas.length === 0) return null;
    
    // Si une zone est explicitement sélectionnée, l'utiliser
    if (selectedPrintArea) return selectedPrintArea;
    
    // Sinon, trouver la zone qui correspond à la position actuelle (recto/verso)
    const positionAreas = printAreas.filter(area => area.position === position);
    if (positionAreas.length > 0) return positionAreas[0];
    
    // Fallback: prendre la première zone disponible
    return printAreas[0];
  };
  
  const activePrintArea = getActivePrintArea();
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || !visual) return;

    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (readOnly || !containerRect) return;
    
    if (isDragging && visualRef.current) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      let newX = visualSettings.position.x + dx;
      let newY = visualSettings.position.y + dy;
      
      // Si nous avons une zone d'impression active, contraindre le mouvement à cette zone
      if (activePrintArea) {
        const { bounds } = activePrintArea;
        
        // Contraindre le visuel à l'intérieur de la zone d'impression
        newX = Math.max(bounds.x, Math.min(newX, bounds.x + bounds.width - visualSettings.size.width));
        newY = Math.max(bounds.y, Math.min(newY, bounds.y + bounds.height - visualSettings.size.height));
      } else {
        // Contraindre le visuel à l'intérieur du conteneur
        newX = Math.max(0, Math.min(newX, containerRect.width - visualSettings.size.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - visualSettings.size.height));
      }
      
      onUpdateSettings({
        ...visualSettings,
        position: { x: newX, y: newY }
      });
      
      // Mettre à jour la position de départ pour le prochain mouvement
      setStartPos({
        x: e.clientX,
        y: e.clientY
      });
    }
    
    if (isResizing && resizeDirection && containerRect) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = visualSettings.position.x;
      let newY = visualSettings.position.y;
      
      // Ajuster la taille basée sur la direction du redimensionnement
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, startSize.width + dx);
        
        // Si nous avons une zone d'impression active, limiter la largeur
        if (activePrintArea) {
          const maxWidth = activePrintArea.bounds.x + activePrintArea.bounds.width - visualSettings.position.x;
          newWidth = Math.min(newWidth, maxWidth);
        } else {
          newWidth = Math.min(newWidth, containerRect.width - visualSettings.position.x);
        }
      }
      
      if (resizeDirection.includes('w')) {
        const newWidthW = Math.max(50, startSize.width - dx);
        newX = visualSettings.position.x + (startSize.width - newWidthW);
        
        // Si nous avons une zone d'impression active, vérifier les limites
        if (activePrintArea) {
          if (newX < activePrintArea.bounds.x) {
            const adjustedWidth = visualSettings.position.x + startSize.width - activePrintArea.bounds.x;
            newWidth = Math.max(50, adjustedWidth);
            newX = activePrintArea.bounds.x;
          } else {
            newWidth = newWidthW;
          }
        } else {
          if (newX < 0) {
            newWidth = Math.max(50, visualSettings.position.x + startSize.width);
            newX = 0;
          } else {
            newWidth = newWidthW;
          }
        }
      }
      
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(50, startSize.height + dy);
        
        // Si nous avons une zone d'impression active, limiter la hauteur
        if (activePrintArea) {
          const maxHeight = activePrintArea.bounds.y + activePrintArea.bounds.height - visualSettings.position.y;
          newHeight = Math.min(newHeight, maxHeight);
        } else {
          newHeight = Math.min(newHeight, containerRect.height - visualSettings.position.y);
        }
      }
      
      if (resizeDirection.includes('n')) {
        const newHeightN = Math.max(50, startSize.height - dy);
        newY = visualSettings.position.y + (startSize.height - newHeightN);
        
        // Si nous avons une zone d'impression active, vérifier les limites
        if (activePrintArea) {
          if (newY < activePrintArea.bounds.y) {
            const adjustedHeight = visualSettings.position.y + startSize.height - activePrintArea.bounds.y;
            newHeight = Math.max(50, adjustedHeight);
            newY = activePrintArea.bounds.y;
          } else {
            newHeight = newHeightN;
          }
        } else {
          if (newY < 0) {
            newHeight = Math.max(50, visualSettings.position.y + startSize.height);
            newY = 0;
          } else {
            newHeight = newHeightN;
          }
        }
      }
      
      onUpdateSettings({
        ...visualSettings,
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight }
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };
  
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (readOnly) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
    setStartSize({
      width: visualSettings.size.width,
      height: visualSettings.size.height
    });
  };
  
  const handleOpacityChange = (value: number[]) => {
    onUpdateSettings({
      ...visualSettings,
      opacity: value[0]
    });
  };
  
  // Attacher et détacher les gestionnaires d'événements globaux
  useEffect(() => {
    if (!readOnly) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, startPos, startSize, resizeDirection, readOnly, containerRect, visualSettings]);
  
  // Repositionner le visuel à l'intérieur de la zone d'impression quand celle-ci change
  useEffect(() => {
    if (activePrintArea && visual && containerRect) {
      const { bounds } = activePrintArea;
      
      // Calculer le centre de la zone d'impression
      const centerX = bounds.x + bounds.width / 2 - visualSettings.size.width / 2;
      const centerY = bounds.y + bounds.height / 2 - visualSettings.size.height / 2;
      
      // Vérifier si le visuel est hors des limites de la zone d'impression
      const isOutsideX = visualSettings.position.x < bounds.x || 
                        visualSettings.position.x + visualSettings.size.width > bounds.x + bounds.width;
      const isOutsideY = visualSettings.position.y < bounds.y || 
                        visualSettings.position.y + visualSettings.size.height > bounds.y + bounds.height;
      
      // Si le visuel est hors des limites ou si c'est la première fois qu'il est positionné
      if (isOutsideX || isOutsideY || (visualSettings.position.x === 50 && visualSettings.position.y === 50)) {
        // Centrer le visuel dans la zone d'impression
        onUpdateSettings({
          ...visualSettings,
          position: { 
            x: Math.max(bounds.x, Math.min(centerX, bounds.x + bounds.width - visualSettings.size.width)),
            y: Math.max(bounds.y, Math.min(centerY, bounds.y + bounds.height - visualSettings.size.height))
          }
        });
      }
    }
  }, [activePrintArea, visual, containerRect]);
  
  const visualRef = useRef<HTMLDivElement>(null);
  
  // Afficher directement le contenu correspondant à la position actuelle sans les onglets
  // pour éviter la duplication avec les onglets de ProductDetailPage
  return (
    <div className="space-y-4">
      {/* Nous retirons les TabsList et TabsTrigger et utilisons directement le contenu */}
      {position === 'front' ? (
        <div 
          ref={frontContainerRef}
          className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mx-auto"
          style={{ 
            width: '100%', 
            height: '400px',
            maxWidth: '500px'
          }}
        >
          <img 
            src={productImage} 
            alt="Produit recto" 
            className="w-full h-full object-contain"
          />
          
          {/* Affichage des zones d'impression du recto (seulement si pas en lecture seule) */}
          {!readOnly && printAreas && printAreas.filter(area => area.position === 'front').map(area => (
            <div
              key={area.id}
              className="absolute border-winshirt-purple/10 border border-dashed"
              style={{
                left: `${area.bounds.x}px`,
                top: `${area.bounds.y}px`,
                width: `${area.bounds.width}px`,
                height: `${area.bounds.height}px`,
                pointerEvents: 'none',
                zIndex: 5
              }}
            />
          ))}
          
          {visual && position === 'front' && (
            <div
              ref={visualRef}
              className={`absolute cursor-move ${readOnly ? '' : 'hover:outline hover:outline-dashed hover:outline-2 hover:outline-winshirt-blue-light'}`}
              style={{
                left: `${visualSettings.position.x}px`,
                top: `${visualSettings.position.y}px`,
                width: `${visualSettings.size.width}px`,
                height: `${visualSettings.size.height}px`,
                opacity: visualSettings.opacity,
                mixBlendMode: 'multiply',
                zIndex: 10
              }}
              onMouseDown={handleMouseDown}
            >
              <img 
                src={visual.image} 
                alt={visual.name} 
                className="w-full h-full object-contain pointer-events-none"
              />
              
              {!readOnly && (
                <>
                  {/* Poignées de redimensionnement */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-nw-resize z-20" 
                      onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-ne-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-sw-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-se-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'se')} />
                  <div className="absolute top-1/2 left-0 w-3 h-3 bg-winshirt-blue-light cursor-w-resize -translate-y-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'w')} />
                  <div className="absolute top-1/2 right-0 w-3 h-3 bg-winshirt-blue-light cursor-e-resize -translate-y-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'e')} />
                  <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-s-resize -translate-x-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 's')} />
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-n-resize -translate-x-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'n')} />
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div 
          ref={backContainerRef}
          className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mx-auto"
          style={{ 
            width: '100%', 
            height: '400px',
            maxWidth: '500px'
          }}
        >
          {productSecondaryImage ? (
            <img 
              src={productSecondaryImage} 
              alt="Produit verso" 
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={productImage} 
              alt="Produit verso (image principale)" 
              className="w-full h-full object-contain opacity-70"
            />
          )}
          
          {/* Affichage des zones d'impression du verso (seulement si pas en lecture seule) */}
          {!readOnly && printAreas && printAreas.filter(area => area.position === 'back').map(area => (
            <div
              key={area.id}
              className="absolute border-winshirt-purple/10 border border-dashed"
              style={{
                left: `${area.bounds.x}px`,
                top: `${area.bounds.y}px`,
                width: `${area.bounds.width}px`,
                height: `${area.bounds.height}px`,
                pointerEvents: 'none',
                zIndex: 5
              }}
            />
          ))}
          
          {visual && position === 'back' && (
            <div
              ref={visualRef}
              className={`absolute cursor-move ${readOnly ? '' : 'hover:outline hover:outline-dashed hover:outline-2 hover:outline-winshirt-blue-light'}`}
              style={{
                left: `${visualSettings.position.x}px`,
                top: `${visualSettings.position.y}px`,
                width: `${visualSettings.size.width}px`,
                height: `${visualSettings.size.height}px`,
                opacity: visualSettings.opacity,
                mixBlendMode: 'multiply',
                zIndex: 10
              }}
              onMouseDown={handleMouseDown}
            >
              <img 
                src={visual.image} 
                alt={visual.name} 
                className="w-full h-full object-contain pointer-events-none"
              />
              
              {!readOnly && (
                <>
                  {/* Poignées de redimensionnement */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-nw-resize z-20" 
                      onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-ne-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-sw-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-se-resize z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'se')} />
                  <div className="absolute top-1/2 left-0 w-3 h-3 bg-winshirt-blue-light cursor-w-resize -translate-y-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'w')} />
                  <div className="absolute top-1/2 right-0 w-3 h-3 bg-winshirt-blue-light cursor-e-resize -translate-y-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'e')} />
                  <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-s-resize -translate-x-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 's')} />
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-n-resize -translate-x-1/2 z-20"
                      onMouseDown={(e) => handleResizeStart(e, 'n')} />
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Contrôle d'opacité */}
      {visual && !readOnly && (
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span>Opacité</span>
            <span>{Math.round(visualSettings.opacity * 100)}%</span>
          </div>
          <Slider
            defaultValue={[visualSettings.opacity]}
            min={0.1}
            max={1}
            step={0.05}
            value={[visualSettings.opacity]}
            onValueChange={handleOpacityChange}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default VisualPositioner;

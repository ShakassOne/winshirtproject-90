
import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Visual, ProductVisualSettings } from '@/types/visual';

interface VisualPositionerProps {
  productImage: string;
  visual: Visual | null;
  visualSettings: ProductVisualSettings;
  onUpdateSettings: (settings: ProductVisualSettings) => void;
  readOnly?: boolean;
}

const VisualPositioner: React.FC<VisualPositionerProps> = ({
  productImage,
  visual,
  visualSettings,
  onUpdateSettings,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || !visual) return;

    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - visualSettings.position.x,
      y: e.clientY - visualSettings.position.y
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (readOnly) return;
    
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newX = e.clientX - startPos.x;
      let newY = e.clientY - startPos.y;
      
      // Contraindre le visuel à l'intérieur du conteneur
      newX = Math.max(0, Math.min(newX, containerRect.width - visualSettings.size.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - visualSettings.size.height));
      
      onUpdateSettings({
        ...visualSettings,
        position: { x: newX, y: newY }
      });
    }
    
    if (isResizing && containerRef.current && resizeDirection) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = visualSettings.position.x;
      let newY = visualSettings.position.y;
      
      // Ajuster la taille basée sur la direction du redimensionnement
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, startSize.width + (e.clientX - startPos.x));
        newWidth = Math.min(newWidth, containerRect.width - visualSettings.position.x);
      }
      if (resizeDirection.includes('w')) {
        const diff = startPos.x - e.clientX;
        newWidth = Math.max(50, startSize.width + diff);
        newX = Math.max(0, visualSettings.position.x - diff);
        newWidth = Math.min(newWidth, containerRect.width - newX);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(50, startSize.height + (e.clientY - startPos.y));
        newHeight = Math.min(newHeight, containerRect.height - visualSettings.position.y);
      }
      if (resizeDirection.includes('n')) {
        const diff = startPos.y - e.clientY;
        newHeight = Math.max(50, startSize.height + diff);
        newY = Math.max(0, visualSettings.position.y - diff);
        newHeight = Math.min(newHeight, containerRect.height - newY);
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
  }, [isDragging, isResizing, startPos, startSize, resizeDirection, readOnly]);
  
  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mx-auto"
        style={{ 
          width: '100%', 
          height: '400px',
          maxWidth: '500px'
        }}
      >
        <img 
          src={productImage} 
          alt="Produit" 
          className="w-full h-full object-contain"
        />
        
        {visual && (
          <div
            ref={visualRef}
            className={`absolute cursor-move ${readOnly ? '' : 'hover:outline hover:outline-dashed hover:outline-2 hover:outline-winshirt-blue-light'}`}
            style={{
              left: `${visualSettings.position.x}px`,
              top: `${visualSettings.position.y}px`,
              width: `${visualSettings.size.width}px`,
              height: `${visualSettings.size.height}px`,
              opacity: visualSettings.opacity,
              mixBlendMode: 'multiply'
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
                <div className="absolute top-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-nw-resize" 
                    onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                <div className="absolute top-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-ne-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-winshirt-blue-light cursor-sw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-winshirt-blue-light cursor-se-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'se')} />
                <div className="absolute top-1/2 left-0 w-3 h-3 bg-winshirt-blue-light cursor-w-resize -translate-y-1/2"
                    onMouseDown={(e) => handleResizeStart(e, 'w')} />
                <div className="absolute top-1/2 right-0 w-3 h-3 bg-winshirt-blue-light cursor-e-resize -translate-y-1/2"
                    onMouseDown={(e) => handleResizeStart(e, 'e')} />
                <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-s-resize -translate-x-1/2"
                    onMouseDown={(e) => handleResizeStart(e, 's')} />
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-winshirt-blue-light cursor-n-resize -translate-x-1/2"
                    onMouseDown={(e) => handleResizeStart(e, 'n')} />
              </>
            )}
          </div>
        )}
      </div>
      
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

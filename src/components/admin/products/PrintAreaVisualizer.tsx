
import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { PrintArea } from '@/types/product';

interface PrintAreaVisualizerProps {
  productImage: string;
  productSecondaryImage?: string;
  printAreas: PrintArea[];
  selectedAreaId?: number | null;
  onSelectPrintArea?: (id: number) => void;
  onUpdateAreaPosition?: (id: number, x: number, y: number) => void;
  hideAreaBorders?: boolean;
}

const PrintAreaVisualizer: React.FC<PrintAreaVisualizerProps> = ({
  productImage,
  productSecondaryImage,
  printAreas = [],
  selectedAreaId,
  onSelectPrintArea,
  onUpdateAreaPosition,
  hideAreaBorders = false
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAreaId, setDraggedAreaId] = useState<number | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour obtenir les coordonnées relatives au conteneur
  const getRelativeCoordinates = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };
  
  // Démarrer le drag d'une zone
  const handleAreaMouseDown = (e: React.MouseEvent, areaId: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    const coords = getRelativeCoordinates(e);
    console.log(`Starting drag of area ${areaId} at ${coords.x}, ${coords.y}`);
    
    setIsDragging(true);
    setDraggedAreaId(areaId);
    setStartPos(coords);
    
    if (onSelectPrintArea) {
      onSelectPrintArea(areaId);
    }
  };
  
  // Gérer le mouvement de la souris pour le drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || draggedAreaId === null || !onUpdateAreaPosition) return;
    
    const currentPos = getRelativeCoordinates(e);
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    
    const area = printAreas.find(a => a.id === draggedAreaId);
    if (!area) return;
    
    // Calculer les nouvelles coordonnées
    const newX = area.bounds.x + deltaX;
    const newY = area.bounds.y + deltaY;
    
    console.log(`Moving area ${draggedAreaId} to ${newX}, ${newY}`);
    
    // Actualiser la position
    onUpdateAreaPosition(draggedAreaId, newX, newY);
    
    // Mettre à jour le point de départ pour le prochain mouvement
    setStartPos(currentPos);
  };
  
  // Terminer le drag
  const handleMouseUp = () => {
    if (isDragging && draggedAreaId !== null) {
      console.log(`Finished dragging area ${draggedAreaId}`);
    }
    
    setIsDragging(false);
    setDraggedAreaId(null);
  };
  
  // Ajouter et retirer les écouteurs d'événements globaux
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, draggedAreaId, startPos]);
  
  // Filtrer les zones par position (front/back)
  const frontAreas = printAreas.filter(area => area.position === 'front');
  const backAreas = printAreas.filter(area => area.position === 'back');
  
  // S'assurer que nous ne quittons pas la page lors du changement de vue
  const handleViewChange = (view: 'front' | 'back') => {
    console.log(`Changing view to ${view}`);
    setActiveView(view);
  };

  // Toujours retourner "C" pour Custom car c'est la seule option maintenant
  const getFormatLabel = () => {
    return 'C';
  };
  
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Aperçu du produit</h3>
        
        {/* Boutons pour basculer entre les vues */}
        <div className="flex bg-winshirt-space-light rounded-md">
          <button
            type="button"
            className={`px-3 py-1 rounded-l-md text-sm ${activeView === 'front' ? 'bg-winshirt-purple text-white' : 'text-gray-400'}`}
            onClick={() => handleViewChange('front')}
          >
            Recto
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-r-md text-sm ${activeView === 'back' ? 'bg-winshirt-purple text-white' : 'text-gray-400'}`}
            onClick={() => handleViewChange('back')}
          >
            Verso
          </button>
        </div>
      </div>
      
      <div className="bg-winshirt-space-light p-2 rounded-md flex items-center gap-2">
        <span className="text-sm text-gray-300">Zoom:</span>
        <Slider
          min={0.5}
          max={2}
          step={0.1}
          value={[zoom]}
          onValueChange={handleZoomChange}
          className="w-32"
        />
        <span className="text-sm text-gray-300">{Math.round(zoom * 100)}%</span>
      </div>
      
      <div
        ref={containerRef}
        className="relative border border-gray-700 rounded-lg overflow-hidden bg-winshirt-space-light"
        style={{
          height: '400px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Vue recto */}
        {activeView === 'front' && (
          <>
            {/* Image du produit */}
            {productImage && (
              <img
                src={productImage}
                alt="Recto du produit"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            )}
            
            {/* Zones d'impression recto */}
            {frontAreas.map(area => (
              <div
                key={area.id}
                className={`absolute ${!hideAreaBorders ? 'border-2' : ''} ${
                  selectedAreaId === area.id
                    ? 'border-winshirt-purple'
                    : 'border-gray-700'
                } rounded-md cursor-move transition-colors duration-200`}
                style={{
                  left: `${area.bounds.x}px`,
                  top: `${area.bounds.y}px`,
                  width: `${area.bounds.width}px`,
                  height: `${area.bounds.height}px`,
                  backgroundColor: selectedAreaId === area.id ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }}
                onMouseDown={(e) => handleAreaMouseDown(e, area.id)}
              >
                {!hideAreaBorders && (
                  <div className="absolute top-0 left-0 transform -translate-y-full bg-winshirt-space-light text-xs px-1 rounded-t">
                    {area.name} <span className="text-winshirt-blue-light">[{getFormatLabel()}]</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {/* Vue verso */}
        {activeView === 'back' && (
          <>
            {/* Image secondaire ou image principale si pas d'image secondaire */}
            {(productSecondaryImage || productImage) && (
              <img
                src={productSecondaryImage || productImage}
                alt="Verso du produit"
                className="absolute top-0 left-0 w-full h-full object-contain"
                style={{ opacity: productSecondaryImage ? 1 : 0.7 }}
              />
            )}
            
            {/* Zones d'impression verso */}
            {backAreas.map(area => (
              <div
                key={area.id}
                className={`absolute ${!hideAreaBorders ? 'border-2' : ''} ${
                  selectedAreaId === area.id
                    ? 'border-winshirt-purple'
                    : 'border-gray-700'
                } rounded-md cursor-move transition-colors duration-200`}
                style={{
                  left: `${area.bounds.x}px`,
                  top: `${area.bounds.y}px`,
                  width: `${area.bounds.width}px`,
                  height: `${area.bounds.height}px`,
                  backgroundColor: selectedAreaId === area.id ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }}
                onMouseDown={(e) => handleAreaMouseDown(e, area.id)}
              >
                {!hideAreaBorders && (
                  <div className="absolute top-0 left-0 transform -translate-y-full bg-winshirt-space-light text-xs px-1 rounded-t">
                    {area.name} <span className="text-winshirt-blue-light">[{getFormatLabel()}]</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="text-sm text-gray-400">
        <p>
          {activeView === 'front' ? 'Vue recto' : 'Vue verso'} - 
          {activeView === 'front' ? frontAreas.length : backAreas.length} zone(s) d'impression
        </p>
        <p className="text-xs">Cliquez et faites glisser les zones pour les repositionner</p>
      </div>
    </div>
  );
};

export default PrintAreaVisualizer;

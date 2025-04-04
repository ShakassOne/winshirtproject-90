
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrintArea } from '@/types/product';
import { Slider } from "@/components/ui/slider";

interface PrintAreaVisualizerProps {
  productImage: string;
  productSecondaryImage?: string;
  printAreas: PrintArea[];
  onSelectPrintArea?: (areaId: number) => void;
  onUpdateAreaPosition?: (areaId: number, x: number, y: number) => void;
  selectedAreaId?: number | null;
  readOnly?: boolean;
}

const PrintAreaVisualizer: React.FC<PrintAreaVisualizerProps> = ({
  productImage,
  productSecondaryImage,
  printAreas,
  onSelectPrintArea,
  onUpdateAreaPosition,
  selectedAreaId,
  readOnly = false
}) => {
  const frontContainerRef = useRef<HTMLDivElement>(null);
  const backContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("front");
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  
  // Fonction pour gérer le début du drag
  const handleDragStart = (e: React.MouseEvent, area: PrintArea) => {
    if (readOnly || !onSelectPrintArea || !onUpdateAreaPosition) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Sélectionner la zone
    onSelectPrintArea(area.id);
    
    // Obtenir la position relative de la souris dans la zone
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDragging(true);
  };
  
  // Fonction pour gérer le drag
  const handleDrag = (e: MouseEvent) => {
    if (!dragging || !selectedAreaId || !onUpdateAreaPosition) return;
    
    const containerRef = activeTab === 'front' ? frontContainerRef : backContainerRef;
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculer la nouvelle position relative au conteneur
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // S'assurer que la zone reste dans les limites du conteneur
    const x = Math.max(0, Math.min(newX, containerRect.width));
    const y = Math.max(0, Math.min(newY, containerRect.height));
    
    // Mettre à jour la position de la zone
    onUpdateAreaPosition(selectedAreaId, x, y);
  };
  
  // Fonction pour terminer le drag
  const handleDragEnd = () => {
    setDragging(false);
  };
  
  // Ajouter et supprimer les écouteurs d'événements globaux
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragging, selectedAreaId, activeTab]);

  const handleAreaClick = (areaId: number) => {
    if (!readOnly && onSelectPrintArea) {
      onSelectPrintArea(areaId);
    }
  };

  const frontAreas = printAreas.filter(area => area.position === 'front');
  const backAreas = printAreas.filter(area => area.position === 'back');

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pocket':
        return 'P';
      case 'a4':
        return 'A4';
      case 'a3':
        return 'A3';
      case 'custom':
        return 'C';
      default:
        return '?';
    }
  };
  
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };
  
  return (
    <div className="border border-winshirt-purple/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-winshirt-purple/30 bg-winshirt-space-light">
        <h3 className="text-lg font-medium text-white">Aperçu des zones d'impression</h3>
        {!readOnly && (
          <p className="text-sm text-gray-400 mt-1">
            Cliquez sur une zone pour la sélectionner, puis faites-la glisser pour la repositionner
          </p>
        )}
      </div>

      <div className="p-3 border-b border-winshirt-purple/30 bg-winshirt-space-light flex items-center gap-4">
        <span className="text-sm text-gray-300">Zoom:</span>
        <Slider
          value={[zoom]}
          onValueChange={handleZoomChange}
          min={50}
          max={150}
          step={5}
          className="max-w-[200px]"
        />
        <span className="text-sm text-gray-300">{zoom}%</span>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full bg-winshirt-space-light border-b border-winshirt-purple/30">
          <TabsTrigger value="front">Recto</TabsTrigger>
          <TabsTrigger value="back">Verso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="front" className="p-4 bg-gray-900/50">
          <div 
            ref={frontContainerRef}
            className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mx-auto"
            style={{ width: '100%', height: '400px', maxWidth: '500px' }}
          >
            {productImage ? (
              <img 
                src={productImage} 
                alt="Recto du produit" 
                className="w-full h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune image principale définie
              </div>
            )}
            
            {frontAreas.map((area) => (
              <div
                key={area.id}
                className={`absolute border-2 ${
                  selectedAreaId === area.id 
                    ? 'border-winshirt-blue' 
                    : 'border-winshirt-purple/50 border-dashed'
                } ${!readOnly ? 'cursor-move' : ''}`}
                style={{
                  left: `${area.bounds.x}px`,
                  top: `${area.bounds.y}px`,
                  width: `${area.bounds.width}px`,
                  height: `${area.bounds.height}px`,
                  zIndex: 5
                }}
                onClick={() => handleAreaClick(area.id)}
                onMouseDown={(e) => handleDragStart(e, area)}
              >
                <div className="absolute top-0 left-0 transform -translate-y-full bg-winshirt-space-light text-xs px-1 rounded-t">
                  {area.name} <span className="text-winshirt-blue-light">[{getFormatLabel(area.format)}]</span>
                </div>
              </div>
            ))}
            
            {frontAreas.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Aucune zone d'impression définie pour le recto
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="back" className="p-4 bg-gray-900/50">
          <div 
            ref={backContainerRef}
            className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mx-auto"
            style={{ width: '100%', height: '400px', maxWidth: '500px' }}
          >
            {productSecondaryImage ? (
              <img 
                src={productSecondaryImage} 
                alt="Verso du produit" 
                className="w-full h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : productImage ? (
              <img 
                src={productImage} 
                alt="Verso du produit (image principale)" 
                className="w-full h-full object-contain opacity-70 transition-transform"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune image secondaire définie
              </div>
            )}
            
            {backAreas.map((area) => (
              <div
                key={area.id}
                className={`absolute border-2 ${
                  selectedAreaId === area.id 
                    ? 'border-winshirt-blue' 
                    : 'border-winshirt-purple/50 border-dashed'
                } ${!readOnly ? 'cursor-move' : ''}`}
                style={{
                  left: `${area.bounds.x}px`,
                  top: `${area.bounds.y}px`,
                  width: `${area.bounds.width}px`,
                  height: `${area.bounds.height}px`,
                  zIndex: 5
                }}
                onClick={() => handleAreaClick(area.id)}
                onMouseDown={(e) => handleDragStart(e, area)}
              >
                <div className="absolute top-0 left-0 transform -translate-y-full bg-winshirt-space-light text-xs px-1 rounded-t">
                  {area.name} <span className="text-winshirt-blue-light">[{getFormatLabel(area.format)}]</span>
                </div>
              </div>
            ))}
            
            {backAreas.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Aucune zone d'impression définie pour le verso
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrintAreaVisualizer;

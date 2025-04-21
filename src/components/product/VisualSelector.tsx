
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisuals } from '@/data/mockVisuals';
import { Visual, VisualCategory } from '@/types/visual';
import CustomVisualUploader from './CustomVisualUploader';

interface VisualSelectorProps {
  selectedVisualId: number | null;
  onSelectVisual: (visual: Visual | null) => void;
  categoryId?: number | null;
  activePosition?: 'front' | 'back';
  hideUploader?: boolean;
  gridCols?: 2 | 3 | 4;
  autoShowVisuals?: boolean; // New prop to force showing visuals immediately
}

const VisualSelector: React.FC<VisualSelectorProps> = ({
  selectedVisualId,
  onSelectVisual,
  categoryId,
  activePosition = 'front',
  hideUploader = false,
  gridCols = 3,
  autoShowVisuals = false
}) => {
  const { 
    getCategories, 
    getVisualsByCategory,
    getVisualById,
    visuals: allVisuals
  } = useVisuals();
  
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [uploadedVisual, setUploadedVisual] = useState<{ file: File; previewUrl: string } | null>(null);
  const [selectedVisual, setSelectedVisual] = useState<Visual | null>(null);
  
  // Initialize visuals when categoryId changes
  useEffect(() => {
    const loadVisuals = async () => {
      // Si nous avons un visuel sélectionné, trouvons-le
      if (selectedVisualId !== null) {
        const visual = getVisualById(selectedVisualId);
        if (visual) {
          setSelectedVisual(visual);
        }
      }
      
      // Si une catégorie est spécifiée, charger les visuels correspondants
      if (categoryId) {
        const categoryVisuals = getVisualsByCategory(categoryId);
        console.log(`Loaded visuals for category ${categoryId}: ${categoryVisuals.length} visuals`);
        setVisuals(categoryVisuals);
      } else if (autoShowVisuals || allVisuals.length > 0) {
        // Afficher tous les visuels si aucune catégorie n'est spécifiée ou si autoShowVisuals est true
        console.log(`Showing all ${allVisuals.length} visuals`);
        setVisuals(allVisuals);
      }
    };
    
    loadVisuals();
  }, [categoryId, getVisualsByCategory, getVisualById, selectedVisualId, allVisuals, autoShowVisuals]);
  
  const handleSelectVisual = (visual: Visual) => {
    console.log(`Selected visual for ${activePosition}: ${visual.id} - ${visual.name}`);
    // Réinitialiser le visuel uploadé si un visuel prédéfini est sélectionné
    setUploadedVisual(null);
    setSelectedVisual(visual);
    onSelectVisual(visual);
  };
  
  const handleRemoveVisual = () => {
    setUploadedVisual(null);
    setSelectedVisual(null);
    onSelectVisual(null);
  };

  const handleVisualUpload = (file: File, previewUrl: string) => {
    // Créer un visuel personnalisé basé sur le fichier uploadé
    const customVisual: Visual = {
      id: -Date.now(), // ID négatif pour distinguer les visuels personnalisés
      name: file.name,
      description: 'Visuel personnalisé',
      image: previewUrl,
      categoryId: -1, // Catégorie spéciale pour les uploads
      categoryName: 'Uploads personnalisés'
    };
    
    setUploadedVisual({ file, previewUrl });
    setSelectedVisual(customVisual);
    onSelectVisual(customVisual);
  };

  const handleVisualRemove = () => {
    setUploadedVisual(null);
    setSelectedVisual(null);
    onSelectVisual(null);
  };

  // Configure grid columns classes based on gridCols prop
  const gridColumnsClass = 
    gridCols === 2 ? "grid-cols-1 sm:grid-cols-2" :
    gridCols === 4 ? "grid-cols-2 sm:grid-cols-4" :
    "grid-cols-2 sm:grid-cols-3"; // Default (3)

  return (
    <div className="border border-winshirt-purple/30 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-winshirt-purple/30">
        <h3 className="text-lg font-medium">
          Choisissez un visuel
        </h3>
        {!hideUploader && (
          <CustomVisualUploader
            onVisualUpload={handleVisualUpload}
            onVisualRemove={handleVisualRemove}
            uploadedVisual={uploadedVisual}
            allowedFileTypes={['.png', '.jpg', '.jpeg', '.svg', '.eps', '.ai']}
            buttonStyle="compact"
          />
        )}
      </div>
      
      <ScrollArea className="h-64">
        <div className={`grid ${gridColumnsClass} gap-3 p-4`}>
          {visuals.length > 0 ? (
            visuals.map((visual) => (
              <div 
                key={visual.id}
                onClick={() => handleSelectVisual(visual)}
                className={`
                  cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition-all
                  ${(selectedVisual && selectedVisual.id === visual.id) || selectedVisualId === visual.id
                    ? 'border-winshirt-purple shadow-lg scale-105' 
                    : 'border-gray-700/30'}
                `}
              >
                <img 
                  src={visual.image} 
                  alt={visual.name} 
                  className="w-full aspect-square object-contain bg-gray-800/50"
                />
                <div className="p-2 text-center">
                  <p className="text-sm truncate">{visual.name}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 p-8 text-center">
              <p className="text-gray-400">Aucun visuel disponible dans cette catégorie</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {(selectedVisual || selectedVisualId) && (
        <div className="p-4 border-t border-winshirt-purple/30 bg-winshirt-purple/10 flex justify-between items-center">
          <span className="text-sm">Visuel sélectionné: {selectedVisual?.name || getVisualById(selectedVisualId || 0)?.name}</span>
          <button 
            onClick={handleRemoveVisual}
            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualSelector;

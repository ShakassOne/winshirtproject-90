
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
  autoShowVisuals = true // Default to true to show visuals immediately
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
  
  // Initialize visuals immediately on component mount
  useEffect(() => {
    loadVisuals();
  }, []);
  
  // Update visuals when categoryId changes
  useEffect(() => {
    loadVisuals();
  }, [categoryId, allVisuals]);
  
  // Load visuals based on category or show all if no category
  const loadVisuals = () => {
    // If we have a selected visual, find it
    if (selectedVisualId !== null) {
      const visual = getVisualById(selectedVisualId);
      if (visual) {
        setSelectedVisual(visual);
      }
    }
    
    // Load visuals based on category or all visuals
    if (categoryId) {
      const categoryVisuals = getVisualsByCategory(categoryId);
      console.log(`Loaded visuals for category ${categoryId}: ${categoryVisuals.length} visuals`);
      setVisuals(categoryVisuals);
    } else {
      // Show all visuals if no category is specified
      console.log(`Showing all ${allVisuals.length} visuals`);
      setVisuals(allVisuals);
    }
  };
  
  const handleSelectVisual = (visual: Visual) => {
    console.log(`Selected visual for ${activePosition}: ${visual.id} - ${visual.name}`);
    // Reset uploaded visual if a predefined visual is selected
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
    // Create a custom visual based on the uploaded file
    const customVisual: Visual = {
      id: -Date.now(), // Negative ID to distinguish custom visuals
      name: file.name,
      description: 'Visuel personnalisé',
      image: previewUrl,
      categoryId: -1, // Special category for uploads
      categoryName: 'Uploads personnalisés'
    };
    
    setUploadedVisual({ file, previewUrl });
    setSelectedVisual(customVisual);
    onSelectVisual(customVisual);
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

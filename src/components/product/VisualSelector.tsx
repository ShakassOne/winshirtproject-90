
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisuals } from '@/data/mockVisuals';
import { Visual, VisualCategory } from '@/types/visual';
import CustomVisualUploader from './CustomVisualUploader';

interface VisualSelectorProps {
  selectedVisualId: number | null;
  onSelectVisual: (visual: Visual | null) => void;
  categoryId?: number | null;
}

const VisualSelector: React.FC<VisualSelectorProps> = ({
  selectedVisualId,
  onSelectVisual,
  categoryId
}) => {
  const { 
    getCategories, 
    getVisualsByCategory,
    getVisualById,
    visuals: allVisuals
  } = useVisuals();
  
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [uploadedVisual, setUploadedVisual] = useState<{ file: File; previewUrl: string } | null>(null);
  const [selectedVisual, setSelectedVisual] = useState<Visual | null>(null);
  
  // Initialize categories and select the first one or the specified one
  useEffect(() => {
    const loadCategories = async () => {
      const allCategories = getCategories();
      
      if (allCategories.length > 0) {
        setCategories(allCategories);
        
        // Si nous avons un visuel sélectionné, trouvons-le
        if (selectedVisualId !== null) {
          const visual = getVisualById(selectedVisualId);
          if (visual) {
            setSelectedVisual(visual);
            
            // Si le visuel a une catégorie, on l'active
            if (visual.categoryId) {
              const visualCategoryId = visual.categoryId.toString();
              setActiveCategory(visualCategoryId);
              const categoryVisuals = getVisualsByCategory(visual.categoryId);
              console.log(`Loaded category ${visual.categoryId} with ${categoryVisuals.length} visuals`);
              setVisuals(categoryVisuals);
              return;
            }
          }
        }
        
        // Si une catégorie est spécifiée, l'utiliser; sinon utiliser la première
        if (categoryId) {
          const categoryIdStr = categoryId.toString();
          setActiveCategory(categoryIdStr);
          const categoryVisuals = getVisualsByCategory(categoryId);
          console.log(`Using specified category ${categoryId} with ${categoryVisuals.length} visuals`);
          setVisuals(categoryVisuals);
        } else if (allCategories[0]) {
          const firstCatId = allCategories[0].id.toString();
          setActiveCategory(firstCatId);
          const firstCatVisuals = getVisualsByCategory(allCategories[0].id);
          console.log(`Using first category ${allCategories[0].id} with ${firstCatVisuals.length} visuals`);
          setVisuals(firstCatVisuals);
        }
      }
    };
    
    loadCategories();
  }, [categoryId, getCategories, getVisualsByCategory, getVisualById, selectedVisualId]);
  
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const categoryVisuals = getVisualsByCategory(Number(categoryId));
    console.log(`Switching to category ${categoryId} with ${categoryVisuals.length} visuals`);
    setVisuals(categoryVisuals);
  };
  
  const handleSelectVisual = (visual: Visual) => {
    console.log(`Selected visual: ${visual.id} - ${visual.name}`);
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

  // Make sure we have at least one category
  if (categories.length === 0) {
    return (
      <div className="border border-winshirt-purple/30 rounded-lg p-4">
        <p className="text-center text-gray-400">Aucune catégorie de visuels disponible</p>
      </div>
    );
  }

  return (
    <div className="border border-winshirt-purple/30 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-winshirt-purple/30">
        <h3 className="text-lg font-medium">Choisissez un visuel</h3>
        <CustomVisualUploader
          onVisualUpload={handleVisualUpload}
          onVisualRemove={handleVisualRemove}
          uploadedVisual={uploadedVisual}
          allowedFileTypes={['.png', '.jpg', '.jpeg', '.svg', '.eps', '.ai']}
        />
      </div>
      
      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="grid grid-flow-col auto-cols-fr bg-winshirt-space-light border-b border-winshirt-purple/30">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id.toString()}
              className="data-[state=active]:bg-winshirt-purple/20 py-2"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id.toString()} className="mt-0">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
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
                        <p className="text-xs truncate">{visual.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 p-8 text-center">
                    <p className="text-gray-400">Aucun visuel disponible dans cette catégorie</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
      
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


import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisuals } from '@/data/mockVisuals';
import { Visual, VisualCategory } from '@/types/visual';

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
  const { getCategories, getVisualsByCategory, getVisualsByCategoryId } = useVisuals();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [visuals, setVisuals] = useState<Visual[]>([]);
  
  // Initialize categories and select the first one or the specified one
  useEffect(() => {
    const allCategories = getCategories();
    setCategories(allCategories);
    
    if (allCategories.length > 0) {
      // Si nous avons une categoryId, utiliser celle-là; sinon utiliser la première catégorie
      if (categoryId) {
        const categoryIdStr = categoryId.toString();
        setActiveCategory(categoryIdStr);
        
        // Utiliser le bon getter en fonction de la situation
        const categoryVisuals = getVisualsByCategoryId 
          ? getVisualsByCategoryId(categoryId) 
          : getVisualsByCategory(categoryId);
          
        setVisuals(categoryVisuals);
      } else if (allCategories[0]) {
        const firstCatId = allCategories[0].id.toString();
        setActiveCategory(firstCatId);
        setVisuals(getVisualsByCategory(allCategories[0].id));
      }
    }
  }, [categoryId, getCategories, getVisualsByCategory, getVisualsByCategoryId]);
  
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setVisuals(getVisualsByCategory(Number(categoryId)));
  };
  
  const handleSelectVisual = (visual: Visual) => {
    onSelectVisual(visual);
  };
  
  const handleRemoveVisual = () => {
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
      <h3 className="text-lg font-medium p-4 border-b border-winshirt-purple/30">
        Choisissez un visuel
      </h3>
      
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
                        ${selectedVisualId === visual.id 
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
      
      {selectedVisualId && (
        <div className="p-4 border-t border-winshirt-purple/30 bg-winshirt-purple/10 flex justify-between items-center">
          <span className="text-sm">Visuel sélectionné</span>
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


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisuals } from '@/data/mockVisuals';
import { Visual, VisualCategory } from '@/types/visual';

interface VisualSelectorProps {
  selectedVisualId: number | null;
  onSelectVisual: (visual: Visual | null) => void;
}

const VisualSelector: React.FC<VisualSelectorProps> = ({
  selectedVisualId,
  onSelectVisual
}) => {
  const { getCategories, getVisualsByCategory } = useVisuals();
  const [activeCategory, setActiveCategory] = useState<string>(getCategories()[0]?.id.toString() || "1");
  
  const categories = getCategories();
  const visuals = getVisualsByCategory(Number(activeCategory));
  
  const handleSelectVisual = (visual: Visual) => {
    onSelectVisual(visual);
  };
  
  const handleRemoveVisual = () => {
    onSelectVisual(null);
  };

  return (
    <div className="border border-winshirt-purple/30 rounded-lg overflow-hidden">
      <h3 className="text-lg font-medium p-4 border-b border-winshirt-purple/30">
        Choisissez un visuel
      </h3>
      
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
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
                {getVisualsByCategory(category.id).map((visual) => (
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
                ))}
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

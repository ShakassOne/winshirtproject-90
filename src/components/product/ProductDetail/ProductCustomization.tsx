
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Visual, VisualCategory, ProductVisualSettings } from '@/types/visual';
import { PrintArea } from '@/types/product';
import VisualPositioner from '@/components/product/VisualPositioner';
import VisualSelector from '@/components/product/VisualSelector';
import CustomVisualUploader from '@/components/product/CustomVisualUploader';

interface ProductCustomizationProps {
  productImage: string;
  productSecondaryImage?: string;
  visual: Visual | null;
  visualSettings: ProductVisualSettings;
  onUpdateSettings: (settings: Partial<ProductVisualSettings>) => void;
  position: 'front' | 'back';
  setPosition: (position: 'front' | 'back') => void;
  handleSelectVisual: (visual: Visual | null) => void;
  selectedCategoryId: number | null;
  handleCategoryChange: (categoryId: number | null) => void;
  visualCategories: VisualCategory[];
  printAreas?: PrintArea[];
  selectedPrintArea: PrintArea | null;
  handlePrintAreaChange: (areaId: number) => void;
  handleVisualUpload: (file: File, previewUrl: string) => void;
}

const ProductCustomization: React.FC<ProductCustomizationProps> = ({
  productImage,
  productSecondaryImage,
  visual,
  visualSettings,
  onUpdateSettings,
  position,
  setPosition,
  handleSelectVisual,
  selectedCategoryId,
  handleCategoryChange,
  visualCategories,
  printAreas,
  selectedPrintArea,
  handlePrintAreaChange,
  handleVisualUpload
}) => {
  // Determine if there are print areas available
  const hasPrintAreas = printAreas && printAreas.length > 0;
  
  // Handle tab change for recto/verso
  const handleTabChange = (value: string) => {
    setPosition(value as 'front' | 'back');
  };

  // Sélectionner automatiquement la première catégorie au chargement
  useEffect(() => {
    if (visualCategories.length > 0 && !selectedCategoryId) {
      handleCategoryChange(visualCategories[0].id);
    }
  }, [visualCategories]);

  return (
    <Tabs defaultValue="customize" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-4">
        <TabsTrigger value="customize">Personnaliser</TabsTrigger>
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
      </TabsList>
      
      <TabsContent value="preview" className="mt-0">
        <Tabs 
          defaultValue={position} 
          onValueChange={handleTabChange} 
          className="w-full mb-4"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="front">Recto</TabsTrigger>
            <TabsTrigger value="back">Verso</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <VisualPositioner
          productImage={productImage}
          productSecondaryImage={productSecondaryImage}
          visual={visual}
          visualSettings={visualSettings}
          onUpdateSettings={onUpdateSettings}
          position={position}
          readOnly={true}
          printAreas={printAreas}
          selectedPrintArea={selectedPrintArea}
          hideOpacityControl={true}
        />
      </TabsContent>
      
      <TabsContent value="customize" className="mt-0 space-y-6">
        <div className="mt-2">
          <VisualPositioner
            productImage={productImage}
            productSecondaryImage={productSecondaryImage}
            visual={visual}
            visualSettings={visualSettings}
            onUpdateSettings={onUpdateSettings}
            position={position}
            printAreas={printAreas?.filter(area => area.position === position)}
            selectedPrintArea={selectedPrintArea}
            hideOpacityControl={true}
          />
        </div>
        
        <Tabs 
          defaultValue={position} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="front">Recto</TabsTrigger>
            <TabsTrigger value="back">Verso</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-4">
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visualCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-winshirt-purple text-white'
                    : 'bg-winshirt-space-light hover:bg-winshirt-purple/20 text-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <CustomVisualUploader
            onVisualUpload={handleVisualUpload}
            onVisualRemove={() => handleSelectVisual(null)}
            uploadedVisual={null}
            allowedFileTypes={['.png', '.jpg', '.jpeg', '.svg', '.eps', '.ai']}
            buttonStyle="compact"
          />
        </div>
        
        <div className="mt-4">
          <VisualSelector
            selectedVisualId={visual?.id || null}
            onSelectVisual={handleSelectVisual}
            categoryId={selectedCategoryId}
            activePosition={position}
            hideUploader={true}
            gridCols={4}
          />
        </div>
        
        {hasPrintAreas && (
          <div className="space-y-2 mt-4">
            <Label className="text-white">Zone d'impression</Label>
            <Select
              value={selectedPrintArea ? selectedPrintArea.id.toString() : ''}
              onValueChange={(value) => handlePrintAreaChange(parseInt(value))}
            >
              <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                <SelectValue placeholder="Choisir une zone d'impression" />
              </SelectTrigger>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                {printAreas?.filter(area => area.position === position).map(area => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProductCustomization;

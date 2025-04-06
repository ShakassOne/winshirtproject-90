
import React from 'react';
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

  return (
    <Tabs defaultValue="preview" className="w-full">
      {/* 1. Aperçu et Personnalisation tabs */}
      <TabsList className="w-full grid grid-cols-2 mb-4">
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
        <TabsTrigger value="customize">Personnaliser</TabsTrigger>
      </TabsList>
      
      <TabsContent value="preview" className="mt-0">
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
        />
      </TabsContent>
      
      <TabsContent value="customize" className="mt-0 space-y-6">
        {/* 2. Le Visuel du T-Shirt (VisualPositioner) */}
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
          />
        </div>
        
        {/* 3. Recto Verso tabs */}
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
        
        {/* 4. Sélection de la catégorie de visuels et 5. Upload côte à côte */}
        <div className="flex flex-wrap gap-4 items-start">
          <div className="space-y-2 flex-1 min-w-[180px]">
            <Label className="text-white">Catégorie de visuels</Label>
            <Select
              value={selectedCategoryId ? selectedCategoryId.toString() : ""}
              onValueChange={(value) => handleCategoryChange(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                {visualCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 mt-7">
            <CustomVisualUploader
              onVisualUpload={handleVisualUpload}
              onVisualRemove={() => handleSelectVisual(null)}
              uploadedVisual={null}
              allowedFileTypes={['.png', '.jpg', '.jpeg', '.svg', '.eps', '.ai']}
              buttonStyle="compact"
            />
          </div>
        </div>
        
        {/* 6. Images (VisualSelector) avec grille 4 colonnes au lieu de 3 */}
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
        
        {/* Zone d'impression si disponible */}
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

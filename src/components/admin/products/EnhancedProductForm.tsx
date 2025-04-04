
import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import { PrintArea } from '@/types/product';
import ProductForm from './ProductForm';
import LotterySelection from './LotterySelection';
import AdvancedFiltersForm from './AdvancedFiltersForm';
import PrintAreaManager from './PrintAreaManager';
import PrintAreaVisualizer from './PrintAreaVisualizer';

interface EnhancedProductFormProps {
  isCreating: boolean;
  selectedProductId: number | null;
  form: UseFormReturn<any>;
  activeLotteries: ExtendedLottery[];
  visualCategories: VisualCategory[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  onCreateProduct: () => void;
  addSize: (size: string) => void;
  removeSize: (size: string) => void;
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  toggleLottery: (lotteryId: string) => void;
  selectAllLotteries: () => void;
  deselectAllLotteries: () => void;
  addPrintArea?: (printArea: Omit<PrintArea, 'id'>) => void;
  updatePrintArea?: (id: number, data: Partial<PrintArea>) => void;
  removePrintArea?: (id: number) => void;
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  isCreating,
  selectedProductId,
  form,
  activeLotteries,
  visualCategories,
  onCancel,
  onSubmit,
  onCreateProduct,
  addSize,
  removeSize,
  addColor,
  removeColor,
  toggleLottery,
  selectAllLotteries,
  deselectAllLotteries,
  addPrintArea,
  updatePrintArea,
  removePrintArea
}) => {
  const [selectedTab, setSelectedTab] = useState("basic-info");
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  
  const handleAddPrintArea = (printArea: Omit<PrintArea, 'id'>) => {
    if (addPrintArea) {
      addPrintArea(printArea);
    }
  };
  
  const handleUpdatePrintArea = (id: number, data: Partial<PrintArea>) => {
    if (updatePrintArea) {
      updatePrintArea(id, data);
    }
  };
  
  const handleRemovePrintArea = (id: number) => {
    if (removePrintArea) {
      removePrintArea(id);
      if (selectedAreaId === id) {
        setSelectedAreaId(null);
      }
    }
  };
  
  // Update print area position when drag in visualizer
  const handleUpdateAreaPosition = (areaId: number, x: number, y: number) => {
    if (updatePrintArea) {
      updatePrintArea(areaId, {
        bounds: {
          ...form.getValues().printAreas.find((area: PrintArea) => area.id === areaId).bounds,
          x,
          y
        }
      });
    }
  };

  if (!isCreating && !selectedProductId) {
    return (
      <Card className="p-6 text-center text-gray-400">
        <p>Veuillez sélectionner un produit dans la liste ou créer un nouveau produit.</p>
        <Button
          className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
          onClick={onCreateProduct}
        >
          Créer un nouveau produit
        </Button>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic-info">Informations de base</TabsTrigger>
            <TabsTrigger value="lotteries">Loteries associées</TabsTrigger>
            <TabsTrigger value="print-areas">Zones d'impression</TabsTrigger>
            <TabsTrigger value="advanced-filters">Filtres avancés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="space-y-6">
            <ProductForm 
              form={form} 
              addSize={addSize}
              removeSize={removeSize}
              addColor={addColor}
              removeColor={removeColor}
              visualCategories={visualCategories}
            />
          </TabsContent>
          
          <TabsContent value="lotteries" className="space-y-6">
            <LotterySelection
              form={form}
              activeLotteries={activeLotteries}
              toggleLottery={toggleLottery}
              selectAllLotteries={selectAllLotteries}
              deselectAllLotteries={deselectAllLotteries}
            />
          </TabsContent>
          
          <TabsContent value="print-areas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PrintAreaManager
                printAreas={form.getValues().printAreas || []}
                onAddArea={handleAddPrintArea}
                onRemoveArea={handleRemovePrintArea}
                onUpdateArea={handleUpdatePrintArea}
                selectedAreaId={selectedAreaId}
                onSelectArea={setSelectedAreaId}
              />
              
              <PrintAreaVisualizer
                productImage={form.getValues().image || ''}
                productSecondaryImage={form.getValues().secondaryImage || ''}
                printAreas={form.getValues().printAreas || []}
                onSelectPrintArea={setSelectedAreaId}
                onUpdateAreaPosition={handleUpdateAreaPosition}
                selectedAreaId={selectedAreaId}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced-filters" className="space-y-6">
            <AdvancedFiltersForm form={form} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-winshirt-purple/30 text-white"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
          >
            {isCreating ? "Créer le produit" : "Mettre à jour le produit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EnhancedProductForm;


import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import LotterySelection from './LotterySelection';
import ProductForm from './ProductForm';
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProductFormProps {
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
  selectAllLotteries?: () => void;
  deselectAllLotteries?: () => void;
}

const EnhancedProductForm: React.FC<ProductFormProps> = ({
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
  deselectAllLotteries
}) => {
  const selectedLotteries = form.watch('linkedLotteries') || [];
  const tickets = form.watch('tickets') || 1;
  
  // Si l'utilisateur n'est ni en train de créer ni en train d'éditer un produit
  if (!isCreating && !selectedProductId) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl text-white mb-4">Sélectionnez un produit à modifier ou créez-en un nouveau</h3>
        <button 
          onClick={onCreateProduct}
          className="px-4 py-2 bg-winshirt-blue rounded-lg hover:bg-winshirt-blue-dark transition-colors"
        >
          Créer un nouveau produit
        </button>
      </div>
    );
  }

  return (
    <div>
      <ProductForm
        isCreating={isCreating}
        selectedProductId={selectedProductId}
        form={form}
        activeLotteries={activeLotteries}
        visualCategories={visualCategories}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onCreateProduct={onCreateProduct}
        addSize={addSize}
        removeSize={removeSize}
        addColor={addColor}
        removeColor={removeColor}
        toggleLottery={toggleLottery}
      />

      {/* Only show advanced lottery selector if we're creating or editing */}
      {(isCreating || selectedProductId) && activeLotteries.length > 0 && (
        <div className="mt-8 p-4 border border-winshirt-purple/20 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Sélection avancée de loteries</h3>
          
          <Alert className="mb-4 bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-100">
              Ce produit offre {tickets} ticket{tickets > 1 ? 's' : ''}. Les clients ne pourront sélectionner que {tickets} loterie{tickets > 1 ? 's' : ''} maximum lors de l'achat.
              <span className="block mt-1 text-sm text-blue-300">
                Vous pouvez sélectionner autant de loteries que vous le souhaitez pour ce produit.
              </span>
            </AlertDescription>
          </Alert>
          
          <Form {...form}>
            <LotterySelection
              lotteries={activeLotteries}
              selectedLotteries={selectedLotteries}
              onToggleLottery={toggleLottery}
              onSelectAll={selectAllLotteries || (() => {})}
              onDeselectAll={deselectAllLotteries || (() => {})}
              maxSelections={tickets}
              enforceMaxSelection={false} // Ne pas appliquer la limite en admin
            />
          </Form>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductForm;


import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { ExtendedLottery } from '@/types/lottery';
import { VisualCategory } from '@/types/visual';
import ProductForm from './ProductForm';
import { Form } from "@/components/ui/form";

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
  addPrintArea?: (printArea: any) => void;
  updatePrintArea?: (id: number, updatedData: any) => void;
  removePrintArea?: (id: number) => void;
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
  deselectAllLotteries,
  addPrintArea,
  updatePrintArea,
  removePrintArea
}) => {
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
        selectAllLotteries={selectAllLotteries}
        deselectAllLotteries={deselectAllLotteries}
        addPrintArea={addPrintArea}
        updatePrintArea={updatePrintArea}
        removePrintArea={removePrintArea}
      />
    </div>
  );
};

export default EnhancedProductForm;

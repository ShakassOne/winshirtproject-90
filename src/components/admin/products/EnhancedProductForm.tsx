
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { ExtendedLottery } from '@/types/lottery';
import LotterySelection from './LotterySelection';
import ProductForm from './ProductForm';

// Types d'importation pour les accessoires ProductForm existants
interface ProductFormProps {
  isCreating: boolean;
  selectedProductId: number | null;
  form: UseFormReturn<any>;
  activeLotteries: ExtendedLottery[];
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

  return (
    <div>
      <ProductForm
        isCreating={isCreating}
        selectedProductId={selectedProductId}
        form={form}
        activeLotteries={activeLotteries}
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
          <LotterySelection
            lotteries={activeLotteries}
            selectedLotteries={selectedLotteries}
            onToggleLottery={toggleLottery}
            onSelectAll={selectAllLotteries ? selectAllLotteries : () => {}}
            onDeselectAll={deselectAllLotteries ? deselectAllLotteries : () => {}}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedProductForm;

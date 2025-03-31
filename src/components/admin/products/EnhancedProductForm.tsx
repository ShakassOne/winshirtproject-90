
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

      {/* Ajouter le sélecteur de loteries avancé */}
      {(isCreating || selectedProductId) && (
        <div className="mt-6">
          <LotterySelection
            lotteries={activeLotteries}
            selectedLotteries={selectedLotteries}
            onToggleLottery={toggleLottery}
            onSelectAll={selectAllLotteries || (() => {})}
            onDeselectAll={deselectAllLotteries || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedProductForm;

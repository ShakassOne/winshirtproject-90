
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ExtendedProduct } from '@/types/product';
import ProductSelection from './ProductSelection';
import EmptyFormState from './form/EmptyFormState';
import BasicLotteryInfo from './form/BasicLotteryInfo';
import LotteryDetailsFields from './form/LotteryDetailsFields';
import FormActions from './form/FormActions';

interface LotteryFormProps {
  isCreating: boolean;
  selectedLotteryId: number | null;
  form: UseFormReturn<any>;
  lotteryStatuses: string[];
  products: ExtendedProduct[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onCreateClick: () => void;
  toggleProduct: (productId: string) => void;
  selectAllProducts: () => void;
  deselectAllProducts: () => void;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  isCreating,
  selectedLotteryId,
  form,
  lotteryStatuses,
  products,
  onSubmit,
  onCancel,
  onCreateClick,
  toggleProduct,
  selectAllProducts,
  deselectAllProducts
}) => {
  const selectedProducts = form.watch('linkedProducts') || [];

  if (!isCreating && !selectedLotteryId) {
    return <EmptyFormState onCreateClick={onCreateClick} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic information fields */}
        <BasicLotteryInfo form={form} />
        
        {/* Details fields (image, participants, end date, status) */}
        <LotteryDetailsFields form={form} lotteryStatuses={lotteryStatuses} />
        
        {/* Linked Products */}
        <ProductSelection 
          products={products}
          selectedProducts={selectedProducts}
          onToggleProduct={toggleProduct}
          onSelectAll={selectAllProducts}
          onDeselectAll={deselectAllProducts}
        />
        
        {/* Form actions */}
        <FormActions isCreating={isCreating} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default LotteryForm;

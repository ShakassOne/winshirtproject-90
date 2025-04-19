import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ExtendedProduct } from '@/types/product';
import ProductSelection from './ProductSelection';
import EmptyFormState from './form/EmptyFormState';
import BasicLotteryInfo from './form/BasicLotteryInfo';
import LotteryDetailsFields from './form/LotteryDetailsFields';
import FormActions from './form/FormActions';
import { showNotification } from '@/lib/notifications';

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

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const formValues = form.getValues();
    
    if (!formValues.title || formValues.title.trim() === '') {
      showNotification('error', 'lottery', false, 'Le titre est requis');
      return;
    }
    
    if (!formValues.description || formValues.description.trim() === '') {
      showNotification('error', 'lottery', false, 'La description est requise');
      return;
    }
    
    if (!formValues.value || isNaN(Number(formValues.value)) || Number(formValues.value) <= 0) {
      showNotification('error', 'lottery', false, 'Veuillez entrer une valeur valide');
      return;
    }
    
    if (!formValues.targetParticipants || isNaN(Number(formValues.targetParticipants)) || Number(formValues.targetParticipants) < 1) {
      showNotification('error', 'lottery', false, 'Le nombre de participants doit être d\'au moins 1');
      return;
    }
    
    form.handleSubmit(onSubmit)();
  };

  if (!isCreating && !selectedLotteryId) {
    return <EmptyFormState onCreateClick={onCreateClick} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <BasicLotteryInfo form={form} />
        
        <LotteryDetailsFields form={form} lotteryStatuses={lotteryStatuses} />
        
        <ProductSelection 
          products={products}
          selectedProducts={selectedProducts}
          onToggleProduct={toggleProduct}
          onSelectAll={selectAllProducts}
          onDeselectAll={deselectAllProducts}
        />
        
        <FormActions isCreating={isCreating} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default LotteryForm;

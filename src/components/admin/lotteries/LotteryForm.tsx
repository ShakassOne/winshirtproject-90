
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ExtendedProduct } from '@/types/product';
import ProductSelection from './ProductSelection';
import EmptyFormState from './form/EmptyFormState';
import BasicLotteryInfo from './form/BasicLotteryInfo';
import LotteryDetailsFields from './form/LotteryDetailsFields';
import FormActions from './form/FormActions';
import { toast } from '@/lib/toast';

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

  // Ajouter une validation spécifique avant la soumission
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Vérification des données requises pour éviter les erreurs de type
    const formValues = form.getValues();
    
    if (!formValues.title || formValues.title.trim() === '') {
      toast.error("Le titre de la loterie est requis");
      return;
    }
    
    if (!formValues.description || formValues.description.trim() === '') {
      toast.error("La description de la loterie est requise");
      return;
    }
    
    if (!formValues.value || isNaN(Number(formValues.value)) || Number(formValues.value) <= 0) {
      toast.error("Veuillez entrer une valeur valide pour la loterie");
      return;
    }
    
    if (!formValues.targetParticipants || isNaN(Number(formValues.targetParticipants)) || Number(formValues.targetParticipants) < 1) {
      toast.error("Le nombre de participants doit être d'au moins 1");
      return;
    }
    
    // Effectuer la soumission avec données vérifiées
    form.handleSubmit(onSubmit)();
  };

  if (!isCreating && !selectedLotteryId) {
    return <EmptyFormState onCreateClick={onCreateClick} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
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

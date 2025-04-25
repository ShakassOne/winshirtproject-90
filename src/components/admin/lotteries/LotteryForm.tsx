
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ExtendedProduct } from '@/types/product';
import ProductSelection from './ProductSelection';
import EmptyFormState from './form/EmptyFormState';
import BasicLotteryInfo from './form/BasicLotteryInfo';
import LotteryDetailsFields from './form/LotteryDetailsFields';
import FormActions from './form/FormActions';
import { showNotification, showFormValidation, showAdminAction } from '@/lib/notifications';
import { isSupabaseConfigured } from '@/lib/supabase';
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
  const supabaseConnected = isSupabaseConfigured();
  const storageType = supabaseConnected ? 'both' : 'local';

  // Notifier lors de l'entrée dans le formulaire d'édition
  React.useEffect(() => {
    if (selectedLotteryId && !isCreating) {
      const lotteryTitle = form.getValues('title') || 'inconnue';
      showAdminAction('lottery', `Édition de la loterie "${lotteryTitle}"`, storageType);
    }
  }, [selectedLotteryId, isCreating]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const formValues = form.getValues();
    
    // Log pour le débogage pour voir toutes les valeurs du formulaire
    console.log('Form values before submission:', formValues);
    
    // Vérifier que tous les champs obligatoires sont remplis
    let formValid = true;
    
    if (!formValues.title || formValues.title.trim() === '') {
      showFormValidation('Titre', 'Le titre est requis');
      toast.error('Le titre est requis');
      formValid = false;
    }
    
    if (!formValues.description || formValues.description.trim() === '') {
      showFormValidation('Description', 'La description est requise');
      toast.error('La description est requise');
      formValid = false;
    }
    
    if (!formValues.value || isNaN(Number(formValues.value)) || Number(formValues.value) <= 0) {
      showFormValidation('Valeur', 'Veuillez entrer une valeur valide (supérieure à 0)');
      toast.error('Veuillez entrer une valeur valide (supérieure à 0)');
      formValid = false;
    }
    
    if (!formValues.targetParticipants || isNaN(Number(formValues.targetParticipants)) || Number(formValues.targetParticipants) < 1) {
      showFormValidation('Participants', 'Le nombre de participants doit être d\'au moins 1');
      toast.error('Le nombre de participants doit être d\'au moins 1');
      formValid = false;
    }
    
    if (!formValues.image || !formValues.image.startsWith('http')) {
      showFormValidation('Image', 'Veuillez entrer une URL d\'image valide');
      toast.error('Veuillez entrer une URL d\'image valide');
      formValid = false;
    }

    // Si le formulaire est valide, le soumettre
    if (formValid) {
      console.log('Form is valid, submitting...');
      try {
        // Appeler directement onSubmit avec les valeurs du formulaire
        onSubmit(formValues);
        
        const storageType = supabaseConnected ? 'both' : 'local';
        showNotification(isCreating ? 'create' : 'update', 'lottery', true, undefined, undefined, storageType);
        
        // Notification admin spécifique
        const action = isCreating ? 'Création' : 'Mise à jour';
        showAdminAction('lottery', `${action} de "${formValues.title}"`, storageType);
      } catch (error) {
        console.error('Error submitting form:', error);
        const storageType = supabaseConnected ? 'both' : 'local';
        showNotification(
          isCreating ? 'create' : 'update', 
          'lottery', 
          false, 
          error instanceof Error ? error.message : 'Erreur inconnue',
          undefined,
          storageType
        );
      }
    } else {
      showNotification('error', 'form', false, 'Veuillez corriger les erreurs du formulaire');
    }
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
        
        <FormActions isCreating={isCreating} onCancel={() => {
          showAdminAction('lottery', 'Annulation des modifications', storageType);
          onCancel();
        }} />
      </form>
    </Form>
  );
};

export default LotteryForm;

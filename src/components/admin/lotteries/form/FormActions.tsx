
import React from 'react';
import { Button } from '@/components/ui/button';

export interface FormActionsProps {
  isCreating: boolean;
  isSubmitting?: boolean; // Ajout de la prop isSubmitting
  onCancel: () => void;
  submitLabel: React.ReactNode;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  isCreating, 
  isSubmitting = false,
  onCancel, 
  submitLabel 
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      
      <Button 
        type="submit" 
        className="bg-winshirt-blue hover:bg-winshirt-blue/90"
        disabled={isSubmitting}
      >
        {submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;

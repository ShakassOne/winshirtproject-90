
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isCreating: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitLabel?: React.ReactNode;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  isCreating, 
  isSubmitting = false, 
  onCancel, 
  submitLabel 
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
        className="border-winshirt-purple/30 text-white"
      >
        Annuler
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
        className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
      >
        {submitLabel || (isCreating ? "Créer la loterie" : "Mettre à jour")}
      </Button>
    </div>
  );
};

export default FormActions;


import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isCreating: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ isCreating, onCancel }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="border-winshirt-purple/30 text-white"
      >
        Annuler
      </Button>
      <Button 
        type="submit"
        className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
      >
        {isCreating ? "Créer la loterie" : "Mettre à jour"}
      </Button>
    </div>
  );
};

export default FormActions;


import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isCreating?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitLabel?: React.ReactNode;
}

const FormActions: React.FC<FormActionsProps> = ({
  isCreating = false,
  isSubmitting = false,
  onCancel,
  submitLabel
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="border-white/20 hover:bg-white/5"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className={isCreating ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {submitLabel || (isCreating ? "Créer" : "Mettre à jour")}
      </Button>
    </div>
  );
};

export default FormActions;

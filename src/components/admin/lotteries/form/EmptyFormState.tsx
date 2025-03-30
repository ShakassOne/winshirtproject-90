
import React from 'react';
import { Award, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyFormStateProps {
  onCreateClick: () => void;
}

const EmptyFormState: React.FC<EmptyFormStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center py-12">
      <Award size={48} className="mx-auto text-winshirt-blue-light mb-4" />
      <h3 className="text-xl text-gray-300 mb-2">Aucune loterie sélectionnée</h3>
      <p className="text-gray-400 mb-6">Sélectionnez une loterie à modifier ou créez-en une nouvelle</p>
      <Button 
        onClick={onCreateClick}
        className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
      >
        <Plus size={16} className="mr-1" /> Créer une loterie
      </Button>
    </div>
  );
};

export default EmptyFormState;

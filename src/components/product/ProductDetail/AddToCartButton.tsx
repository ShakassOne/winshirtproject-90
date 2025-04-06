
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  onClick: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark py-6 mt-6"
    >
      <ShoppingCart className="mr-2" />
      Ajouter au panier
    </Button>
  );
};

export default AddToCartButton;

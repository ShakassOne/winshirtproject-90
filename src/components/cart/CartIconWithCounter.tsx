
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CartIconWithCounterProps {
  className?: string;
}

const CartIconWithCounter: React.FC<CartIconWithCounterProps> = ({ className }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Fonction pour mettre à jour le compteur du panier
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cartItems.reduce(
        (total: number, item: any) => total + (item.quantity || 1), 
        0
      );
      setCartItemCount(count);
    };

    // Mettre à jour au chargement
    updateCartCount();

    // Mettre à jour quand le localStorage change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    // Écouter les changements dans le localStorage
    window.addEventListener('storage', handleStorageChange);

    // Pour les changements dans le même onglet
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Link to="/cart" className={`relative ${className}`}>
      <ShoppingCart className="h-6 w-6" />
      {cartItemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-winshirt-purple"
        >
          {cartItemCount}
        </Badge>
      )}
    </Link>
  );
};

export default CartIconWithCounter;

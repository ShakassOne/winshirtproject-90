
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export default function CartButton() {
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);

  // Effect to update the cart count when it changes
  useEffect(() => {
    const updateCount = () => {
      const count = getItemCount();
      setItemCount(count);
    };

    // Initial update
    updateCount();

    // Update when cart changes
    window.addEventListener('cartUpdated', updateCount);
    
    // Also update when storage changes (useful for cross-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'cart') {
        updateCount();
      }
    });
    
    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [getItemCount]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => navigate('/cart')} 
      className="relative"
      aria-label="Panier"
      title={`${itemCount} article${itemCount > 1 ? 's' : ''} dans le panier`}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-winshirt-red text-white"
          variant="destructive"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}

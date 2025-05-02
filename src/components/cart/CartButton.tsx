
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

export default function CartButton() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [itemCount, setItemCount] = useState(0);

  // Effect to update the cart count when items change
  useEffect(() => {
    const updateCartCount = () => {
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setItemCount(count);
      console.log("Cart count updated:", count);
    };
    
    updateCartCount();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [items]); 

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

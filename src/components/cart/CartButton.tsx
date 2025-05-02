
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext'; // Use CartContext instead of useCart hook
import { Badge } from '@/components/ui/badge';

export default function CartButton() {
  const navigate = useNavigate();
  const { items } = useCart(); // Use CartContext directly to get items
  const [itemCount, setItemCount] = useState(0);

  // Effect to update the cart count when items change
  useEffect(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  }, [items]); // Depend directly on items from context

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

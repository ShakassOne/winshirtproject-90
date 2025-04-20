
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import CartCounter from './CartCounter';

interface CartIconWithCounterProps {
  className?: string;
}

const CartIconWithCounter: React.FC<CartIconWithCounterProps> = ({ className = '' }) => {
  return (
    <Link to="/cart" className={`relative ${className}`}>
      <ShoppingCart className="h-5 w-5" />
      <CartCounter />
    </Link>
  );
};

export default CartIconWithCounter;

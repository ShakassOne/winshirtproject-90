
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
  const { cart } = useCart();
  const { user } = useAuth();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-winshirt-space border-b border-winshirt-purple/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-white">
            WinShirt
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/shop" className="text-white hover:text-winshirt-purple">
              Shop
            </Link>
            <Link to="/lotteries" className="text-white hover:text-winshirt-purple">
              Loteries
            </Link>
            <Link to="/previous-winners" className="text-white hover:text-winshirt-purple">
              Gagnants
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-winshirt-purple">
              Comment ça marche
            </Link>
            <Link to="/contact" className="text-white hover:text-winshirt-purple">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/cart" className="relative text-white hover:text-winshirt-purple">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-winshirt-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SiteHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-winshirt-space/80 backdrop-blur-lg z-50 border-b border-winshirt-purple/20">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-white">WinShirt</span>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-winshirt-purple-light">
            Accueil
          </Link>
          <Link to="/shop" className="text-white hover:text-winshirt-purple-light">
            Boutique
          </Link>
          <Link to="/lotteries" className="text-white hover:text-winshirt-purple-light">
            Loteries
          </Link>
          <Link to="/winner" className="text-white hover:text-winshirt-purple-light">
            Gagnants
          </Link>
          <Link to="/contact" className="text-white hover:text-winshirt-purple-light">
            À propos
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-white hover:text-winshirt-purple-light">
            <ShoppingCart className="h-6 w-6" />
          </Link>
          <Link to={user ? "/account" : "/login"} className="text-white hover:text-winshirt-purple-light">
            <User className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

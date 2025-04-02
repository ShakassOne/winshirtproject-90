
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  // Fermer le menu lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Bloquer le défilement lorsque le menu est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md menu-gray border-b border-winshirt-purple/20">
      <div className="container mx-auto py-6 px-4 md:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl font-bold text-white">
                <span className="text-winshirt-purple-light">Win</span>
                <span className="text-winshirt-blue-light">Shirt</span>
              </h1>
            </Link>
          </div>

          {/* Menu burger button - always visible */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-white transition-all duration-300 z-50 hover:bg-transparent",
                isMenuHovered && !isMobileMenuOpen ? "scale-110" : "",
                isMobileMenuOpen ? "rotate-0" : ""
              )} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
            >
              {isMobileMenuOpen ? 
                <X className="h-8 w-8 animate-in fade-in rotate-in-90" /> : 
                <Menu className="h-8 w-8 animate-in fade-in" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Menu with slide animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-winshirt-space z-40 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 pt-28 pb-12 h-full flex flex-col">
          <div className="flex-grow overflow-y-auto">
            <nav className="grid gap-6 md:gap-8 text-center md:text-left">
              <Link 
                to="/" 
                className={`nav-link text-2xl md:text-3xl font-medium ${isActive('/') ? 'active' : ''} animate-in fade-in slide-in-from-top duration-300 delay-100`}
              >
                Accueil
              </Link>
              <Link 
                to="/products" 
                className={`nav-link text-2xl md:text-3xl font-medium ${isActive('/products') ? 'active' : ''} animate-in fade-in slide-in-from-top duration-300 delay-200`}
              >
                Produits
              </Link>
              <Link 
                to="/lotteries" 
                className={`nav-link text-2xl md:text-3xl font-medium ${isActive('/lotteries') ? 'active' : ''} animate-in fade-in slide-in-from-top duration-300 delay-300`}
              >
                Loteries
              </Link>
              <Link 
                to="/how-it-works" 
                className={`nav-link text-2xl md:text-3xl font-medium ${isActive('/how-it-works') ? 'active' : ''} animate-in fade-in slide-in-from-top duration-300 delay-400`}
              >
                Comment ça marche
              </Link>
              {isAuthenticated && isAdmin && (
                <Link 
                  to="/admin/lotteries" 
                  className={`nav-link text-2xl md:text-3xl font-medium text-winshirt-purple-light ${location.pathname.includes('/admin') ? 'active' : ''} animate-in fade-in slide-in-from-top duration-300 delay-500`}
                >
                  Administration
                </Link>
              )}
            </nav>
          </div>
          
          {/* Footer actions for mobile menu */}
          <div className="mt-auto pt-8 flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 animate-in fade-in slide-in-from-bottom duration-300 delay-500">
            <Link to="/cart" className="flex items-center gap-3 text-xl text-white hover:text-winshirt-blue-light">
              <ShoppingCart className="h-6 w-6" />
              <span>Panier</span>
              <span className="bg-winshirt-blue-light text-white text-xs px-2 py-1 rounded-full">0</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Link to="/account" className="flex items-center gap-3 text-xl text-white hover:text-winshirt-blue-light">
                  <User className="h-6 w-6" />
                  <span>{user?.name || 'Mon compte'}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 flex items-center gap-2"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full text-xl px-8 py-5">
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

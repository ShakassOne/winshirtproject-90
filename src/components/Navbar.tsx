import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md menu-gray border-b border-winshirt-purple/20">
      <div className="container mx-auto py-4 px-4 md:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-winshirt-purple-light">Win</span>
                <span className="text-winshirt-blue-light">Shirt</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Accueil
              </Link>
              <Link 
                to="/products" 
                className={`nav-link ${isActive('/products') ? 'active' : ''}`}
              >
                T-shirts
              </Link>
              <Link 
                to="/lotteries" 
                className={`nav-link ${isActive('/lotteries') ? 'active' : ''}`}
              >
                Loteries
              </Link>
              <Link 
                to="/how-it-works" 
                className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
              >
                Comment ça marche
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin/lotteries" 
                  className={`nav-link text-winshirt-purple-light ${location.pathname.includes('/admin') ? 'active' : ''}`}
                >
                  Administration
                </Link>
              )}
            </nav>
          </div>

          {/* Right-side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:text-winshirt-blue-light">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-winshirt-blue-light text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/account">
                  <Button variant="ghost" className="text-white hover:text-winshirt-blue-light flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="max-w-[100px] truncate">{user?.name || 'Mon compte'}</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-white hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full">
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-4 py-4">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/products" 
              className={`nav-link ${isActive('/products') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              T-shirts
            </Link>
            <Link 
              to="/lotteries" 
              className={`nav-link ${isActive('/lotteries') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Loteries
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            {isAdmin && (
              <Link 
                to="/admin/lotteries" 
                className={`nav-link text-winshirt-purple-light ${location.pathname.includes('/admin') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Administration
              </Link>
            )}
            <div className="flex space-x-4 pt-2">
              <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative text-white hover:text-winshirt-blue-light">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-winshirt-blue-light text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="text-white hover:text-winshirt-blue-light flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="max-w-[100px] truncate">{user?.name || 'Mon compte'}</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-white hover:text-red-400"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

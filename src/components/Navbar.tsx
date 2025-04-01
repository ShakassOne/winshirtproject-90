
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
      <div className="container mx-auto py-6 px-4 md:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl font-bold text-white">
                <span className="text-winshirt-purple-light">Win</span>
                <span className="text-winshirt-blue-light">Shirt</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10">
              <Link 
                to="/" 
                className={`nav-link text-lg font-medium ${isActive('/') ? 'active' : ''}`}
              >
                Accueil
              </Link>
              <Link 
                to="/products" 
                className={`nav-link text-lg font-medium ${isActive('/products') ? 'active' : ''}`}
              >
                T-shirts
              </Link>
              <Link 
                to="/lotteries" 
                className={`nav-link text-lg font-medium ${isActive('/lotteries') ? 'active' : ''}`}
              >
                Loteries
              </Link>
              <Link 
                to="/how-it-works" 
                className={`nav-link text-lg font-medium ${isActive('/how-it-works') ? 'active' : ''}`}
              >
                Comment ça marche
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin/lotteries" 
                  className={`nav-link text-lg font-medium text-winshirt-purple-light ${location.pathname.includes('/admin') ? 'active' : ''}`}
                >
                  Administration
                </Link>
              )}
            </nav>
          </div>

          {/* Right-side icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:text-winshirt-blue-light">
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 bg-winshirt-blue-light text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/account">
                  <Button variant="ghost" className="text-white hover:text-winshirt-blue-light flex items-center gap-3 text-lg">
                    <User className="h-7 w-7" />
                    <span className="max-w-[120px] truncate">{user?.name || 'Mon compte'}</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-white hover:text-red-400"
                >
                  <LogOut className="h-7 w-7" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full text-lg px-8 py-6">
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
              {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-6 py-6">
            <Link 
              to="/" 
              className={`nav-link text-xl font-medium ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/products" 
              className={`nav-link text-xl font-medium ${isActive('/products') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              T-shirts
            </Link>
            <Link 
              to="/lotteries" 
              className={`nav-link text-xl font-medium ${isActive('/lotteries') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Loteries
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link text-xl font-medium ${isActive('/how-it-works') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            {isAdmin && (
              <Link 
                to="/admin/lotteries" 
                className={`nav-link text-xl font-medium text-winshirt-purple-light ${location.pathname.includes('/admin') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Administration
              </Link>
            )}
            <div className="flex space-x-6 pt-4">
              <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative text-white hover:text-winshirt-blue-light">
                  <ShoppingCart className="h-8 w-8" />
                  <span className="absolute -top-1 -right-1 bg-winshirt-blue-light text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="text-white hover:text-winshirt-blue-light flex items-center gap-3 text-lg">
                      <User className="h-8 w-8" />
                      <span className="max-w-[120px] truncate">{user?.name || 'Mon compte'}</span>
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
                    <LogOut className="h-8 w-8" />
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full text-lg px-8 py-6">
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

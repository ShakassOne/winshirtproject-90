
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';
import { useCart } from '@/contexts/CartContext'; // Ajout de l'import du contexte du panier

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { items } = useCart(); // Récupération des éléments du panier
  
  // Calcul du nombre d'articles dans le panier
  const cartItemCount = items ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="w-full max-w-7xl mx-auto rounded-2xl bg-winshirt-space/40 backdrop-blur-lg border border-winshirt-purple/30 shadow-lg shadow-winshirt-purple/10">
        <div className="container mx-auto py-3 px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center">
            {/* Logo centré sur mobile, à gauche sur desktop */}
            <div className="flex w-full md:w-1/4 justify-between md:justify-start items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  <span className="text-winshirt-purple-light">Win</span>
                  <span className="text-winshirt-blue-light">Shirt</span>
                </h1>
              </Link>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Navigation centrée sur desktop */}
            <nav className={`hidden md:flex flex-grow justify-center items-center space-x-8`}>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Accueil
              </Link>
              <Link 
                to="/shop" 
                className={`nav-link ${isActive('/shop') ? 'active' : ''}`}
              >
                Shop
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
              <Link 
                to="/contact" 
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact
              </Link>
              {/* Afficher le lien Admin uniquement pour les administrateurs authentifiés */}
              {isAuthenticated && isAdmin && (
                <Link 
                  to="/admin"
                  className={`nav-link text-winshirt-purple-light font-semibold ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              )}
            </nav>
            
            {/* User actions à droite sur desktop */}
            <div className="hidden md:flex w-1/4 justify-end items-center space-x-6">
              <Link to="/cart" className="flex items-center gap-2 text-white hover:text-winshirt-blue-light">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="bg-winshirt-blue-light text-white text-xs px-2 py-1 rounded-full">{cartItemCount}</span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/account" className="flex items-center gap-2 text-white hover:text-winshirt-blue-light">
                    <User className="h-5 w-5" />
                    <span>{user?.name || 'Mon compte'}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-white hover:text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              ) : (
                <LoginButton 
                  variant="default" 
                  className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full px-6 py-2" 
                />
              )}
            </div>

            {/* Mobile menu dropdown avec effet glassmorphism */}
            {isMenuOpen && (
              <div className="md:hidden w-full py-4 mt-4 border-t border-winshirt-purple/20 bg-winshirt-space/60 backdrop-blur-lg rounded-lg">
                <nav className="flex flex-col space-y-4 mb-6">
                  <Link 
                    to="/" 
                    className={`nav-link text-center ${isActive('/') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accueil
                  </Link>
                  <Link 
                    to="/shop" 
                    className={`nav-link text-center ${isActive('/shop') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link 
                    to="/lotteries" 
                    className={`nav-link text-center ${isActive('/lotteries') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Loteries
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    className={`nav-link text-center ${isActive('/how-it-works') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Comment ça marche
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`nav-link text-center ${isActive('/contact') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  {/* Afficher le lien Admin uniquement pour les administrateurs authentifiés */}
                  {isAuthenticated && isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`nav-link text-center text-winshirt-purple-light font-semibold ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                </nav>
                
                <div className="flex flex-col space-y-4 items-center">
                  <Link to="/cart" className="flex items-center gap-2 text-white hover:text-winshirt-blue-light" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Panier</span>
                    {cartItemCount > 0 && (
                      <span className="bg-winshirt-blue-light text-white text-xs px-2 py-1 rounded-full">{cartItemCount}</span>
                    )}
                  </Link>
                  
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-4 items-center">
                      <Link to="/account" className="flex items-center gap-2 text-white hover:text-winshirt-blue-light" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-5 w-5" />
                        <span>{user?.name || 'Mon compte'}</span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-white hover:text-red-400 flex items-center gap-2 justify-center"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Déconnexion</span>
                      </Button>
                    </div>
                  ) : (
                    <div onClick={() => setIsMenuOpen(false)} className="w-full px-8">
                      <LoginButton 
                        className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

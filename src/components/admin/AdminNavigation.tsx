import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Gift,
  Settings,
  ShoppingCart,
  Users,
  PaintBucket,
  Menu,
  X,
  Database
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Helper function to check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-winshirt-space-dark/80 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="container mx-auto px-4">
          <div className="py-3 flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              WinShirt<span className="text-winshirt-blue">Admin</span>
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white hover:text-winshirt-blue transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-6">
              <NavLink to="/admin" active={isActive('/admin')}>
                <Home size={16} />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/admin/lotteries" active={isActive('/admin/lotteries')}>
                <Gift size={16} />
                <span>Loteries</span>
              </NavLink>
              
              <NavLink to="/admin/products" active={isActive('/admin/products')}>
                <Package size={16} />
                <span>Produits</span>
              </NavLink>
              
              <NavLink to="/admin/visuals" active={isActive('/admin/visuals')}>
                <PaintBucket size={16} />
                <span>Visuels</span>
              </NavLink>
              
              <NavLink to="/admin/orders" active={isActive('/admin/orders')}>
                <ShoppingCart size={16} />
                <span>Commandes</span>
              </NavLink>
              
              <NavLink to="/admin/clients" active={isActive('/admin/clients')}>
                <Users size={16} />
                <span>Clients</span>
              </NavLink>

              <NavLink to="/admin/sync" active={isActive('/admin/sync')}>
                <Database size={16} />
                <span>Synchronisation</span>
              </NavLink>
              
              <NavLink to="/admin/settings" active={isActive('/admin/settings')}>
                <Settings size={16} />
                <span>Paramètres</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-winshirt-space-dark/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <NavLink to="/admin" active={isActive('/admin')} onClick={() => setIsOpen(false)}>
                <Home size={16} />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/admin/lotteries" active={isActive('/admin/lotteries')} onClick={() => setIsOpen(false)}>
                <Gift size={16} />
                <span>Loteries</span>
              </NavLink>
              
              <NavLink to="/admin/products" active={isActive('/admin/products')} onClick={() => setIsOpen(false)}>
                <Package size={16} />
                <span>Produits</span>
              </NavLink>
              
              <NavLink to="/admin/visuals" active={isActive('/admin/visuals')} onClick={() => setIsOpen(false)}>
                <PaintBucket size={16} />
                <span>Visuels</span>
              </NavLink>
              
              <NavLink to="/admin/orders" active={isActive('/admin/orders')} onClick={() => setIsOpen(false)}>
                <ShoppingCart size={16} />
                <span>Commandes</span>
              </NavLink>
              
              <NavLink to="/admin/clients" active={isActive('/admin/clients')} onClick={() => setIsOpen(false)}>
                <Users size={16} />
                <span>Clients</span>
              </NavLink>

              <NavLink to="/admin/sync" active={isActive('/admin/sync')} onClick={() => setIsOpen(false)}>
                <Database size={16} />
                <span>Synchronisation</span>
              </NavLink>
              
              <NavLink to="/admin/settings" active={isActive('/admin/settings')} onClick={() => setIsOpen(false)}>
                <Settings size={16} />
                <span>Paramètres</span>
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for navigation links
const NavLink: React.FC<{
  to: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, active, children, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-1 text-sm ${
        active
          ? 'text-winshirt-blue font-medium'
          : 'text-gray-300 hover:text-winshirt-blue'
      } transition-colors duration-200`}
    >
      {children}
    </Link>
  );
};

export default AdminNavigation;


import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Users, 
  Ticket, 
  Settings,
  ShoppingCart,
  ImagePlus
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const isActive = (route: string) => path.includes(route);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mb-4 flex justify-center">
      <div className="flex space-x-1 p-1 rounded-full bg-winshirt-space/70 backdrop-blur-lg border border-winshirt-purple/30 shadow-lg">
        <Link
          to="/admin/products"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/products') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Produits"
        >
          <ShoppingBag size={20} />
        </Link>
        
        <Link
          to="/admin/visuals"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/visuals') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Visuels"
        >
          <ImagePlus size={20} />
        </Link>
        
        <Link
          to="/admin/lotteries"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/lotteries') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Loteries"
        >
          <Ticket size={20} />
        </Link>
        
        <Link
          to="/admin/commandes"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/commandes') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Commandes"
        >
          <ShoppingCart size={20} />
        </Link>
        
        <Link
          to="/admin/clients"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/clients') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Clients"
        >
          <Users size={20} />
        </Link>
        
        <Link
          to="/admin/settings"
          className={`
            rounded-full p-3 flex items-center justify-center
            ${isActive('/admin/settings') 
              ? 'bg-winshirt-purple text-white' 
              : 'text-gray-400 hover:text-white hover:bg-winshirt-space-light'}
            transition-all duration-200
          `}
          title="Paramètres"
        >
          <Settings size={20} />
        </Link>
      </div>
    </div>
  );
};

export default AdminNavigation;

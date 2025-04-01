
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Award, Users, ShoppingBag, Settings, Menu, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="fixed z-50 bottom-8 left-1/2 transform -translate-x-1/2">
      <div className={cn(
        "bg-winshirt-space border border-winshirt-purple/20 rounded-full shadow-lg transition-all duration-300",
        isExpanded ? "px-4 py-3" : "px-2 py-1"
      )}>
        {/* Toggle expand button */}
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-full absolute -top-10 left-1/2 transform -translate-x-1/2 bg-winshirt-space border border-winshirt-purple/20 text-white hover:bg-winshirt-purple/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={18} /> : <Menu size={18} />}
        </Button>

        <div className={cn(
          "flex flex-wrap justify-center gap-2",
          isExpanded ? "flex-col md:flex-row" : "flex-row"
        )}>
          <Link to="/admin/products">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-winshirt-purple/20 text-white",
                isActive('/admin/products') && "bg-winshirt-purple/30"
              )}
            >
              <Package size={20} className="mr-2" />
              Produits
            </Button>
          </Link>
          <Link to="/admin/lotteries">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-winshirt-blue/20 text-white",
                isActive('/admin/lotteries') && "bg-winshirt-blue/30"
              )}
            >
              <Award size={20} className="mr-2" />
              Loteries
            </Button>
          </Link>
          <Link to="/admin/clients">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-green-600/20 text-white",
                isActive('/admin/clients') && "bg-green-600/30"
              )}
            >
              <Users size={20} className="mr-2" />
              Clients
            </Button>
          </Link>
          <Link to="/admin/commandes">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-orange-500/20 text-white",
                isActive('/admin/commandes') && "bg-orange-500/30"
              )}
            >
              <ShoppingBag size={20} className="mr-2" />
              Commandes
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-gray-500/20 text-white",
                isActive('/admin/settings') && "bg-gray-500/30"
              )}
            >
              <Settings size={20} className="mr-2" />
              Paramètres
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;

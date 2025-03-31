
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Award, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminNavigation: React.FC = () => {
  return (
    <div className="fixed z-50 bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-winshirt-space border border-winshirt-purple/20 rounded-full shadow-lg px-2 py-1 flex space-x-2">
        <Link to="/admin/products">
          <Button variant="ghost" className="rounded-full hover:bg-winshirt-purple/20 text-white">
            <Package size={20} className="mr-2" />
            Produits
          </Button>
        </Link>
        <Link to="/admin/lotteries">
          <Button variant="ghost" className="rounded-full hover:bg-winshirt-blue/20 text-white">
            <Award size={20} className="mr-2" />
            Loteries
          </Button>
        </Link>
        <Link to="/admin/clients">
          <Button variant="ghost" className="rounded-full hover:bg-green-600/20 text-white">
            <Users size={20} className="mr-2" />
            Clients
          </Button>
        </Link>
        <Link to="/admin/commandes">
          <Button variant="ghost" className="rounded-full hover:bg-orange-500/20 text-white">
            <ShoppingBag size={20} className="mr-2" />
            Commandes
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminNavigation;

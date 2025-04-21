
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Boxes, Tag, Palette, Settings, UserCircle, ShoppingBag } from "lucide-react";

const AdminNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Définition des liens
  const navLinks = [
    { 
      path: '/admin/dashboard', 
      label: 'Tableau de bord', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/products', 
      label: 'Produits', 
      icon: <Boxes size={20} /> 
    },
    { 
      path: '/admin/lotteries', 
      label: 'Loteries', 
      icon: <Tag size={20} /> 
    },
    { 
      path: '/admin/visuals', 
      label: 'Visuels', 
      icon: <Palette size={20} /> 
    },
    { 
      path: '/admin/commandes', 
      label: 'Commandes', 
      icon: <ShoppingBag size={20} /> 
    },
    { 
      path: '/admin/clients', 
      label: 'Clients', 
      icon: <UserCircle size={20} /> 
    },
    { 
      path: '/admin/settings', 
      label: 'Paramètres', 
      icon: <Settings size={20} /> 
    },
  ];
  
  // Vérifier si un lien est actif
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-winshirt-space/90 backdrop-blur-md border border-winshirt-purple/30 rounded-full px-4 py-1 shadow-lg">
        <div className="flex space-x-1">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              variant={isActive(link.path) ? "secondary" : "ghost"}
              size="sm"
              className={`rounded-full transition-colors ${
                isActive(link.path) ? "bg-winshirt-purple text-white hover:bg-winshirt-purple-dark" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => navigate(link.path)}
            >
              <span className="flex items-center">
                <span>{link.icon}</span>
                <span className="hidden md:inline ml-2">{link.label}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;

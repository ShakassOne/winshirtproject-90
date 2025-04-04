
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Boxes, Tag, Palette, BarChart4, Settings, UserCircle, Filter } from "lucide-react";

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
      path: '/admin/filters', 
      label: 'Filtres', 
      icon: <Filter size={20} /> 
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
      path: '/admin/stats', 
      label: 'Statistiques', 
      icon: <BarChart4 size={20} /> 
    },
    { 
      path: '/admin/users', 
      label: 'Utilisateurs', 
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
    <div className="fixed bottom-0 left-0 right-0 bg-winshirt-space border-t border-winshirt-purple/20 z-50">
      <div className="container mx-auto px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2 justify-between md:justify-start">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              variant={isActive(link.path) ? "secondary" : "ghost"}
              className={`flex-shrink-0 transition-colors ${
                isActive(link.path) ? "bg-winshirt-purple text-white hover:bg-winshirt-purple-dark" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => navigate(link.path)}
            >
              <span className="flex items-center">
                <span className="mr-2">{link.icon}</span>
                <span className="hidden md:inline">{link.label}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;

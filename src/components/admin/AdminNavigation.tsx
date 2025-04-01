
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Award, Users, ShoppingBag, Settings, Menu, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navigationItems = [
    {
      name: "Produits",
      icon: Package,
      path: "/admin/products",
      color: "winshirt-purple"
    },
    {
      name: "Loteries",
      icon: Award,
      path: "/admin/lotteries",
      color: "winshirt-blue"
    },
    {
      name: "Clients",
      icon: Users,
      path: "/admin/clients",
      color: "green-600"
    },
    {
      name: "Commandes",
      icon: ShoppingBag,
      path: "/admin/commandes",
      color: "orange-500"
    },
    {
      name: "Paramètres",
      icon: Settings,
      path: "/admin/settings",
      color: "gray-500"
    }
  ];

  // Contenu pour affichage mobile (drawer)
  const MobileMenu = () => (
    <div className="flex flex-col w-full h-full py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-8 text-white">
        Administration
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {navigationItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button 
              variant="ghost" 
              size="lg"
              className={cn(
                "flex flex-col items-center justify-center space-y-3 h-32 w-full rounded-lg p-4",
                isActive(item.path) ? `bg-${item.color}/30` : "hover:bg-gray-800"
              )}
            >
              <item.icon size={36} className={`text-${item.color}`} />
              <span className="text-base font-medium text-center">{item.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );

  // Contenu pour affichage desktop
  const DesktopMenu = () => (
    <div className={cn(
      "bg-winshirt-space border border-winshirt-purple/20 rounded-full shadow-lg transition-all duration-300",
      isExpanded ? "px-8 py-5" : "px-4 py-3"
    )}>
      {/* Toggle expand button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="rounded-full absolute -top-14 left-1/2 transform -translate-x-1/2 bg-winshirt-space border border-winshirt-purple/20 text-white hover:bg-winshirt-purple/20 h-12 w-12"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronUp size={26} /> : <Menu size={26} />}
      </Button>

      <div className={cn(
        "flex flex-wrap justify-center gap-4",
        isExpanded ? "flex-col md:flex-row" : "flex-row"
      )}>
        {navigationItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-" + item.color + "/20 text-white text-xl h-14 px-6",
                isActive(item.path) && "bg-" + item.color + "/30"
              )}
            >
              <item.icon size={28} className="mr-3" />
              {item.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed z-40 bottom-10 left-1/2 transform -translate-x-1/2">
      {/* Menu mobile (drawer) */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full bg-winshirt-space border border-winshirt-purple/30 text-white hover:bg-winshirt-purple/20 h-16 w-16"
            >
              <Menu size={32} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-winshirt-space border-t border-winshirt-purple/20 h-[85vh] max-h-[85vh]">
            <MobileMenu />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Menu desktop */}
      <div className="hidden md:block">
        <DesktopMenu />
      </div>
    </div>
  );
};

export default AdminNavigation;

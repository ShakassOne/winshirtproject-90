
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
    <div className="flex justify-center w-full py-6 px-3 space-x-5">
      {navigationItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "flex flex-col items-center space-y-2 h-auto rounded-lg px-3 py-3",
              isActive(item.path) && `bg-${item.color}/30`
            )}
          >
            <item.icon size={26} className={`text-${item.color}`} />
            <span className="text-sm font-medium">{item.name}</span>
          </Button>
        </Link>
      ))}
    </div>
  );

  // Contenu pour affichage desktop
  const DesktopMenu = () => (
    <div className={cn(
      "bg-winshirt-space border border-winshirt-purple/20 rounded-full shadow-lg transition-all duration-300",
      isExpanded ? "px-6 py-4" : "px-3 py-2"
    )}>
      {/* Toggle expand button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="rounded-full absolute -top-12 left-1/2 transform -translate-x-1/2 bg-winshirt-space border border-winshirt-purple/20 text-white hover:bg-winshirt-purple/20 h-10 w-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronUp size={22} /> : <Menu size={22} />}
      </Button>

      <div className={cn(
        "flex flex-wrap justify-center gap-3",
        isExpanded ? "flex-col md:flex-row" : "flex-row"
      )}>
        {navigationItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full hover:bg-" + item.color + "/20 text-white text-lg h-12 px-5",
                isActive(item.path) && "bg-" + item.color + "/30"
              )}
            >
              <item.icon size={24} className="mr-2" />
              {item.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed z-50 bottom-10 left-1/2 transform -translate-x-1/2">
      {/* Menu mobile (drawer) */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full bg-winshirt-space border border-winshirt-purple/30 text-white hover:bg-winshirt-purple/20 h-14 w-14"
            >
              <Menu size={28} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-winshirt-space border-t border-winshirt-purple/20">
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


import React, { useEffect, useState } from 'react';

const CartCounter: React.FC = () => {
  const [itemCount, setItemCount] = useState(0);
  
  // Mettre à jour le compteur quand le panier change
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Calculer le nombre total d'articles (quantity de chaque item)
          const totalCount = parsedCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setItemCount(totalCount);
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          setItemCount(0);
        }
      } else {
        setItemCount(0);
      }
    };
    
    // Mettre à jour le compteur immédiatement
    updateCartCount();
    
    // Surveiller les changements dans le localStorage pour le panier
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier les changements du panier régulièrement (pour les modifications sur la même page)
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <span className="absolute -top-2 -right-2 bg-winshirt-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {itemCount}
    </span>
  );
};

export default CartCounter;

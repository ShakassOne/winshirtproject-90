
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, CreditCard, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { useCart } from '@/contexts/CartContext';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateItemQuantity, removeItem, calculateTotal } = useCart();
  const shippingCost = 5.99;
  const subtotal = calculateTotal();
  const total = subtotal + shippingCost;

  useEffect(() => {
    console.log("CartPage rendered with items:", items);
    
    // Check if the cart is rendered with items and the UI doesn't show it
    if (items.length > 0) {
      const cartItemElements = document.querySelectorAll('.cart-item');
      if (cartItemElements.length === 0) {
        console.log("Cart items not rendered in UI, forcing update");
        // Force a re-render
        const forceEvent = new Event('cartUpdated');
        window.dispatchEvent(forceEvent);
      }
    }
  }, [items]);

  const handleRemoveItem = (index: number) => {
    removeItem(index);
    toast.info('Produit retiré du panier');
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(index, newQuantity);
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.warning('Votre panier est vide');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        <ShoppingCart className="mr-2" /> Votre Panier
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
              <h2 className="text-xl font-semibold text-white mb-4">Articles dans le panier</h2>
              
              {items.map((item, index) => (
                <div key={index} className="cart-item flex items-start space-x-4 py-4 border-b border-winshirt-blue/10 last:border-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                    <img
                      src={item.image || "https://placehold.co/100x100/png"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.size && `Size: ${item.size}`}
                      {item.color && item.size && ' | '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    {item.lotteryName && (
                      <p className="text-sm text-winshirt-purple-light">Lottery: {item.lotteryName}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-winshirt-blue/30 rounded-l hover:bg-winshirt-blue/10"
                      >
                        -
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-t border-b border-winshirt-blue/30">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-winshirt-blue/30 rounded-r hover:bg-winshirt-blue/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-white">{(item.price * item.quantity).toFixed(2)} €</p>
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="mt-2 text-xs text-winshirt-purple-light hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <Card className="p-6 bg-winshirt-space border border-winshirt-purple/20 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-white">{subtotal.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Livraison</span>
                  <span className="text-white">{shippingCost.toFixed(2)} €</span>
                </div>
                
                <Separator className="bg-winshirt-blue/20" />
                
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-winshirt-purple-light">{total.toFixed(2)} €</span>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark flex items-center justify-center"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Procéder au paiement
                </Button>

                <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
                  <Truck className="mr-1 h-3 w-3" />
                  <span>Livraison gratuite pour les commandes de plus de 50€</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold text-white">Votre panier est vide</h2>
            <p className="mt-1 text-gray-400">Vous n'avez pas encore ajouté de produits à votre panier.</p>
            <Button
              onClick={() => navigate('/products')}
              className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Voir les produits
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CartPage;

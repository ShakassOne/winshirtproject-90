
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      const { success, error } = await initiateStripeCheckout(cartItems);
      
      if (success) {
        toast.success('Redirection vers la page de paiement...');
      } else {
        toast.error("Une erreur est survenue lors de l'initialisation du paiement");
        console.error('Checkout error:', error);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'initialisation du paiement");
      console.error('Checkout error:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Paiement</h1>
        <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
          <p>Votre panier est vide.</p>
          <Button 
            onClick={() => navigate('/products')}
            className="mt-4"
          >
            Retourner aux produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paiement</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Résumé de la commande</h2>
            <div className="space-y-2">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t border-winshirt-purple/30 pt-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{totalAmount.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Paiement sécurisé</h2>
            <p className="text-sm text-gray-400 mb-4">
              Le paiement est sécurisé par Stripe. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
            </p>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Payer {totalAmount.toFixed(2)} €
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

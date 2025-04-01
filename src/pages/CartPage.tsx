
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash, Plus, Minus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { simulateSendEmail } from '@/contexts/AuthContext';

// Define cart item type
interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  lotteryId: number;
  lotteryName: string;
}

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const handleRemoveItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success("Article supprimé du panier");
  };
  
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const handleApplyPromoCode = () => {
    if (!promoCode) {
      toast.error("Veuillez entrer un code promo");
      return;
    }
    
    // Mocked promo code check
    if (promoCode === "WIN10") {
      toast.success("Code promo appliqué avec succès");
    } else {
      toast.error("Code promo invalide");
    }
  };
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shippingCost;
  
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    
    if (!user) {
      toast.error("Veuillez vous connecter pour finaliser votre commande");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Format items for Stripe
      const checkoutItems = cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lotteryId: item.lotteryId,
        lotteryName: item.lotteryName,
        size: item.size,
        color: item.color
      }));
      
      // Initiate Stripe checkout
      const result = await initiateStripeCheckout(checkoutItems);
      
      if (!result.success) {
        throw new Error("Échec de l'initialisation du paiement");
      }
      
      // Envoyer un email de confirmation de commande au client
      const emailContent = `
Bonjour ${user.name},

Nous vous confirmons votre commande sur WinShirt.

Récapitulatif de votre commande:
${cartItems.map(item => `- ${item.quantity}x ${item.name} (${item.size}, ${item.color}) - ${(item.price * item.quantity).toFixed(2)}€ - Participation à la loterie "${item.lotteryName}"`).join('\n')}

Sous-total: ${subtotal.toFixed(2)}€
Frais de livraison: ${shippingCost === 0 ? "Gratuit" : `${shippingCost.toFixed(2)}€`}
Total: ${total.toFixed(2)}€

Votre commande sera expédiée dans les 48 heures ouvrables.

Merci pour votre achat!
L'équipe WinShirt
      `;
      
      simulateSendEmail(
        user.email,
        "Confirmation de votre commande WinShirt",
        emailContent
      );
      
      // Envoyer également une notification à l'administrateur
      const adminEmails = localStorage.getItem('admin_notification_emails');
      const emails = adminEmails ? JSON.parse(adminEmails) : ['admin@winshirt.com'];
      
      const adminEmailContent = `
Nouvelle commande sur WinShirt!

Client: ${user.name} (${user.email})

Produits:
${cartItems.map(item => `- ${item.quantity}x ${item.name} (${item.size}, ${item.color}) - ${(item.price * item.quantity).toFixed(2)}€ - Loterie: "${item.lotteryName}"`).join('\n')}

Total: ${total.toFixed(2)}€

Cette commande est à préparer et expédier dans les plus brefs délais.
      `;
      
      emails.forEach(email => {
        simulateSendEmail(
          email,
          "Nouvelle commande WinShirt",
          adminEmailContent
        );
      });
      
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Une erreur s'est produite lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">Mon Panier</h1>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="winshirt-card p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-24">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-grow space-y-2">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-white">{item.name}</h3>
                          <span className="text-winshirt-purple-light font-medium">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-300">
                              Taille: {item.size} | Couleur: {item.color}
                            </p>
                            <p className="text-sm text-winshirt-blue-light">
                              Loterie: {item.lotteryName}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-white">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="winshirt-card p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-white">Résumé de la commande</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sous-total</span>
                      <span className="text-white">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Frais de livraison</span>
                      <span className="text-white">
                        {shippingCost === 0 ? "Gratuit" : `${shippingCost.toFixed(2)} €`}
                      </span>
                    </div>
                    
                    <Separator className="my-3 bg-winshirt-purple/20" />
                    
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-winshirt-purple-light">{total.toFixed(2)} €</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      * Chaque t-shirt vous donne droit à une participation à la loterie sélectionnée
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      />
                      <Button 
                        variant="outline" 
                        className="border-winshirt-purple text-winshirt-purple-light"
                        onClick={handleApplyPromoCode}
                      >
                        Appliquer
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                      onClick={handleCheckout}
                      disabled={isProcessing || !user}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement...
                        </span>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Payer avec Stripe
                        </>
                      )}
                    </Button>
                    
                    <Link to="/products">
                      <Button 
                        variant="ghost" 
                        className="w-full text-winshirt-blue-light hover:bg-winshirt-blue/10"
                      >
                        Continuer les achats
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="winshirt-card p-8 text-center">
              <h2 className="text-xl text-white mb-4">Votre panier est vide</h2>
              <p className="text-gray-300 mb-6">
                Explorez notre collection de t-shirts pour participer à nos loteries exceptionnelles
              </p>
              <Link to="/products">
                <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                  Découvrir nos T-shirts
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;

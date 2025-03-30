
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';
import { toast } from '@/components/ui/sonner';

// Mocked cart items for demonstration
const initialCartItems = [
  {
    id: 1,
    productId: 1,
    name: "T-shirt Cosmique Noir",
    price: 29.99,
    size: "M",
    color: "Noir",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000",
    lotteryName: "PlayStation 5",
  },
  {
    id: 2,
    productId: 3,
    name: "T-shirt Vintage Gaming",
    price: 27.99,
    size: "L",
    color: "Gris",
    quantity: 2,
    image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1000",
    lotteryName: "Vélo Mountain Bike",
  }
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState('');
  
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
  
  const handleCheckout = () => {
    toast.success("Redirection vers le paiement...");
    // Dans une application réelle, vous redirigeriez vers la page de paiement
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
                    >
                      Payer
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

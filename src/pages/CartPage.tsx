
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockLotteries } from '@/data/mockData';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';
import { useAuth } from '@/contexts/AuthContext';
import { X, ShoppingBag, AlertTriangle, CreditCard, Check, MapPin, Truck, User, Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ShippingOptions from '@/components/cart/ShippingOptions';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client'; 
import { Client } from '@/types/client';
import { Order } from '@/types/order';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  secondaryImage?: string;
  tickets: number;
  selectedLotteries: { id: number; name: string }[];
  customVisual?: string; // Ajout du champ customVisual pour stocker l'URL de l'image personnalisée
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isCheckout, setIsCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  useEffect(() => {
    // Load cart from localStorage
    const cartString = localStorage.getItem('cart');
    if (cartString) {
      const cartItems = JSON.parse(cartString) as CartItem[];
      setCart(cartItems);
    }
    
    // Si l'utilisateur est connecté, pré-remplir les infos
    if (user) {
      setUserInfo({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phoneNumber: user.phoneNumber || user.phone || ''
      });
    }
  }, [user]);
  
  useEffect(() => {
    // Calculate total when cart changes
    const newTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);
  
  const handleRemoveFromCart = (itemId: number) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success("Produit supprimé du panier");
  };
  
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  
  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success("Panier vidé avec succès");
  };
  
  const handleStartCheckout = () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    
    setIsCheckout(true);
    
    if (!user) {
      setShowAuthForm(true);
    }
  };
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  // Function to create or update client information
  const saveClientInfo = (orderData: Order) => {
    try {
      // Get existing clients from localStorage
      const clientsString = localStorage.getItem('clients');
      const clients = clientsString ? JSON.parse(clientsString) as Client[] : [];
      
      // Check if client already exists
      const existingClientIndex = clients.findIndex(c => c.id === orderData.clientId);
      
      if (existingClientIndex !== -1) {
        // Update existing client
        clients[existingClientIndex] = {
          ...clients[existingClientIndex],
          orderCount: (clients[existingClientIndex].orderCount || 0) + 1,
          totalSpent: (clients[existingClientIndex].totalSpent || 0) + orderData.total,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        };
      } else {
        // Create new client
        const newClient: Client = {
          id: orderData.clientId,
          name: orderData.clientName,
          email: orderData.clientEmail,
          phone: userInfo.phoneNumber || '',
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          registrationDate: user?.registrationDate || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          orderCount: 1,
          totalSpent: orderData.total,
          participatedLotteries: orderData.items
            .filter(item => item.lotteriesEntries && item.lotteriesEntries.length > 0)
            .flatMap(item => item.lotteriesEntries || []),
        };
        
        clients.push(newClient);
      }
      
      // Save updated clients to localStorage
      localStorage.setItem('clients', JSON.stringify(clients));
      
      // Also update sessionStorage for immediate use
      sessionStorage.setItem('clients', JSON.stringify(clients));
      
      console.log('Client information saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving client information:', error);
      return false;
    }
  };
  
  const handleRegisterAndOrder = async () => {
    // Vérifier les champs obligatoires
    if (!userInfo.name || !userInfo.email || !userInfo.password) {
      toast.error("Veuillez remplir tous les champs d'inscription obligatoires");
      return;
    }
    
    try {
      toast.loading("Création de votre compte...");
      
      // Essayer d'inscrire l'utilisateur
      await register(userInfo.name, userInfo.email, userInfo.password);
      
      // Si l'inscription a réussi, continuer avec la commande
      toast.dismiss();
      toast.success("Compte créé avec succès");
      
      // Procéder au traitement de la commande
      handleConfirmOrder();
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de la création du compte");
      console.error("Erreur d'inscription:", error);
    }
  };
  
  const handleConfirmOrder = () => {
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
      toast.error("Veuillez remplir tous les champs d'adresse de livraison");
      return;
    }
    
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
      toast.error("Veuillez remplir tous les champs d'informations de paiement");
      return;
    }

    if (!selectedShipping) {
      toast.error("Veuillez sélectionner une option de livraison");
      return;
    }
    
    // Si l'utilisateur n'est pas connecté et que le formulaire d'inscription est affiché
    if (!user && showAuthForm) {
      handleRegisterAndOrder();
      return;
    }
    
    // Show processing state
    toast.loading("Traitement de votre commande...");
    
    try {
      // Create order object
      const orderDate = new Date().toISOString();
      const orderId = Date.now();
      
      // Si l'utilisateur est connecté, utiliser ses informations
      const clientId = user ? user.id : Math.floor(Math.random() * 10000) + 1000;
      const clientName = user ? user.name : userInfo.name;
      const clientEmail = user ? user.email : userInfo.email;
      
      // Get products for detailed information
      const productsString = localStorage.getItem('products');
      const products = productsString ? JSON.parse(productsString) : [];
      
      const order: Order = {
        id: orderId,
        clientId: clientId,
        clientName: clientName,
        clientEmail: clientEmail,
        orderDate: orderDate,
        status: 'processing',
        items: cart.map(item => {
          const product = products.find((p: any) => p.id.toString() === item.id.toString());
          return {
            id: Date.now() + Math.floor(Math.random() * 1000) + item.id,
            productId: item.id,
            productName: item.name,
            productImage: item.customVisual || item.image || 'https://placehold.co/600x400/png',
            quantity: item.quantity,
            price: item.price,
            size: item.size || 'M',
            color: item.color || 'Noir',
            lotteriesEntries: item.selectedLotteries.map(lottery => lottery.id)
          };
        }),
        shipping: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          method: selectedShipping === 'express' ? 'Express' : 'Standard',
          cost: shippingCost
        },
        delivery: {
          status: 'preparing',
          estimatedDeliveryDate: new Date(Date.now() + (selectedShipping === 'express' ? 2 : 5) * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdate: orderDate,
          history: [
            {
              date: orderDate,
              status: 'preparing',
              description: 'Commande reçue et en cours de préparation'
            }
          ]
        },
        payment: {
          method: 'Carte bancaire',
          transactionId: 'TR' + orderId,
          status: 'completed'
        },
        subtotal: total,
        total: total + shippingCost,
        trackingNumber: 'TRK' + orderId,
        notes: ''
      };
      
      // Get existing orders from localStorage
      const ordersString = localStorage.getItem('orders');
      const orders = ordersString ? JSON.parse(ordersString) : [];
      
      // Add new order
      orders.push(order);
      
      // Save to localStorage
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Also update sessionStorage for immediate use
      sessionStorage.setItem('orders', JSON.stringify(orders));
      
      // Save last order info for confirmation page
      sessionStorage.setItem('last_order_info', JSON.stringify(order));
      
      // Save client information
      saveClientInfo(order);
      
      // Update lotteries participants
      updateLotteryParticipants(cart);
      
      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));
      setCart([]);
      
      // Show confirmation
      setIsOrderConfirmed(true);
      toast.dismiss();
      toast.success("Commande confirmée avec succès!");
      
      // Redirect to confirmation page after a brief delay
      setTimeout(() => {
        navigate('/confirmation');
      }, 1000);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.dismiss();
      toast.error("Une erreur s'est produite lors du traitement de votre commande");
    }
  };

  // Function to update lottery participants
  const updateLotteryParticipants = (cartItems: CartItem[]) => {
    try {
      // Get lotteries data
      const lotteriesString = localStorage.getItem('lotteries');
      if (!lotteriesString) return;
      
      const lotteries = JSON.parse(lotteriesString);
      let updated = false;
      
      // Update each lottery with new participants
      cartItems.forEach(item => {
        // Skip if no lotteries selected
        if (!item.selectedLotteries || item.selectedLotteries.length === 0) return;
        
        item.selectedLotteries.forEach(selectedLottery => {
          const lotteryIndex = lotteries.findIndex((l: any) => l.id === selectedLottery.id);
          if (lotteryIndex === -1) return;
          
          // Create participant based on current user or new user info
          const participant = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: user ? user.name : userInfo.name || 'Anonymous',
            email: user ? user.email : userInfo.email || 'anonymous@example.com',
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
          };
          
          // Initialize participants array if not exists
          if (!lotteries[lotteryIndex].participants) {
            lotteries[lotteryIndex].participants = [];
          }
          
          // Add participant for each quantity
          for (let i = 0; i < item.quantity; i++) {
            lotteries[lotteryIndex].participants.push({
              ...participant,
              id: participant.id + i
            });
            
            // Increment current participants count
            lotteries[lotteryIndex].currentParticipants += 1;
          }
          
          updated = true;
          
          // Check if lottery has reached target
          if (lotteries[lotteryIndex].currentParticipants >= lotteries[lotteryIndex].targetParticipants) {
            // Schedule a draw if not already scheduled
            if (!lotteries[lotteryIndex].drawDate) {
              const drawDate = new Date();
              drawDate.setDate(drawDate.getDate() + 1); // +24 hours
              lotteries[lotteryIndex].drawDate = drawDate.toISOString();
            }
          }
        });
      });
      
      // Save updated lotteries if changes were made
      if (updated) {
        localStorage.setItem('lotteries', JSON.stringify(lotteries));
        sessionStorage.setItem('lotteries', JSON.stringify(lotteries));
        console.log('Lotteries updated with new participants');
      }
    } catch (error) {
      console.error('Error updating lottery participants:', error);
    }
  };

  const calculateShippingCost = (shippingOption: string) => {
    setSelectedShipping(shippingOption);
    
    switch (shippingOption) {
      case 'standard':
        setShippingCost(5.99);
        break;
      case 'express':
        setShippingCost(9.99);
        break;
      case 'free':
        if (total >= 50) {
          setShippingCost(0);
          break;
        }
      default:
        setShippingCost(5.99);
        break;
    }
  };

  // Function to display formatted dates
  const displayDate = (date: string) => {
    return formatDate(date);
  };

  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card">
            <h1 className="text-3xl font-bold text-white mb-8">
              <ShoppingBag className="inline-block mr-2" size={32} />
              Votre Panier
            </h1>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto text-winshirt-purple-light mb-4" size={48} />
                <p className="text-lg text-gray-300">Votre panier est vide.</p>
                <Button 
                  onClick={() => navigate('/products')}
                  className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
                >
                  Continuer vos achats
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px] mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-winshirt-purple/20">
                      <div className="flex items-center">
                        <img 
                          src={item.customVisual || item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-md mr-4" 
                        />
                        <div>
                          <h3 className="text-lg font-medium text-white">{item.name}</h3>
                          <p className="text-sm text-gray-400">Taille: {item.size}, Couleur: {item.color}</p>
                          <p className="text-sm text-gray-400">
                            Tickets: {item.tickets}
                            {item.selectedLotteries.length > 0 && (
                              <>
                                <br />
                                Loteries:
                                {item.selectedLotteries.map((lottery, index) => (
                                  <span key={lottery.id}>
                                    {lottery.name}
                                    {index < item.selectedLotteries.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </>
                            )}
                            {item.customVisual && (
                              <span className="ml-2 text-winshirt-purple-light">(Visuel personnalisé)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-20 h-10 text-center bg-winshirt-space-light border-winshirt-purple/30 text-lg"
                          />
                        </div>
                        <div className="mr-4 text-winshirt-purple-light font-medium">
                          {(item.price * item.quantity).toFixed(2)} €
                        </div>
                        <Button 
                          variant="ghost"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="hover:bg-winshirt-purple/10 text-red-500"
                        >
                          <X size={20} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-lg text-white">
                    Total: <span className="font-semibold text-winshirt-purple-light">{total.toFixed(2)} €</span>
                  </div>
                  <div>
                    <Button 
                      onClick={handleClearCart}
                      variant="outline"
                      className="mr-4 border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/10"
                    >
                      Vider le panier
                    </Button>
                    <Button 
                      onClick={handleStartCheckout}
                      className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                    >
                      Passer à la caisse
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {isCheckout && (
            <div className="winshirt-card mt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Informations de livraison et de paiement</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information (if not logged in) */}
                {showAuthForm && !user && (
                  <div className="md:col-span-2 mb-4 p-4 border border-winshirt-purple/30 rounded-md bg-winshirt-space-light/30">
                    <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                      <User className="mr-2" size={20} />
                      Créer un compte
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Nom complet"
                          value={userInfo.name}
                          onChange={handleUserInfoChange}
                          className="bg-winshirt-space-light border-winshirt-purple/30 h-12 mb-3"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          name="phoneNumber"
                          placeholder="Téléphone"
                          value={userInfo.phoneNumber}
                          onChange={handleUserInfoChange}
                          className="bg-winshirt-space-light border-winshirt-purple/30 h-12 mb-3"
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={userInfo.email}
                          onChange={handleUserInfoChange}
                          className="bg-winshirt-space-light border-winshirt-purple/30 h-12 mb-3"
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          name="password"
                          placeholder="Mot de passe"
                          value={userInfo.password}
                          onChange={handleUserInfoChange}
                          className="bg-winshirt-space-light border-winshirt-purple/30 h-12 mb-3"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      La création d'un compte vous permettra de suivre vos commandes et d'accéder à votre historique.
                    </p>
                  </div>
                )}
                
                {/* Shipping Information */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                    <MapPin className="mr-2" size={20} />
                    Adresse de livraison
                  </h3>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Adresse"
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  <Input
                    type="text"
                    name="city"
                    placeholder="Ville"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  <Input
                    type="text"
                    name="zipCode"
                    placeholder="Code postal"
                    value={shippingAddress.zipCode}
                    onChange={handleShippingChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  <Input
                    type="text"
                    name="country"
                    placeholder="Pays"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  
                  <ShippingOptions 
                    selectedMethod={selectedShipping || 'standard'}
                    onChange={(method) => {
                      setSelectedShipping(method);
                      calculateShippingCost(method);
                    }}
                    subtotal={total}
                  />
                  
                  {selectedShipping && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-100">
                      Frais de livraison: {shippingCost.toFixed(2)} €
                    </div>
                  )}
                </div>
                
                {/* Payment Information */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Informations de paiement
                  </h3>
                  <Input
                    type="text"
                    name="cardNumber"
                    placeholder="Numéro de carte"
                    value={paymentInfo.cardNumber}
                    onChange={handlePaymentChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  <Input
                    type="text"
                    name="expiryDate"
                    placeholder="Date d'expiration (MM/AA)"
                    value={paymentInfo.expiryDate}
                    onChange={handlePaymentChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                  <Input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={paymentInfo.cvv}
                    onChange={handlePaymentChange}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 mb-3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleConfirmOrder}
                  className="bg-winshirt-purple hover:bg-winshirt-purple-dark flex items-center"
                >
                  <Lock className="mr-2" size={16} />
                  {!user && showAuthForm ? "Créer mon compte et confirmer la commande" : "Confirmer la commande"}
                </Button>
              </div>
            </div>
          )}
          
          {isOrderConfirmed && (
            <div className="winshirt-card mt-8 text-center">
              <Check className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-lg text-white">
                Votre commande a été confirmée avec succès!
              </p>
              <p className="text-gray-300">
                Vous allez être redirigé vers la page de confirmation...
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;

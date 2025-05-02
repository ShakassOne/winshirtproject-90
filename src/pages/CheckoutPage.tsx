import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { CheckoutFormData, OrderSummary } from '@/types/checkout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const CheckoutPage: React.FC = () => {
  const { items, clearCart, calculateTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: user?.phoneNumber || user?.phone || '',
    paymentMethod: 'card',
    deliveryMethod: 'standard'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(5.99);

  useEffect(() => {
    // Debug logging to help troubleshoot
    console.log("CheckoutPage rendered with items:", items);
    
    // Redirect if cart is empty
    if (!items || items.length === 0) {
      toast.info("Votre panier est vide");
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryMethodChange = (value: "standard" | "express") => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: value
    }));
    
    // Update delivery fee based on selection
    if (value === 'express') {
      setDeliveryFee(9.99);
    } else {
      setDeliveryFee(5.99);
    }
  };

  const handlePaymentMethodChange = (value: "card" | "paypal") => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    console.log("Cart items:", items);
    
    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (!items || items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Initializing checkout process");
      // Prepare order summary
      const orderSummary: OrderSummary = {
        items: items,
        subtotal: calculateTotal(),
        deliveryFee,
        total: calculateTotal() + deliveryFee,
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod
      };

      console.log("Order summary:", orderSummary);

      // Call Stripe checkout function
      const result = await initiateStripeCheckout(items);
      
      console.log("Checkout result:", result);
      
      if (result && 'success' in result && result.success) {
        // Success case
        toast.success("Commande traitée avec succès!");
        
        // Clear cart
        clearCart();
        
        // Redirect to confirmation page or handle success
        if (result.url && result.url !== '/confirmation') {
          // If we have a URL for external payment, redirect there
          window.location.href = result.url;
        } else {
          // Otherwise navigate to success page
          navigate('/confirmation', { state: { orderSummary } });
        }
      } else {
        // Error case
        const errorMessage = result && 'error' in result ? result.error : 'Erreur inconnue';
        toast.error(`Erreur de paiement: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(`Une erreur est survenue lors du traitement de votre commande. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Finaliser votre commande</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-winshirt-space/60 backdrop-blur-lg rounded-lg p-6 border border-winshirt-purple/30">
            <h2 className="text-xl font-semibold text-white mb-4">Informations de livraison</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom*</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-winshirt-space/80 border-winshirt-purple/30"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom*</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-winshirt-space/80 border-winshirt-purple/30"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-winshirt-space/80 border-winshirt-purple/30"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-winshirt-space/80 border-winshirt-purple/30"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Adresse*</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-winshirt-space/80 border-winshirt-purple/30"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville*</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-winshirt-space/80 border-winshirt-purple/30"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Code postal*</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="bg-winshirt-space/80 border-winshirt-purple/30"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="country">Pays*</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="bg-winshirt-space/80 border-winshirt-purple/30"
                  required
                />
              </div>
              
              <div className="pt-4 border-t border-winshirt-purple/30">
                <h3 className="text-lg font-medium text-white mb-4">Méthode de livraison</h3>
                <RadioGroup 
                  value={formData.deliveryMethod} 
                  onValueChange={(value) => handleDeliveryMethodChange(value as "standard" | "express")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 rounded-md border border-winshirt-purple/30 p-4">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="font-medium">Standard (3-5 jours ouvrés)</div>
                      <div className="text-gray-400 text-sm">5.99€</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-md border border-winshirt-purple/30 p-4">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="font-medium">Express (1-2 jours ouvrés)</div>
                      <div className="text-gray-400 text-sm">9.99€</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-4 border-t border-winshirt-purple/30">
                <h3 className="text-lg font-medium text-white mb-4">Mode de paiement</h3>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handlePaymentMethodChange(value as "card" | "paypal")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 rounded-md border border-winshirt-purple/30 p-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Carte bancaire</div>
                      <div className="text-gray-400 text-sm">Visa, Mastercard, etc.</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-md border border-winshirt-purple/30 p-4">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="font-medium">PayPal</div>
                      <div className="text-gray-400 text-sm">Payer avec votre compte PayPal</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Valider la commande'}
              </Button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-winshirt-space/60 backdrop-blur-lg rounded-lg p-6 border border-winshirt-purple/30 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
            
            <div className="space-y-4">
              {items && items.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <div>
                    <div className="text-white">{item.name}</div>
                    <div className="text-gray-400 text-sm">
                      {item.size && `Taille: ${item.size}`}
                      {item.size && item.color && ' | '}
                      {item.color && `Couleur: ${item.color}`}
                    </div>
                    <div className="text-gray-400 text-sm">Qté: {item.quantity}</div>
                  </div>
                  <div className="text-white">{(item.price * item.quantity).toFixed(2)}€</div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-winshirt-purple/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Sous-total</span>
                  <span className="text-white">{calculateTotal().toFixed(2)}€</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Livraison</span>
                  <span className="text-white">{deliveryFee.toFixed(2)}€</span>
                </div>
                
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-winshirt-purple/30">
                  <span className="text-white">Total</span>
                  <span className="text-winshirt-blue-light">{(calculateTotal() + deliveryFee).toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

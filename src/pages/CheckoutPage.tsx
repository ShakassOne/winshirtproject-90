
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Truck, User } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Formulaire de contact pour les utilisateurs non connectés
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('France');
  const [formIsValid, setFormIsValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const totalAmount = subtotal + shipping;

  // Vérifier la validité du formulaire quand les champs changent
  useEffect(() => {
    if (!user) {
      // Vérifier si tous les champs requis sont remplis
      const isValid = Boolean(
        email && 
        email.includes('@') && 
        name && 
        address && 
        city && 
        postalCode && 
        country
      );
      setFormIsValid(isValid);
    }
  }, [email, name, address, city, postalCode, country, user]);

  const handleCheckout = async () => {
    try {
      // Si l'utilisateur n'est pas connecté et que le formulaire n'est pas valide, afficher une erreur
      if (!user && !formIsValid) {
        toast.error("Veuillez remplir tous les champs requis.");
        return;
      }
      
      setIsProcessing(true);
      
      // Créer un objet avec les informations de livraison
      const shippingInfo = !user ? {
        name,
        email,
        address,
        city,
        postalCode,
        country
      } : undefined;
      
      const { success, error, url } = await initiateStripeCheckout(cartItems, totalAmount, shippingInfo);
      
      if (success && url) {
        toast.success('Redirection vers la page de paiement...');
        // Rediriger vers Stripe
        window.location.href = url;
      } else {
        toast.error("Une erreur est survenue lors de l'initialisation du paiement");
        console.error('Checkout error:', error);
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'initialisation du paiement");
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto pt-28 pb-16 px-4">
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
    <div className="container mx-auto pt-28 pb-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Paiement</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Formulaire de contact si l'utilisateur n'est pas connecté */}
          {!user && (
            <Card className="winshirt-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-winshirt-purple" />
                  Informations personnelles
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input 
                        id="name"
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Adresse de livraison */}
          <Card className="winshirt-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="mr-2 h-5 w-5 text-winshirt-purple" />
                Adresse de livraison
              </h2>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input 
                    id="address"
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Rue Example"
                    required
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input 
                      id="city"
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Paris"
                      required
                      className="bg-winshirt-space-light border-winshirt-purple/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input 
                      id="postalCode"
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="75000"
                      required
                      className="bg-winshirt-space-light border-winshirt-purple/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Input 
                    id="country"
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="France"
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                    defaultValue="France"
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <div className="p-6 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Résumé de la commande</h2>
            <div className="space-y-2">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="pt-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400">Livraison</span>
                  <span>{shipping.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="winshirt-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-winshirt-purple" />
                Paiement sécurisé
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Le paiement est sécurisé par Stripe. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                En cliquant sur "Payer", vous serez redirigé vers l'interface de paiement sécurisée Stripe pour finaliser votre commande.
              </p>
              
              <div className="border-t border-winshirt-purple/30 pt-4 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-winshirt-purple-light">{totalAmount.toFixed(2)} €</span>
                </div>
              </div>
              
              <Separator className="my-4 bg-winshirt-purple/20" />
              
              <Button 
                onClick={handleCheckout}
                disabled={(!user && !formIsValid) || isProcessing}
                className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                {isProcessing ? "Traitement en cours..." : `Payer ${totalAmount.toFixed(2)} €`}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-gray-400 hover:text-white"
                onClick={() => navigate('/cart')}
                disabled={isProcessing}
              >
                Retour au panier
              </Button>
            </div>
          </Card>
          
          <div className="p-4 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
            <h3 className="font-medium mb-2">Informations sur le paiement</h3>
            <p className="text-sm text-gray-400">
              Après avoir cliqué sur "Payer", vous serez redirigé vers la plateforme sécurisée de Stripe pour finaliser votre paiement.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Vous recevrez une confirmation de commande par email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

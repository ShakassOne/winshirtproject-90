
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Package, ShoppingBag, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';

interface OrderDetails {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
  orderNotes?: string;
  orderItems: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderId] = useState(`WS-${Date.now().toString().slice(-6)}`);
  const [estimatedDeliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Standard delivery by default
    return date.toLocaleDateString('fr-FR');
  });

  useEffect(() => {
    // Récupérer les détails de la commande du localStorage
    const orderDetailsString = localStorage.getItem('lastOrderDetails');
    if (!orderDetailsString) {
      // Rediriger vers la page d'accueil si aucune commande n'est trouvée
      toast.error('Aucune commande trouvée');
      navigate('/');
      return;
    }

    try {
      const details = JSON.parse(orderDetailsString);
      setOrderDetails(details);
      
      // Vider le panier après confirmation réussie
      localStorage.setItem('cart', '[]');
      
      // Afficher un toast de succès
      toast.success('Commande confirmée avec succès !');
      
      // Gérer la création de compte si nécessaire
      const pendingRegistrationString = localStorage.getItem('pendingRegistration');
      if (pendingRegistrationString) {
        const registration = JSON.parse(pendingRegistrationString);
        // Ici, vous pourriez implémenter la logique de création de compte
        console.log('Création de compte en attente:', registration);
        // Une fois le compte créé, supprimer les données temporaires
        localStorage.removeItem('pendingRegistration');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      toast.error('Erreur lors de la récupération des détails de la commande');
      navigate('/');
    }
  }, [navigate]);

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white">Chargement des détails de la commande...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-winshirt-purple/20 rounded-full mb-4">
          <CheckCircle size={40} className="text-winshirt-purple-light" />
        </div>
        <h1 className="text-3xl font-bold text-white">Merci pour votre commande !</h1>
        <p className="text-gray-400 mt-2">
          Votre commande #{orderId} a été confirmée et est en cours de traitement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* État de la commande */}
          <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
            <h2 className="text-xl font-semibold text-white mb-4">État de la commande</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-winshirt-purple-light">
                <CheckCircle className="mr-2" size={20} />
                <span>Commande confirmée</span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
            
            <div className="w-full bg-winshirt-blue/10 h-1 my-4 rounded-full">
              <div className="bg-winshirt-purple h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
            
            <div className="grid grid-cols-4 text-center text-xs">
              <div className="text-winshirt-purple-light">
                <CheckCircle size={16} className="mx-auto mb-1" />
                <span>Confirmée</span>
              </div>
              <div className="text-gray-400">
                <Package size={16} className="mx-auto mb-1" />
                <span>Préparation</span>
              </div>
              <div className="text-gray-400">
                <Truck size={16} className="mx-auto mb-1" />
                <span>Expédiée</span>
              </div>
              <div className="text-gray-400">
                <ShoppingBag size={16} className="mx-auto mb-1" />
                <span>Livrée</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-winshirt-purple/10 rounded-lg border border-winshirt-purple/20">
              <p className="text-sm text-winshirt-purple-light">
                Livraison estimée: <span className="font-semibold">{estimatedDeliveryDate}</span>
              </p>
            </div>
          </Card>

          {/* Détails de la commande */}
          <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
            <h2 className="text-xl font-semibold text-white mb-4">Détails de la commande</h2>
            
            <div className="space-y-4">
              {orderDetails.orderItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 py-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                    <img
                      src={item.image || "https://placehold.co/100x100/png"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.size && `Taille: ${item.size}`}
                      {item.color && item.size && ' | '}
                      {item.color && `Couleur: ${item.color}`}
                    </p>
                    <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))}

              <Separator className="bg-winshirt-blue/20" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-400">Sous-total</p>
                  <p className="text-white">{orderDetails.subtotal.toFixed(2)} €</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-400">Livraison</p>
                  <p className="text-white">{orderDetails.shippingCost.toFixed(2)} €</p>
                </div>
                <Separator className="bg-winshirt-blue/20" />
                <div className="flex justify-between text-base font-semibold">
                  <p className="text-white">Total</p>
                  <p className="text-winshirt-purple-light">{orderDetails.total.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Informations de livraison */}
          <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
            <h2 className="text-xl font-semibold text-white mb-4">Informations de livraison</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Adresse de livraison</h3>
                <p className="text-white mt-1">
                  {orderDetails.customerInfo.fullName}<br />
                  {orderDetails.shippingAddress.address}<br />
                  {orderDetails.shippingAddress.postalCode} {orderDetails.shippingAddress.city}<br />
                  {orderDetails.shippingAddress.country}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400">Méthode de livraison</h3>
                <p className="text-white mt-1">
                  {orderDetails.shippingMethod === 'standard' && 'Standard (3-5 jours)'}
                  {orderDetails.shippingMethod === 'express' && 'Express (1-2 jours)'}
                  {orderDetails.shippingMethod === 'priority' && 'Prioritaire (24h)'}
                </p>
              </div>

              {orderDetails.orderNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Notes</h3>
                  <p className="text-white mt-1">{orderDetails.orderNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Informations de contact */}
          <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
            <h2 className="text-xl font-semibold text-white mb-4">Informations de contact</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Email</h3>
                <p className="text-white mt-1">{orderDetails.customerInfo.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400">Téléphone</h3>
                <p className="text-white mt-1">{orderDetails.customerInfo.phone}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="default" 
              className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
              onClick={() => navigate('/account')}
            >
              Suivre ma commande
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-winshirt-blue/30 hover:bg-winshirt-blue/10"
              onClick={() => navigate('/products')}
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;

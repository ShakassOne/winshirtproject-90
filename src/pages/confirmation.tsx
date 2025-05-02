
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { OrderSummary } from '@/types/checkout';
import { toast } from '@/lib/toast';

const Confirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderSummary = location.state?.orderSummary as OrderSummary;

  useEffect(() => {
    // Si nous avons des détails de commande, simuler la mise à jour des participants à la loterie
    if (orderSummary && orderSummary.items.length > 0) {
      // Pour chaque article acheté, si le produit est lié à une loterie, incrémenter le nombre de participants
      orderSummary.items.forEach(item => {
        if (item.linkedLotteries && item.linkedLotteries.length > 0) {
          try {
            // Récupérer les loteries depuis localStorage
            const lotteriesStr = localStorage.getItem('lotteries');
            if (lotteriesStr) {
              const lotteries = JSON.parse(lotteriesStr);
              
              // Mettre à jour le nombre de participants pour chaque loterie liée
              let updated = false;
              item.linkedLotteries.forEach(lotteryId => {
                const lottery = lotteries.find((l: any) => l.id === lotteryId);
                if (lottery) {
                  lottery.currentParticipants += item.quantity;
                  updated = true;
                }
              });
              
              // Sauvegarder les loteries mises à jour
              if (updated) {
                localStorage.setItem('lotteries', JSON.stringify(lotteries));
                console.log('Loteries mises à jour avec de nouveaux participants');
              }
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour des participants de la loterie:', error);
          }
        }
      });
    } else if (!orderSummary) {
      toast.error("Aucune information de commande trouvée");
    }
  }, [orderSummary]);

  if (!orderSummary) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-winshirt-space/60 backdrop-blur-lg rounded-lg p-8 border border-winshirt-purple/30 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Merci pour votre commande!</h1>
          <p className="text-gray-300 mb-8">Votre commande a été traitée avec succès.</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/')} className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
              Retour à l'accueil
            </Button>
            <Button onClick={() => navigate('/shop')} className="bg-winshirt-blue hover:bg-winshirt-blue-dark">
              Continuer vos achats
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-winshirt-space/60 backdrop-blur-lg rounded-lg p-8 border border-winshirt-purple/30">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">Merci pour votre commande!</h1>
          <p className="text-gray-300 mt-2">
            Votre commande a été confirmée et est en cours de traitement.
          </p>
        </div>
        
        <div className="border-t border-winshirt-purple/30 pt-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif de la commande</h2>
          
          <div className="space-y-4">
            {orderSummary.items.map(item => (
              <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex justify-between py-2">
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
                <span className="text-white">{orderSummary.subtotal.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Livraison ({orderSummary.deliveryMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span className="text-white">{orderSummary.deliveryFee.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-winshirt-purple/30">
                <span className="text-white">Total</span>
                <span className="text-winshirt-blue-light">{orderSummary.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-winshirt-purple/30 pt-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informations de livraison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-300 font-medium">Adresse de livraison</h3>
              <p className="text-white">{orderSummary.customerInfo.name}</p>
              <p className="text-white">{orderSummary.customerInfo.address}</p>
              <p className="text-white">{orderSummary.customerInfo.postalCode} {orderSummary.customerInfo.city}</p>
              <p className="text-white">{orderSummary.customerInfo.country}</p>
            </div>
            
            <div>
              <h3 className="text-gray-300 font-medium">Contact</h3>
              <p className="text-white">{orderSummary.customerInfo.email}</p>
              {orderSummary.customerInfo.phone && (
                <p className="text-white">{orderSummary.customerInfo.phone}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/')} className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
              Retour à l'accueil
            </Button>
            <Button onClick={() => navigate('/shop')} className="bg-winshirt-blue hover:bg-winshirt-blue-dark">
              Continuer vos achats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

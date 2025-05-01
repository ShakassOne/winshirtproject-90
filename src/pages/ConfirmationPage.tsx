
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, Truck } from 'lucide-react';
import DynamicBackground from '@/components/backgrounds/DynamicBackground';
import { EmailService } from '@/lib/emailService';
import { Order } from '@/types/order';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Get last order details from localStorage
    const lastOrderDetailsStr = localStorage.getItem('lastOrderDetails');
    if (!lastOrderDetailsStr) {
      navigate('/products');
      return;
    }

    try {
      const details = JSON.parse(lastOrderDetailsStr);
      setOrderDetails(details);

      // Clear cart after confirmation
      localStorage.setItem('cart', '[]');

      // Send confirmation email if not already sent
      const sendConfirmationEmail = async () => {
        if (!emailSent && details) {
          try {
            // Get the full order details
            const ordersStr = localStorage.getItem('orders');
            if (ordersStr) {
              const orders = JSON.parse(ordersStr);
              const orderFromStorage = orders.find((o: Order) => o.id === details.orderId);
              
              if (orderFromStorage) {
                await EmailService.sendOrderConfirmationEmail(
                  details.customerInfo.email,
                  details.customerInfo.fullName,
                  orderFromStorage
                );
                console.log("Confirmation email sent from confirmation page");
                setEmailSent(true);
              }
            }
          } catch (error) {
            console.error("Error sending confirmation email:", error);
          }
        }
      };

      sendConfirmationEmail();

    } catch (error) {
      console.error("Error parsing order details:", error);
      navigate('/products');
    }
  }, [navigate, emailSent]);

  if (!orderDetails) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <>
      <DynamicBackground />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-winshirt-space/80 backdrop-blur-sm border border-winshirt-purple/30 p-8 shadow-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white">Commande Confirmée!</h1>
              <p className="text-gray-300 mt-2">
                Merci pour votre commande. Vous recevrez bientôt un email de confirmation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-winshirt-purple-light flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Résumé de la commande
                </h2>
                <p className="text-gray-300">
                  <span className="font-medium">Commande #{orderDetails.orderId}</span>
                </p>
                <p className="text-gray-400">
                  {orderDetails.orderItems.length} article(s) pour un total de {orderDetails.total.toFixed(2)}€
                </p>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-winshirt-purple-light flex items-center">
                  <Truck className="mr-2 h-5 w-5" /> Livraison
                </h2>
                <p className="text-gray-300">
                  {orderDetails.customerInfo.fullName}
                </p>
                <p className="text-gray-400">
                  {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.postalCode} {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.country}
                </p>
              </div>
            </div>
            
            <div className="border-t border-winshirt-purple/20 pt-6 mt-6">
              <h2 className="text-lg font-medium text-white mb-4">Articles commandés</h2>
              
              <div className="space-y-4">
                {orderDetails.orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center border-b border-winshirt-purple/10 pb-4">
                    <div className="h-16 w-16 rounded bg-gray-800 mr-4 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <div className="text-sm text-gray-400">
                        {item.size && <span className="mr-2">Taille: {item.size}</span>}
                        {item.color && <span>Couleur: {item.color}</span>}
                      </div>
                      {item.visualDesign && <div className="text-xs text-winshirt-purple-light">Design personnalisé</div>}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Sous-total:</span>
                  <span>{orderDetails.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Livraison:</span>
                  <span>{orderDetails.shippingCost.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-white font-medium text-lg">
                  <span>Total:</span>
                  <span>{orderDetails.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => navigate('/products')}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                Continuer mes achats
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPage;

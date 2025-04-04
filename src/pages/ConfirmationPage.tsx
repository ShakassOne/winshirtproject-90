
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarBackground from '@/components/StarBackground';
import { Check, ShoppingBag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      navigate('/login');
    }
    
    // Check if we have order information in session storage
    const orderInfo = sessionStorage.getItem('last_order_info');
    if (!orderInfo) {
      // If no order info is found, redirect to cart
      navigate('/cart');
    }
  }, [navigate, user]);
  
  // Get order information from session storage
  const orderInfo = sessionStorage.getItem('last_order_info');
  const order = orderInfo ? JSON.parse(orderInfo) : null;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Check className="text-green-500" size={48} />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Commande Confirmée!</h1>
              <p className="text-gray-400">
                Merci pour votre achat. Votre commande a été traitée avec succès.
              </p>
            </div>
            
            {order && (
              <div className="space-y-6">
                <div className="bg-winshirt-space-light p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ShoppingBag className="text-winshirt-purple-light mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-white">Résumé de la commande</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>Numéro de commande :</div>
                    <div className="text-winshirt-purple-light">{order.id}</div>
                    
                    <div>Date :</div>
                    <div>{formatDate(order.orderDate)}</div>
                    
                    <div>Total :</div>
                    <div className="text-winshirt-purple-light font-semibold">{order.total.toFixed(2)} €</div>
                    
                    <div>Statut :</div>
                    <div className="text-green-500">Confirmée</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Calendar className="mr-2" size={18} />
                    Prochaines étapes
                  </h3>
                  <p className="text-gray-400">
                    Vous recevrez un email de confirmation contenant les détails de votre commande.
                    Vous pouvez suivre l'état de votre commande dans votre compte.
                  </p>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Link to="/products">
                    <Button variant="outline" className="border-winshirt-purple text-winshirt-purple-light">
                      Continuer les achats
                    </Button>
                  </Link>
                  
                  <Link to="/account">
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Voir mes commandes
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ConfirmationPage;

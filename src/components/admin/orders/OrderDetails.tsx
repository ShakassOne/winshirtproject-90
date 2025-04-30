
import React from 'react';
import { Order } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Package, Search, Trash } from 'lucide-react';
import DeliveryTracking from './DeliveryTracking';
import InvoiceModal from './InvoiceModal';
import { supabase } from '@/integrations/supabase/client';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [lotteryTitles, setLotteryTitles] = React.useState<{[key: number]: string}>({});
  
  // Récupérer les titres des loteries
  React.useEffect(() => {
    const fetchLotteryTitles = async () => {
      let allLotteryIds: number[] = [];
      
      // Collecter tous les IDs de loteries des articles
      order.items.forEach(item => {
        if (item.lotteriesEntries && item.lotteriesEntries.length > 0) {
          allLotteryIds = [...allLotteryIds, ...item.lotteriesEntries];
        }
      });
      
      // Supprimer les doublons
      const uniqueLotteryIds = [...new Set(allLotteryIds)];
      
      if (uniqueLotteryIds.length > 0) {
        try {
          // Récupérer les titres depuis Supabase ou localStorage
          const { data, error } = await supabase
            .from('lotteries')
            .select('id, title')
            .in('id', uniqueLotteryIds);
            
          if (error) throw error;
          
          const titlesMap: {[key: number]: string} = {};
          if (data) {
            data.forEach(lottery => {
              titlesMap[lottery.id] = lottery.title;
            });
          } else {
            // Fallback à localStorage si pas de données Supabase
            const storedLotteries = localStorage.getItem('lotteries');
            if (storedLotteries) {
              const lotteries = JSON.parse(storedLotteries);
              lotteries.forEach((lottery: any) => {
                if (uniqueLotteryIds.includes(lottery.id)) {
                  titlesMap[lottery.id] = lottery.title;
                }
              });
            }
          }
          
          setLotteryTitles(titlesMap);
        } catch (error) {
          console.error("Erreur lors de la récupération des loteries:", error);
        }
      }
    };
    
    fetchLotteryTitles();
  }, [order.items]);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-500';
      case 'ready_to_ship': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'out_for_delivery': return 'bg-purple-700';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'returned': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Date de commande</p>
          <p className="text-white">{new Date(order.orderDate).toLocaleDateString('fr-FR', { 
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          })}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Statut</p>
          <Badge className={`${getStatusColor(order.status)}`}>
            {order.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-400">Email client</p>
          <p className="text-white">{order.clientEmail}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Paiement</p>
          <Badge className={order.payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
            {order.payment.method} - {order.payment.status}
          </Badge>
        </div>
      </div>

      <Separator />
      
      {/* Produits */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Articles</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="winshirt-card p-4 border border-winshirt-space-light rounded-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <img 
                    src={item.productImage} 
                    alt={item.productName}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-white">{item.productName}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm text-gray-400">Quantité</p>
                      <p className="text-white">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Prix unitaire</p>
                      <p className="text-white">{item.price.toFixed(2)} €</p>
                    </div>
                    {item.size && (
                      <div>
                        <p className="text-sm text-gray-400">Taille</p>
                        <p className="text-white">{item.size}</p>
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <p className="text-sm text-gray-400">Couleur</p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ 
                              backgroundColor: item.color.toLowerCase() === 'noir' ? 'black' : 
                                            item.color.toLowerCase() === 'blanc' ? 'white' : 
                                            item.color.toLowerCase() === 'bleu' ? 'blue' : 
                                            item.color.toLowerCase() === 'rouge' ? 'red' : 
                                            item.color.toLowerCase() === 'vert' ? 'green' : 'gray',
                              border: item.color.toLowerCase() === 'blanc' ? '1px solid #ccc' : 'none'
                            }}
                          />
                          <span className="text-white">{item.color}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visuel personnalisé amélioré */}
                  {item.visualDesign && (
                    <div className="mt-4 border border-winshirt-purple/20 rounded-lg p-4 bg-winshirt-space-light/30">
                      <p className="text-sm text-winshirt-purple-light font-medium mb-2">Visuel personnalisé</p>
                      <div className="flex items-start gap-4">
                        <div className="relative bg-winshirt-space-dark rounded-md p-1 w-24 h-24 flex items-center justify-center">
                          <img 
                            src={item.visualDesign.visualImage}
                            alt={item.visualDesign.visualName}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.visualDesign.visualName}</p>
                          {item.visualDesign.settings && (
                            <p className="text-sm text-gray-300 mt-1">
                              Position: {item.visualDesign.settings.position ? 
                                `x:${item.visualDesign.settings.position.x.toFixed(0)}% y:${item.visualDesign.settings.position.y.toFixed(0)}%` : 
                                'Défaut'
                              }
                            </p>
                          )}
                          {item.visualDesign.settings && item.visualDesign.settings.opacity !== undefined && (
                            <p className="text-sm text-gray-300">
                              Opacité: {(item.visualDesign.settings.opacity * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Participation à des loteries avec titres */}
                  {item.lotteriesEntries && item.lotteriesEntries.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400">Participations loterie</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.lotteriesEntries.map((lotteryId, index) => (
                          <Badge key={index} className="bg-winshirt-blue">
                            {lotteryTitles[lotteryId] || `Loterie #${lotteryId}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/6">
                  <p className="text-sm text-gray-400">Sous-total</p>
                  <p className="text-white font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />
      
      {/* Adresse de livraison */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Adresse de livraison</h3>
        <div className="winshirt-card p-4 border border-winshirt-space-light rounded-lg">
          <p className="text-white">{order.shipping.address}</p>
          <p className="text-white">{order.shipping.postalCode} {order.shipping.city}</p>
          <p className="text-white">{order.shipping.country}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Méthode</p>
            <p className="text-white">{order.shipping.method} - {order.shipping.cost.toFixed(2)} €</p>
          </div>
        </div>
      </div>
      
      {/* Statut de livraison */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Statut de livraison</h3>
        <div className="winshirt-card p-4 border border-winshirt-space-light rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <Badge className={`${getDeliveryStatusColor(order.delivery.status)}`}>
              {order.delivery.status}
            </Badge>
            {order.delivery.trackingNumber && (
              <div className="flex items-center text-sm">
                <span className="text-gray-400 mr-1">N° Suivi:</span>
                <span className="text-white">{order.delivery.trackingNumber}</span>
                {order.delivery.trackingUrl && (
                  <a href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="ml-2 text-winshirt-blue hover:text-winshirt-blue-light">
                    <Search size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
          
          {order.delivery.estimatedDeliveryDate && (
            <p className="text-sm">
              <span className="text-gray-400">Livraison estimée: </span>
              <span className="text-white">{new Date(order.delivery.estimatedDeliveryDate).toLocaleDateString('fr-FR')}</span>
            </p>
          )}
          
          {order.delivery.lastUpdate && (
            <p className="text-sm">
              <span className="text-gray-400">Dernière mise à jour: </span>
              <span className="text-white">{new Date(order.delivery.lastUpdate).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}</span>
            </p>
          )}
          
          {order.delivery.history && order.delivery.history.length > 0 && (
            <DeliveryTracking history={order.delivery.history} />
          )}
        </div>
      </div>
      
      {/* Résumé financier */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Récapitulatif</h3>
        <div className="winshirt-card p-4 border border-winshirt-space-light rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Sous-total</span>
            <span className="text-white">{order.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Frais de livraison</span>
            <span className="text-white">{order.shipping.cost.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-white font-semibold">Total</span>
            <span className="text-white font-semibold">{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {order.notes && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Notes</h3>
          <Alert className="bg-winshirt-space-light border-winshirt-purple/20">
            <AlertTitle>Notes de commande</AlertTitle>
            <AlertDescription>{order.notes}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500/10"
        >
          <Trash className="mr-2 h-4 w-4" /> Supprimer
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
            onClick={() => setShowInvoice(true)}
          >
            <FileText className="mr-2 h-4 w-4" /> Facture
          </Button>
          <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
            <Package className="mr-2 h-4 w-4" /> Mettre à jour
          </Button>
        </div>
      </div>
      
      {showInvoice && order && (
        <InvoiceModal order={order} open={showInvoice} onOpenChange={setShowInvoice} />
      )}
    </div>
  );
};

export default OrderDetails;

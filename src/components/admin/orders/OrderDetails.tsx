
import React from 'react';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { 
  Package, 
  Truck, 
  CreditCard, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from '@/components/ui/image';

interface OrderDetailsProps {
  order: Order;
  onBack?: () => void;
  onStatusChange?: (orderId: number, newStatus: string) => void;
  onUpdateDelivery?: (orderId: number, deliveryData: Partial<Order['delivery']>) => void;
  onAddDeliveryHistoryEntry?: (orderId: number, entry: any) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-500';
      case 'ready_to_ship': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'out_for_delivery': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'returned': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_transit': 
      case 'out_for_delivery': 
        return <Truck className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Commande #{order.id}
          </CardTitle>
          <Badge className={`${getStatusColor(order.status)}`}>
            {order.status === 'pending' ? 'En attente' :
             order.status === 'processing' ? 'En traitement' :
             order.status === 'shipped' ? 'Expédiée' :
             order.status === 'delivered' ? 'Livrée' :
             order.status === 'cancelled' ? 'Annulée' :
             order.status === 'refunded' ? 'Remboursée' : 'Inconnue'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Commandé le {formatDate(order.orderDate)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations client
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{order.clientName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{order.clientEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Adresse de livraison
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <div className="space-y-1">
                <p>{order.shipping.address}</p>
                <p>{order.shipping.postalCode} {order.shipping.city}</p>
                <p>{order.shipping.country}</p>
                <div className="flex items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Méthode: {order.shipping.method}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <Truck className="h-5 w-5 mr-2" />
            Statut de livraison
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getDeliveryStatusIcon(order.delivery.status)}
                <span className="ml-2">
                  {order.delivery.status === 'preparing' ? 'En préparation' :
                   order.delivery.status === 'ready_to_ship' ? 'Prêt à expédier' :
                   order.delivery.status === 'in_transit' ? 'En transit' :
                   order.delivery.status === 'out_for_delivery' ? 'En cours de livraison' :
                   order.delivery.status === 'delivered' ? 'Livré' :
                   order.delivery.status === 'failed' ? 'Échec de livraison' :
                   order.delivery.status === 'returned' ? 'Retourné' : 'Inconnu'}
                </span>
              </div>
              <Badge className={`${getDeliveryStatusColor(order.delivery.status)}`}>
                {order.delivery.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Date de livraison estimée</p>
                <p>{formatDate(order.delivery.estimatedDeliveryDate)}</p>
              </div>
              {order.delivery.actualDeliveryDate && (
                <div>
                  <p className="text-sm text-gray-500">Date de livraison réelle</p>
                  <p>{formatDate(order.delivery.actualDeliveryDate)}</p>
                </div>
              )}
              {order.delivery.carrier && (
                <div>
                  <p className="text-sm text-gray-500">Transporteur</p>
                  <p>{order.delivery.carrier}</p>
                </div>
              )}
              {order.delivery.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-500">Numéro de suivi</p>
                  <p>{order.delivery.trackingNumber}</p>
                </div>
              )}
            </div>
            
            {order.delivery.history && order.delivery.history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="font-medium mb-2">Historique de livraison</p>
                <div className="space-y-3">
                  {order.delivery.history.map((entry, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                        <p className="text-sm text-gray-500">{entry.description}</p>
                        {entry.location && (
                          <p className="text-xs text-gray-400">{entry.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <Package className="h-5 w-5 mr-2" />
            Articles commandés
          </h3>
          
          <div className="space-y-6">
            {order.items.map((item) => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4">
                    <p className="font-medium mb-2">{item.productName}</p>
                    <div className="aspect-square w-full max-w-[150px] overflow-hidden rounded-md">
                      <Image 
                        src={item.productImage} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Quantité: {item.quantity}</p>
                      {item.size && <p>Taille: {item.size}</p>}
                      {item.color && <p>Couleur: {item.color}</p>}
                      <p className="font-medium mt-1">{formatCurrency(item.price)} / unité</p>
                    </div>
                  </div>
                  
                  {/* Visuel personnalisé */}
                  {item.visualDesign && (
                    <div className="md:w-3/4">
                      <p className="font-medium mb-2">Personnalisation: {item.visualDesign.visualName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Visuel recto */}
                        <div>
                          <h4 className="text-sm font-medium mb-1">Recto</h4>
                          <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-md bg-white">
                            <Image 
                              src={item.visualDesign.visualImage} 
                              alt="Visuel recto" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Visuel verso */}
                        <div>
                          <h4 className="text-sm font-medium mb-1">Verso</h4>
                          <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-md bg-white">
                            <Image 
                              src={item.productImage} 
                              alt="Visuel verso" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {item.visualDesign.settings && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Paramètres d'impression:</p>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {item.visualDesign.settings.position && (
                              <p>Position: X: {item.visualDesign.settings.position.x}, Y: {item.visualDesign.settings.position.y}</p>
                            )}
                            {item.visualDesign.settings.size && (
                              <p>Taille: {item.visualDesign.settings.size.width} x {item.visualDesign.settings.size.height}</p>
                            )}
                            {item.visualDesign.settings.opacity !== undefined && (
                              <p>Opacité: {item.visualDesign.settings.opacity * 100}%</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Loteries liées */}
                {item.lotteriesEntries && item.lotteriesEntries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">Participations aux loteries:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.lotteriesEntries.map((lotteryId) => (
                        <Badge key={lotteryId} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          Loterie #{lotteryId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <CreditCard className="h-5 w-5 mr-2" />
            Informations de paiement
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p>{order.payment.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut du paiement</p>
                <Badge className={
                  order.payment.status === 'completed' ? 'bg-green-500' :
                  order.payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {order.payment.status === 'completed' ? 'Complété' :
                   order.payment.status === 'pending' ? 'En attente' : 'Échoué'}
                </Badge>
              </div>
              {order.payment.transactionId && (
                <div>
                  <p className="text-sm text-gray-500">ID de transaction</p>
                  <p>{order.payment.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2" />
            Récapitulatif de la commande
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{formatCurrency(order.shipping.cost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-8">
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2" />
              Notes
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <p>{order.notes}</p>
            </div>
          </div>
        )}

        {/* Invoice Link */}
        {order.invoiceUrl && (
          <div className="mt-8 flex justify-end">
            <a 
              href={order.invoiceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Voir la facture
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetails;


import React from 'react';
import { Circle, Package, Truck, CreditCard, MapPin, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Order, OrderItem, DeliveryStatus } from '@/types/order';
import OrderItemVisualPreview from './OrderItemVisualPreview';
import InvoiceModal from './InvoiceModal';
import DeliveryTracking from './DeliveryTracking';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const [showInvoice, setShowInvoice] = React.useState(false);
  
  // Status colors
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
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get delivery status color
  const getDeliveryStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-500';
      case 'ready_to_ship': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'out_for_delivery': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'returned': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Order header information */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-winshirt-purple-light" />
            <span className="text-gray-300">
              Commande passée le {formatDate(order.orderDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-winshirt-purple-light" />
            <span className="text-gray-300">
              Paiement: {order.payment?.method || 'Carte bancaire'} ({order.payment?.status || 'completed'})
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          <Badge className={getDeliveryStatusColor(order.delivery?.status || 'preparing')}>
            {order.delivery?.status || 'preparing'}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => setShowInvoice(true)}>
            Facture
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Order Items */}
      <Card className="bg-transparent border-winshirt-purple/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="border border-winshirt-purple/10 rounded-lg p-4 bg-winshirt-space-light/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item info */}
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.productImage || '/placeholder.svg'} 
                      alt={item.productName}
                      className="h-24 w-24 object-cover rounded"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-white">{item.productName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          Quantité: {item.quantity}
                        </span>
                        {item.size && (
                          <span className="flex items-center gap-1">
                            • Taille: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            • Couleur: 
                            <span className="flex items-center">
                              <Circle className="h-3 w-3 mr-1 fill-current" style={{ color: item.color }} />
                              {item.color}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="font-semibold text-winshirt-purple-light">
                          {item.price.toFixed(2)} €
                        </span>
                      </div>
                      
                      {/* Lottery entries */}
                      {item.lotteriesEntries && item.lotteriesEntries.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.lotteriesEntries.map((lotteryId) => (
                            <Badge key={lotteryId} variant="secondary" className="bg-winshirt-purple/20 text-xs">
                              Loterie #{lotteryId}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Visual preview */}
                  <div className="col-span-2">
                    {item.visualDesign ? (
                      <OrderItemVisualPreview
                        productImage={item.productImage || '/placeholder.svg'}
                        visualDesign={item.visualDesign}
                        productName={item.productName}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center border rounded p-4 bg-winshirt-space-light/20">
                        <p className="text-gray-400">Pas de personnalisation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order totals */}
          <div className="flex flex-col items-end mt-6 space-y-1">
            <div className="grid grid-cols-2 gap-x-8 text-sm text-gray-300 w-full max-w-xs">
              <span>Sous-total:</span>
              <span className="text-right">{order.subtotal?.toFixed(2) || order.total.toFixed(2)} €</span>
              
              <span>Livraison:</span>
              <span className="text-right">{order.shipping?.cost || 0} €</span>
              
              <div className="col-span-2 my-1">
                <Separator className="bg-white/20" />
              </div>
              
              <span className="font-semibold text-white">Total:</span>
              <span className="text-right font-semibold text-white">{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Shipping info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-transparent border-winshirt-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-300">
              <p className="font-medium text-white">{order.clientName}</p>
              <p>{order.shipping?.address}</p>
              <p>{order.shipping?.postalCode} {order.shipping?.city}</p>
              <p>{order.shipping?.country}</p>
              <p className="text-winshirt-purple-light">{order.clientEmail}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="bg-winshirt-space-light">
                  {order.shipping?.method || 'Standard'}
                </Badge>
                <span className="text-sm text-gray-400">
                  {order.shipping?.cost ? `${order.shipping.cost.toFixed(2)} €` : 'Gratuit'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-winshirt-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" /> Suivi de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.delivery && order.delivery.history ? (
              <DeliveryTracking history={order.delivery.history} />
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                Pas d'informations de suivi disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Notes */}
      {order.notes && (
        <div className="p-4 bg-winshirt-space-light/30 rounded-lg border border-winshirt-purple/10">
          <h3 className="font-medium mb-2">Notes:</h3>
          <p className="text-gray-300">{order.notes}</p>
        </div>
      )}
      
      {/* Invoice modal */}
      <InvoiceModal
        open={showInvoice} 
        onOpenChange={setShowInvoice} 
        order={order}
      />
    </div>
  );
};

export default OrderDetails;

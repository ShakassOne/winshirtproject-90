
import React from 'react';
import { ArrowLeft, Package, Truck, CreditCard, FileText, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/lib/toast';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack, onStatusChange }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleStatusChange = (status: string) => {
    onStatusChange(order.id, status as OrderStatus);
    toast.success(`Statut de la commande mis à jour: ${getStatusLabel(status as OrderStatus)}`);
  };
  
  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    
    return statusMap[status] || status;
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    let color;
    
    switch (status) {
      case 'pending':
        color = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        break;
      case 'processing':
        color = "bg-blue-500/20 text-blue-500 border-blue-500/30";
        break;
      case 'shipped':
        color = "bg-purple-500/20 text-purple-500 border-purple-500/30";
        break;
      case 'delivered':
        color = "bg-green-500/20 text-green-500 border-green-500/30";
        break;
      case 'cancelled':
        color = "bg-red-500/20 text-red-500 border-red-500/30";
        break;
      case 'refunded':
        color = "bg-orange-500/20 text-orange-500 border-orange-500/30";
        break;
      default:
        color = "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
    
    return <Badge className={`${color} border`}>{getStatusLabel(status)}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="winshirt-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack} 
              className="hover:bg-winshirt-purple/20"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Commande #{order.id}
                {getStatusBadge(order.status)}
              </h2>
              <p className="text-gray-400">
                Passée le {formatDate(order.orderDate)} par {order.clientName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select defaultValue={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px] bg-winshirt-space-light border-winshirt-purple/30">
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="refunded">Remboursée</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="border-winshirt-purple/30 text-white">
              <FileText size={16} className="mr-2" />
              Facture
            </Button>
            
            <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
              <Send size={16} className="mr-2" />
              Contacter
            </Button>
          </div>
        </div>
      </div>
      
      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne 1: Détails client */}
        <div className="space-y-6">
          <Card className="winshirt-card overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informations client</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Nom complet</p>
                  <p className="text-white">{order.clientName}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{order.clientEmail}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Adresse de livraison</p>
                  <p className="text-white">
                    {order.shipping.address}<br />
                    {order.shipping.postalCode} {order.shipping.city}<br />
                    {order.shipping.country}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="winshirt-card overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                Paiement
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Méthode</p>
                  <p className="text-white">{order.payment.method}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Statut</p>
                  <Badge className={
                    order.payment.status === 'completed' 
                      ? "bg-green-500/20 text-green-500 border-green-500/30 border" 
                      : order.payment.status === 'pending'
                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 border"
                        : "bg-red-500/20 text-red-500 border-red-500/30 border"
                  }>
                    {order.payment.status === 'completed' ? 'Payé' : 
                     order.payment.status === 'pending' ? 'En attente' : 'Échoué'}
                  </Badge>
                </div>
                
                {order.payment.transactionId && (
                  <div>
                    <p className="text-gray-400 text-sm">Transaction ID</p>
                    <p className="text-winshirt-blue-light">#{order.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne 2: Articles */}
        <div className="md:col-span-2">
          <Card className="winshirt-card overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package size={18} />
                Articles ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
              
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex border-b border-winshirt-purple/10 pb-4">
                    <div className="w-16 h-16 mr-4 flex-shrink-0 bg-winshirt-space-light rounded overflow-hidden">
                      <img 
                        src={item.productImage} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-white font-medium">{item.productName}</h4>
                        <span className="text-winshirt-purple-light font-semibold">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <div>
                          {item.quantity} x {item.price.toFixed(2)} € 
                          {item.size && <span> &middot; Taille: {item.size}</span>}
                          {item.color && <span> &middot; Couleur: {item.color}</span>}
                        </div>
                      </div>
                      
                      {item.lotteriesEntries && item.lotteriesEntries.length > 0 && (
                        <div className="mt-2">
                          <Badge className="bg-winshirt-blue/20 text-winshirt-blue-light border-winshirt-blue/30 border">
                            Participation à {item.lotteriesEntries.length} loterie(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 space-y-2 border-t border-winshirt-purple/10">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{order.subtotal.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Livraison ({order.shipping.method})</span>
                    <span>{order.shipping.cost.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-winshirt-purple/10">
                    <span>Total</span>
                    <span className="text-winshirt-purple-light">{order.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Information de livraison */}
          <div className="mt-6">
            <Card className="winshirt-card overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Truck size={18} />
                  Livraison
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Méthode</p>
                      <p className="text-white">{order.shipping.method}</p>
                    </div>
                    
                    {order.trackingNumber && (
                      <div>
                        <p className="text-gray-400 text-sm">Numéro de suivi</p>
                        <p className="text-winshirt-blue-light">#{order.trackingNumber}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-gray-400 text-sm">Statut</p>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    {order.status === 'shipped' && (
                      <Button className="bg-winshirt-blue hover:bg-winshirt-blue-dark md:self-end">
                        Suivre le colis
                      </Button>
                    )}
                  </div>
                  
                  {order.notes && (
                    <div className="pt-4 border-t border-winshirt-purple/10">
                      <p className="text-gray-400 text-sm">Notes de commande</p>
                      <p className="text-white">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chronologie */}
          <div className="mt-6">
            <Card className="winshirt-card overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Historique de la commande
                </h3>
                
                <div className="space-y-4">
                  <div className="relative pl-6 border-l-2 border-green-500">
                    <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-0"></div>
                    <p className="text-white">Commande créée</p>
                    <p className="text-gray-400 text-sm">{formatDate(order.orderDate)}</p>
                  </div>
                  
                  {order.payment.status === 'completed' && (
                    <div className="relative pl-6 border-l-2 border-winshirt-blue">
                      <div className="absolute w-4 h-4 bg-winshirt-blue rounded-full -left-[9px] top-0"></div>
                      <p className="text-white">Paiement confirmé</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(new Date(order.orderDate).getTime() + 3600000).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'processing' && (
                    <div className="relative pl-6 border-l-2 border-winshirt-purple">
                      <div className="absolute w-4 h-4 bg-winshirt-purple rounded-full -left-[9px] top-0"></div>
                      <p className="text-white">En cours de préparation</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(new Date(order.orderDate).getTime() + 86400000).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'shipped' && (
                    <div className="relative pl-6 border-l-2 border-purple-500">
                      <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[9px] top-0"></div>
                      <p className="text-white">Commande expédiée</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(new Date(order.orderDate).getTime() + 172800000).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'delivered' && (
                    <div className="relative pl-6 border-l-2 border-gray-500">
                      <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-0"></div>
                      <p className="text-white">Commande livrée</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(new Date(order.orderDate).getTime() + 432000000).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

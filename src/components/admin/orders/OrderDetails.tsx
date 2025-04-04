import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Order, OrderStatus, DeliveryStatus, DeliveryHistoryEntry } from '@/types/order';
import { ArrowLeft, Box, CalendarClock, ChevronDown, CreditCard, MapPin, Truck, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DeliveryTracking from './DeliveryTracking';
import { toast } from '@/lib/toast';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  onUpdateDelivery: (orderId: number, deliveryData: Partial<Order['delivery']>) => void;
  onAddDeliveryHistoryEntry: (orderId: number, entry: DeliveryHistoryEntry) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  order, 
  onBack, 
  onStatusChange,
  onUpdateDelivery,
  onAddDeliveryHistoryEntry
}) => {
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: order.delivery?.carrier || '',
    trackingNumber: order.delivery?.trackingNumber || '',
    trackingUrl: order.delivery?.trackingUrl || ''
  });
  
  const [newHistoryEntry, setNewHistoryEntry] = useState({
    status: 'preparing' as DeliveryStatus,
    location: '',
    description: ''
  });
  
  const handleDeliveryInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingInfo({
      ...trackingInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUpdateDeliveryInfo = () => {
    onUpdateDelivery(order.id, trackingInfo);
  };
  
  const handleAddHistoryEntry = () => {
    if (!newHistoryEntry.description) {
      toast.error("Veuillez ajouter une description pour cette mise à jour");
      return;
    }
    
    const entry: DeliveryHistoryEntry = {
      date: new Date().toISOString(),
      status: newHistoryEntry.status,
      location: newHistoryEntry.location,
      description: newHistoryEntry.description
    };
    
    onAddDeliveryHistoryEntry(order.id, entry);
    
    // Reset form
    setNewHistoryEntry({
      status: 'preparing',
      location: '',
      description: ''
    });
  };
  
  const getOrderStatusOptions = () => {
    return [
      { value: 'pending', label: 'En attente' },
      { value: 'processing', label: 'En traitement' },
      { value: 'shipped', label: 'Expédiée' },
      { value: 'delivered', label: 'Livrée' },
      { value: 'cancelled', label: 'Annulée' },
      { value: 'refunded', label: 'Remboursée' }
    ];
  };
  
  const getDeliveryStatusOptions = () => {
    return [
      { value: 'preparing', label: 'En préparation' },
      { value: 'ready_to_ship', label: 'Prêt à expédier' },
      { value: 'in_transit', label: 'En transit' },
      { value: 'out_for_delivery', label: 'En cours de livraison' },
      { value: 'delivered', label: 'Livré' },
      { value: 'failed', label: 'Échec de livraison' },
      { value: 'returned', label: 'Retourné' }
    ];
  };
  
  const getOrderStatusOptions = () => {
    return [
      { value: 'pending', label: 'En attente' },
      { value: 'processing', label: 'En traitement' },
      { value: 'shipped', label: 'Expédiée' },
      { value: 'delivered', label: 'Livrée' },
      { value: 'cancelled', label: 'Annulée' },
      { value: 'refunded', label: 'Remboursée' }
    ];
  };
  
  const getDeliveryStatusOptions = () => {
    return [
      { value: 'preparing', label: 'En préparation' },
      { value: 'ready_to_ship', label: 'Prêt à expédier' },
      { value: 'in_transit', label: 'En transit' },
      { value: 'out_for_delivery', label: 'En cours de livraison' },
      { value: 'delivered', label: 'Livré' },
      { value: 'failed', label: 'Échec de livraison' },
      { value: 'returned', label: 'Retourné' }
    ];
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    let color;
    let label;
    
    switch (status) {
      case 'pending':
        color = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        label = "En attente";
        break;
      case 'processing':
        color = "bg-blue-500/20 text-blue-500 border-blue-500/30";
        label = "En traitement";
        break;
      case 'shipped':
        color = "bg-purple-500/20 text-purple-500 border-purple-500/30";
        label = "Expédiée";
        break;
      case 'delivered':
        color = "bg-green-500/20 text-green-500 border-green-500/30";
        label = "Livrée";
        break;
      case 'cancelled':
        color = "bg-red-500/20 text-red-500 border-red-500/30";
        label = "Annulée";
        break;
      case 'refunded':
        color = "bg-orange-500/20 text-orange-500 border-orange-500/30";
        label = "Remboursée";
        break;
      default:
        color = "bg-gray-500/20 text-gray-500 border-gray-500/30";
        label = status;
    }
    
    return <Badge className={`${color} border`}>{label}</Badge>;
  };
  
  const getDeliveryStatusLabel = (status: DeliveryStatus): string => {
    const statusMap: Record<DeliveryStatus, string> = {
      preparing: 'En préparation',
      ready_to_ship: 'Prêt à expédier',
      in_transit: 'En transit',
      out_for_delivery: 'En cours de livraison',
      delivered: 'Livré',
      failed: 'Échec de livraison',
      returned: 'Retourné'
    };
    
    return statusMap[status] || status;
  };
  
  return (
    <div className="winshirt-card p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          className="border-winshirt-purple/30 text-white"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
        
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Commande #{order.id}
              </h1>
              <div className="flex items-center text-gray-400">
                <CalendarClock size={14} className="mr-1" />
                <span>{formatDate(order.orderDate)}</span>
              </div>
            </div>
            
            <div>
              <Select
                value={order.status}
                onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
              >
                <SelectTrigger className="w-40 bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  {getOrderStatusOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="bg-winshirt-space-light/40 rounded-md p-4">
            <h2 className="text-lg font-medium text-white mb-3">Détails des produits</h2>
            <ScrollArea className="h-[300px]">
              {order.items.map(item => (
                <div 
                  key={item.id}
                  className="flex items-start py-3 border-b border-winshirt-purple/10 last:border-0"
                >
                  <div className="relative w-20 h-20 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                    {/* Badge indiquant si c'est une image personnalisée */}
                    {item.productImage && !item.productImage.includes('placehold.co') && item.productImage !== 'https://placehold.co/600x400/png' && (
                      <Badge className="absolute bottom-0 right-0 bg-winshirt-purple/80 text-white text-xs px-1 py-0">
                        Perso
                      </Badge>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-white">{item.productName}</div>
                    <div className="text-sm text-gray-400">
                      {item.size && `Taille: ${item.size}`}
                      {item.size && item.color && ` · `}
                      {item.color && `Couleur: ${item.color}`}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-winshirt-purple-light">
                        {item.price.toFixed(2)} € × {item.quantity}
                      </div>
                      <div className="font-medium text-white">
                        {(item.price * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            {/* Image personnalisée en grand format */}
            {order.items.some(item => item.productImage && !item.productImage.includes('placehold.co') && item.productImage !== 'https://placehold.co/600x400/png') && (
              <div className="mt-4 border-t border-winshirt-purple/20 pt-4">
                <h3 className="text-md font-medium text-white mb-3 flex items-center">
                  <Image size={16} className="mr-2" />
                  Visuel(s) personnalisé(s)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items
                    .filter(item => item.productImage && !item.productImage.includes('placehold.co') && item.productImage !== 'https://placehold.co/600x400/png')
                    .map((item, idx) => (
                      <div key={idx} className="border border-winshirt-purple/30 rounded-md p-2">
                        <p className="text-sm text-gray-400 mb-2">{item.productName}</p>
                        <img
                          src={item.productImage}
                          alt={`Visuel personnalisé pour ${item.productName}`}
                          className="w-full object-contain rounded-md"
                          style={{ maxHeight: '300px' }}
                        />
                        <a
                          href={item.productImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-winshirt-purple-light mt-2 block text-center"
                        >
                          Voir en plein écran
                        </a>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Order Summary */}
            <div className="mt-4 border-t border-winshirt-purple/20 pt-4">
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Sous-total:</span>
                <span>{order.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Frais de livraison:</span>
                <span>{order.shipping.cost.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-white">
                <span>Total:</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
          
          {/* Delivery Tracking */}
          <DeliveryTracking 
            delivery={order.delivery}
            onUpdateDeliveryInfo={handleUpdateDeliveryInfo}
            trackingInfo={trackingInfo}
            onTrackingInfoChange={handleDeliveryInfoChange}
            newHistoryEntry={newHistoryEntry}
            setNewHistoryEntry={setNewHistoryEntry}
            onAddHistoryEntry={handleAddHistoryEntry}
            statusOptions={getDeliveryStatusOptions()}
          />
        </div>
        
        {/* Right Column - Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-winshirt-space-light/40 rounded-md p-4">
            <h2 className="text-lg font-medium text-white mb-3">Client</h2>
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 text-sm">Nom</div>
                <div className="text-white">{order.clientName}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Email</div>
                <div className="text-white">{order.clientEmail}</div>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/10"
                >
                  Voir le profil client
                </Button>
              </div>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="bg-winshirt-space-light/40 rounded-md p-4">
            <h2 className="text-lg font-medium text-white mb-3 flex items-center">
              <MapPin size={16} className="mr-2" />
              Adresse de livraison
            </h2>
            <div className="text-gray-300">
              <p>{order.shipping.address}</p>
              <p>{order.shipping.postalCode} {order.shipping.city}</p>
              <p>{order.shipping.country}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-winshirt-purple/20">
              <div className="text-gray-400 text-sm">Méthode de livraison</div>
              <div className="text-white">{order.shipping.method}</div>
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="bg-winshirt-space-light/40 rounded-md p-4">
            <h2 className="text-lg font-medium text-white mb-3 flex items-center">
              <CreditCard size={16} className="mr-2" />
              Paiement
            </h2>
            <div className="space-y-2">
              <div>
                <div className="text-gray-400 text-sm">Méthode</div>
                <div className="text-white">{order.payment.method}</div>
              </div>
              {order.payment.transactionId && (
                <div>
                  <div className="text-gray-400 text-sm">Transaction</div>
                  <div className="text-white">{order.payment.transactionId}</div>
                </div>
              )}
              <div>
                <div className="text-gray-400 text-sm">Statut</div>
                <div className="text-white capitalize">{order.payment.status}</div>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="bg-winshirt-space-light/40 rounded-md p-4">
            <h2 className="text-lg font-medium text-white mb-3">Notes</h2>
            <Textarea 
              placeholder="Ajouter des notes sur cette commande..."
              className="bg-winshirt-space-light border-winshirt-purple/30 min-h-[100px]"
              value={order.notes || ''}
            />
            <Button 
              className="w-full mt-3 bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Enregistrer les notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

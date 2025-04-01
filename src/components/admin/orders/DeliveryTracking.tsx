
import React, { useState } from 'react';
import { Order, DeliveryStatus, DeliveryHistoryEntry } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { 
  Truck, 
  PackageOpen, 
  ClipboardList, 
  Map, 
  Clipboard, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DeliveryTrackingProps {
  order: Order;
  onUpdateDelivery: (orderId: number, deliveryData: Partial<Order['delivery']>) => void;
  onAddHistoryEntry: (orderId: number, entry: DeliveryHistoryEntry) => void;
}

const statusLabels: Record<DeliveryStatus, string> = {
  preparing: 'En préparation',
  ready_to_ship: 'Prêt à expédier',
  in_transit: 'En transit',
  out_for_delivery: 'En cours de livraison',
  delivered: 'Livré',
  failed: 'Échec de livraison',
  returned: 'Retourné'
};

const statusIcons: Record<DeliveryStatus, React.ReactNode> = {
  preparing: <PackageOpen className="text-yellow-500" />,
  ready_to_ship: <ClipboardList className="text-blue-500" />,
  in_transit: <Truck className="text-purple-500" />,
  out_for_delivery: <Map className="text-indigo-500" />,
  delivered: <Clipboard className="text-green-500" />,
  failed: <AlertCircle className="text-red-500" />,
  returned: <Truck className="text-orange-500" />
};

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ 
  order, 
  onUpdateDelivery, 
  onAddHistoryEntry 
}) => {
  const [trackingNumber, setTrackingNumber] = useState(order.delivery?.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.delivery?.carrier || '');
  const [trackingUrl, setTrackingUrl] = useState(order.delivery?.trackingUrl || '');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(order.delivery?.status || 'preparing');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(order.delivery?.estimatedDeliveryDate || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(order.delivery?.deliveryInstructions || '');
  const [signatureRequired, setSignatureRequired] = useState(order.delivery?.signatureRequired || false);
  
  // State pour le nouveau point d'historique
  const [newHistoryLocation, setNewHistoryLocation] = useState('');
  const [newHistoryDescription, setNewHistoryDescription] = useState('');
  
  const handleUpdateDelivery = () => {
    const deliveryData = {
      status: deliveryStatus,
      trackingNumber,
      carrier,
      trackingUrl,
      estimatedDeliveryDate,
      deliveryInstructions,
      signatureRequired,
      lastUpdate: new Date().toISOString()
    };
    
    onUpdateDelivery(order.id, deliveryData);
    toast.success("Informations de livraison mises à jour");
  };
  
  const handleAddHistoryEntry = () => {
    if (!newHistoryDescription) {
      toast.error("Veuillez ajouter une description pour cette mise à jour");
      return;
    }
    
    const newEntry: DeliveryHistoryEntry = {
      date: new Date().toISOString(),
      status: deliveryStatus,
      location: newHistoryLocation,
      description: newHistoryDescription
    };
    
    onAddHistoryEntry(order.id, newEntry);
    setNewHistoryLocation('');
    setNewHistoryDescription('');
    toast.success("Point de suivi ajouté à l'historique");
  };
  
  // Fonction pour formater une date
  const displayDate = (dateString?: string) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="winshirt-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck size={20} />
            Suivi de livraison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Statut de livraison</label>
              <Select value={deliveryStatus} onValueChange={(value: DeliveryStatus) => setDeliveryStatus(value)}>
                <SelectTrigger className="w-full bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {statusIcons[value as DeliveryStatus]}
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Transporteur</label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger className="w-full bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Choisir un transporteur" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="chronopost">Chronopost</SelectItem>
                  <SelectItem value="colissimo">Colissimo</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="mondial_relay">Mondial Relay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Numéro de suivi</label>
              <Input 
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Numéro de suivi"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">URL de suivi</label>
              <Input 
                value={trackingUrl} 
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="URL de suivi"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Date de livraison estimée</label>
              <Input 
                type="date"
                value={estimatedDeliveryDate ? estimatedDeliveryDate.split('T')[0] : ''} 
                onChange={(e) => setEstimatedDeliveryDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            
            <div className="flex items-center gap-2 mt-6">
              <input 
                type="checkbox" 
                id="signatureRequired" 
                checked={signatureRequired}
                onChange={(e) => setSignatureRequired(e.target.checked)}
                className="rounded-sm bg-winshirt-space-light border-winshirt-purple/30"
              />
              <label htmlFor="signatureRequired" className="text-white">
                Signature requise à la livraison
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-sm text-gray-400 mb-1 block">Instructions de livraison</label>
            <Textarea 
              value={deliveryInstructions} 
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 min-h-24"
              placeholder="Instructions spéciales pour le livreur..."
            />
          </div>
          
          <Button 
            className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
            onClick={handleUpdateDelivery}
          >
            Mettre à jour les informations de livraison
          </Button>
        </CardContent>
      </Card>
      
      {/* Ajouter un point d'historique */}
      <Card className="winshirt-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Ajouter un point d'historique
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Emplacement</label>
              <Input 
                value={newHistoryLocation} 
                onChange={(e) => setNewHistoryLocation(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Centre de tri, ville, pays..."
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description de la mise à jour</label>
              <Textarea 
                value={newHistoryDescription} 
                onChange={(e) => setNewHistoryDescription(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Colis en cours de traitement au centre de tri..."
              />
            </div>
            
            <Button 
              className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark"
              onClick={handleAddHistoryEntry}
            >
              Ajouter cette mise à jour
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Historique de livraison */}
      <Card className="winshirt-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList size={20} />
            Historique de livraison
          </h3>
          
          {order.delivery?.history && order.delivery.history.length > 0 ? (
            <div className="space-y-4">
              {order.delivery.history.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              ).map((entry, index) => (
                <div key={index} className="border-l-2 border-winshirt-purple pl-4 py-2">
                  <div className="flex items-center gap-2">
                    {statusIcons[entry.status]}
                    <span className="text-winshirt-purple-light font-medium">
                      {statusLabels[entry.status]}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    {new Date(entry.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {entry.location && ` - ${entry.location}`}
                  </div>
                  <p className="text-white mt-1">{entry.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              Aucun historique de livraison disponible pour cette commande
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracking;

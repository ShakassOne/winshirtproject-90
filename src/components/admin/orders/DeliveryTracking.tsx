
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
  delivery?: Order['delivery'];
  onUpdateDeliveryInfo: () => void;
  trackingInfo: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
  };
  onTrackingInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newHistoryEntry: {
    status: DeliveryStatus;
    location: string;
    description: string;
  };
  setNewHistoryEntry: React.Dispatch<React.SetStateAction<{
    status: DeliveryStatus;
    location: string;
    description: string;
  }>>;
  onAddHistoryEntry: () => void;
  statusOptions: { value: string; label: string }[];
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
  delivery,
  onUpdateDeliveryInfo,
  trackingInfo,
  onTrackingInfoChange,
  newHistoryEntry,
  setNewHistoryEntry,
  onAddHistoryEntry,
  statusOptions
}) => {
  // Display date formatting helper function
  const displayDate = (dateString?: string) => {
    if (!dateString) return "Non défini";
    return formatDate(dateString);
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
              <Select 
                value={newHistoryEntry.status} 
                onValueChange={(value: DeliveryStatus) => 
                  setNewHistoryEntry({...newHistoryEntry, status: value})
                }
              >
                <SelectTrigger className="w-full bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {statusIcons[option.value as DeliveryStatus]}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Transporteur</label>
              <Select 
                value={trackingInfo.carrier} 
                onValueChange={(value) => 
                  onTrackingInfoChange({
                    target: { name: 'carrier', value }
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
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
                name="trackingNumber"
                value={trackingInfo.trackingNumber} 
                onChange={onTrackingInfoChange}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Numéro de suivi"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">URL de suivi</label>
              <Input 
                name="trackingUrl"
                value={trackingInfo.trackingUrl} 
                onChange={onTrackingInfoChange}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="URL de suivi"
              />
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
            onClick={onUpdateDeliveryInfo}
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
                value={newHistoryEntry.location} 
                onChange={(e) => setNewHistoryEntry({...newHistoryEntry, location: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Centre de tri, ville, pays..."
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description de la mise à jour</label>
              <Textarea 
                value={newHistoryEntry.description} 
                onChange={(e) => setNewHistoryEntry({...newHistoryEntry, description: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="Colis en cours de traitement au centre de tri..."
              />
            </div>
            
            <Button 
              className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark"
              onClick={onAddHistoryEntry}
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
          
          {delivery?.history && delivery.history.length > 0 ? (
            <div className="space-y-4">
              {delivery.history.sort((a, b) => 
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

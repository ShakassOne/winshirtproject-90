
import React from 'react';
import { DeliveryStatus, DeliveryHistoryEntry } from '@/types/order';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface DeliveryTrackingProps {
  history: DeliveryHistoryEntry[];
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getStatusColor = (status: DeliveryStatus) => {
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
    <div className="mt-4 space-y-3">
      <p className="text-sm text-gray-400 font-medium">Historique de livraison</p>
      <div className="space-y-4">
        {sortedHistory.map((entry, index) => (
          <div key={index} className={cn(
            "relative pl-6 pb-4",
            index !== sortedHistory.length - 1 ? "border-l-2 border-winshirt-space-light ml-2" : ""
          )}>
            <div className={`absolute w-4 h-4 rounded-full -left-2 ${getStatusColor(entry.status)}`} />
            <div className="mb-1 flex justify-between">
              <span className="font-medium text-white">{new Date(entry.date).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}</span>
              {entry.location && <span className="text-sm text-gray-400">{entry.location}</span>}
            </div>
            <p className="text-sm text-gray-300">{entry.description}</p>
            {index !== sortedHistory.length - 1 && <Separator className="my-2 opacity-0" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryTracking;


import React from 'react';
import { DeliveryHistoryEntry } from '@/types/order';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';

interface DeliveryTrackingProps {
  history: DeliveryHistoryEntry[];
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        Pas d'informations de suivi disponibles
      </div>
    );
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get icon based on status type
  const getStatusIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'prepared':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3 text-sm">
      {sortedHistory.map((entry, index) => (
        <div key={index} className="flex items-start gap-3 pb-3 border-b border-winshirt-purple/10 last:border-0">
          <div className="mt-1">
            {getStatusIcon(entry.type)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{entry.description}</div>
            <div className="text-gray-400">
              {formatDistanceToNow(new Date(entry.timestamp), {
                addSuffix: true,
                locale: fr
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryTracking;

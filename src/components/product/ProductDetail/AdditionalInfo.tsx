
import React from 'react';
import { Weight, Truck } from 'lucide-react';

interface AdditionalInfoProps {
  weight?: number;
  deliveryPrice?: number;
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ weight, deliveryPrice }) => {
  if (!weight && deliveryPrice === undefined) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      {weight && (
        <div className="flex items-center text-gray-400">
          <Weight size={16} className="mr-2" />
          <span>{weight}g</span>
        </div>
      )}
      {deliveryPrice !== undefined && (
        <div className="flex items-center text-gray-400">
          <Truck size={16} className="mr-2" />
          <span>
            Livraison: {deliveryPrice > 0 
              ? `${deliveryPrice.toFixed(2)} €` 
              : 'Gratuite'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdditionalInfo;


import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Truck, Clock, CheckCircle } from 'lucide-react';
import { AdminSettings } from '@/types/order';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}

interface ShippingOptionsProps {
  selectedMethod: string;
  onChange: (value: string) => void;
  subtotal: number;
  freeShippingThreshold?: number;
}

const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  selectedMethod,
  onChange,
  subtotal,
  freeShippingThreshold
}) => {
  // État local pour stocker les paramètres de livraison
  const [shippingSettings, setShippingSettings] = useState<AdminSettings['deliverySettings'] | null>(null);
  
  // Charger les paramètres de livraison depuis localStorage
  useEffect(() => {
    const loadShippingSettings = () => {
      try {
        const storedSettings = localStorage.getItem('admin_shipping_settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setShippingSettings(parsedSettings);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres de livraison:", error);
      }
    };
    
    loadShippingSettings();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_shipping_settings') {
        loadShippingSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Utiliser les paramètres configurés ou les valeurs par défaut
  const threshold = freeShippingThreshold || shippingSettings?.freeShippingThreshold || 50;
  const standardPrice = shippingSettings?.defaultShippingRates?.national?.standard || 5.99;
  const expressPrice = shippingSettings?.defaultShippingRates?.national?.express || 9.99;
  const relayPrice = 3.99; // Valeur par défaut si non configurée
  
  const freeShipping = subtotal >= threshold;
  
  const shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Livraison standard',
      description: 'Livraison en 3 à 5 jours ouvrables',
      price: freeShipping ? 0 : standardPrice,
      estimatedDays: '3-5 jours',
      icon: <Truck className="text-winshirt-purple h-5 w-5" />
    },
    {
      id: 'express',
      name: 'Livraison express',
      description: 'Livraison garantie en 24-48h',
      price: expressPrice,
      estimatedDays: '1-2 jours',
      icon: <Clock className="text-winshirt-blue h-5 w-5" />
    },
    {
      id: 'relay',
      name: 'Point relais',
      description: 'Livraison en point relais',
      price: freeShipping ? 0 : relayPrice,
      estimatedDays: '3-4 jours',
      icon: <CheckCircle className="text-green-500 h-5 w-5" />
    }
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Options de livraison</h3>
      
      {freeShipping && (
        <div className="bg-winshirt-purple/20 border border-winshirt-purple/30 rounded-lg p-3 mb-4">
          <p className="text-winshirt-purple-light text-sm font-medium">
            Félicitations ! Vous bénéficiez de la livraison standard gratuite.
          </p>
        </div>
      )}
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={onChange}
        className="space-y-3"
      >
        {shippingMethods.map((method) => (
          <div 
            key={method.id}
            className="border border-winshirt-purple/20 rounded-lg p-4 hover:bg-winshirt-space-light transition-colors cursor-pointer"
            onClick={() => onChange(method.id)}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem 
                value={method.id} 
                id={method.id}
                className="text-winshirt-purple"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Label 
                    htmlFor={method.id} 
                    className="text-white font-medium flex items-center gap-2 cursor-pointer"
                  >
                    {method.icon}
                    {method.name}
                  </Label>
                  <span className="text-winshirt-purple-light font-medium">
                    {method.price === 0 ? 'Gratuit' : `${method.price.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-400 text-sm">{method.description}</p>
                  <p className="text-gray-400 text-sm">Réception sous {method.estimatedDays}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ShippingOptions;

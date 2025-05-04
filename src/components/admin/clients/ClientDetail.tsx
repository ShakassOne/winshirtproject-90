import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Award, 
  Trophy, 
  X 
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onClose }) => {
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

  // Helper function to ensure we only render strings, not objects
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Helper function to extract address from potentially complex address object
  const extractAddressString = (addressData: any): string => {
    if (addressData === null || addressData === undefined) return '';
    if (typeof addressData === 'string') return addressData;
    if (typeof addressData === 'object') {
      // Handle case where address is an object with an 'address' property
      if (addressData.address && typeof addressData.address === 'string') {
        return addressData.address;
      }
      // Otherwise convert the whole object to a string
      return JSON.stringify(addressData);
    }
    return String(addressData);
  };

  return (
    <Card className="winshirt-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <User size={24} className="text-winshirt-purple-light" />
          Fiche client
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations personnelles */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-winshirt-blue-light mb-4">
              Informations personnelles
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Nom</p>
                  <p className="text-white text-lg font-medium">{ensureString(client.name)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white text-lg">{ensureString(client.email)}</p>
                </div>
              </div>
              
              {client.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <p className="text-white text-lg">{ensureString(client.phone)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Adresse */}
          {(client.address || client.city || client.postalCode || client.country) && (
            <div>
              <h3 className="text-xl font-semibold text-winshirt-purple-light mb-4">
                Adresse
              </h3>
              
              <div className="space-y-4">
                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Adresse</p>
                      <p className="text-white text-lg">{extractAddressString(client.address)}</p>
                    </div>
                  </div>
                )}
                
                {(client.city || client.postalCode || client.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 opacity-0" />
                    <div>
                      <p className="text-white text-lg">
                        {client.postalCode && `${ensureString(client.postalCode)} `}
                        {client.city && `${ensureString(client.city)}`}
                        {client.city && client.country && ', '}
                        {client.country && `${ensureString(client.country)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Activité */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-winshirt-blue-light mb-4">
              Activité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Date d'inscription</p>
                  <p className="text-white text-lg">{formatDate(client.registrationDate)}</p>
                </div>
              </div>
              
              {client.lastLogin && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Dernière connexion</p>
                    <p className="text-white text-lg">{formatDate(client.lastLogin)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Commandes</p>
                  <p className="text-white text-lg">{client.orderCount} commandes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Montant total dépensé</p>
                  <p className="text-white text-lg font-medium">
                    {client.totalSpent !== undefined ? `${client.totalSpent.toFixed(2)} €` : '0.00 €'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loteries */}
          <div>
            <h3 className="text-xl font-semibold text-winshirt-purple-light mb-4">
              Participation aux loteries
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Award size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Participations</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.participatedLotteries && client.participatedLotteries.length > 0 ? (
                      client.participatedLotteries.map(lotteryId => (
                        <Badge key={lotteryId} className="bg-winshirt-blue/20 text-winshirt-blue-light">
                          Loterie #{lotteryId}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">Aucune participation</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trophy size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Loteries gagnées</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.wonLotteries && client.wonLotteries.length > 0 ? (
                      client.wonLotteries.map(lotteryId => (
                        <Badge key={lotteryId} className="bg-green-600/20 text-green-400">
                          Loterie #{lotteryId}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">Aucune loterie gagnée</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClientDetail;

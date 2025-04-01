
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Building, Globe } from 'lucide-react';
import { Client } from '@/types/client';
import { useForm } from 'react-hook-form';

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const isEditing = !!client;
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      city: client?.city || '',
      postalCode: client?.postalCode || '',
      country: client?.country || 'France',
    }
  });
  
  const onSubmit = (data: any) => {
    const clientData = {
      ...data,
      id: client?.id || 0,
      registrationDate: client?.registrationDate || new Date().toISOString(),
      lastLogin: client?.lastLogin || null,
      orderCount: client?.orderCount || 0,
      totalSpent: client?.totalSpent || 0,
      participatedLotteries: client?.participatedLotteries || [],
      wonLotteries: client?.wonLotteries || []
    };
    
    onSave(clientData as Client);
  };
  
  return (
    <Card className="winshirt-card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isEditing ? "Modifier le client" : "Ajouter un client"}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-winshirt-blue-light flex items-center gap-2">
              <User size={18} />
              Informations personnelles
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  {...register('name', { required: "Le nom est obligatoire" })}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: "L'email est obligatoire",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Format d'email invalide"
                    }
                  })}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
          </div>
          
          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-winshirt-purple-light flex items-center gap-2">
              <MapPin size={18} />
              Adresse
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  {...register('country')}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-winshirt-purple/20">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-winshirt-purple/30"
          >
            Annuler
          </Button>
          <Button type="submit" className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ClientForm;

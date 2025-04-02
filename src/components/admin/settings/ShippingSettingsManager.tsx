
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Truck, Save, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useForm } from 'react-hook-form';
import { AdminSettings } from '@/types/order';

const ShippingSettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<AdminSettings['deliverySettings']>({
    defaultValues: {
      freeShippingThreshold: 50,
      defaultShippingRates: {
        national: {
          standard: 5.99,
          express: 9.99
        },
        international: {
          standard: 15.99,
          express: 29.99
        }
      },
      defaultCarriers: ['Chronopost', 'Colissimo', 'Mondial Relay'],
      defaultHandlingTime: 1,
      internationalShipping: true
    }
  });
  
  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem('admin_shipping_settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        form.reset(parsedSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres de livraison:", error);
      }
    }
  }, [form]);
  
  const onSubmit = (data: AdminSettings['deliverySettings']) => {
    setLoading(true);
    
    try {
      // Sauvegarder les paramètres dans localStorage
      localStorage.setItem('admin_shipping_settings', JSON.stringify(data));
      
      // Si vous aviez des emails configurés, vous pourriez envoyer un test ici
      const notificationEmails = getNotificationEmails();
      if (notificationEmails.length > 0) {
        // Simuler l'envoi d'un email de test
        console.log(`Envoi d'un email de test aux destinataires: ${notificationEmails.join(', ')}`);
        
        // Dans un environnement réel, vous utiliseriez Supabase Edge Functions ou un service similaire
        setTimeout(() => {
          toast.success("Paramètres de livraison sauvegardés");
          toast.success("Email de test envoyé avec succès");
          setLoading(false);
        }, 1000);
      } else {
        toast.success("Paramètres de livraison sauvegardés");
        toast.warning("Aucune adresse email configurée pour recevoir les notifications");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
      setLoading(false);
    }
  };
  
  const getNotificationEmails = (): string[] => {
    const storedEmails = localStorage.getItem('admin_notification_emails');
    if (storedEmails) {
      try {
        return JSON.parse(storedEmails);
      } catch (error) {
        return [];
      }
    }
    return [];
  };
  
  const sendTestEmail = () => {
    const notificationEmails = getNotificationEmails();
    
    if (notificationEmails.length === 0) {
      toast.error("Aucune adresse email configurée pour recevoir les notifications");
      return;
    }
    
    setLoading(true);
    
    // Simuler l'envoi d'un email de test
    setTimeout(() => {
      toast.success(`Email de test envoyé à ${notificationEmails.join(', ')}`);
      setLoading(false);
    }, 1500);
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Paramètres de livraison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Paramètres généraux</h3>
              
              <FormField
                control={form.control}
                name="freeShippingThreshold"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Seuil de livraison gratuite (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultHandlingTime"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Temps de préparation (jours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="internationalShipping"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-gray-300">Livraison internationale</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Tarifs nationaux</h3>
              
              <FormField
                control={form.control}
                name="defaultShippingRates.national.standard"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Livraison standard (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultShippingRates.national.express"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Livraison express (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Tarifs internationaux</h3>
              
              <FormField
                control={form.control}
                name="defaultShippingRates.international.standard"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Livraison standard internationale (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultShippingRates.international.express"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 items-center gap-4">
                    <FormLabel className="text-gray-300">Livraison express internationale (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={sendTestEmail}
                disabled={loading}
                className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Envoyer un email de test
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ShippingSettingsManager;

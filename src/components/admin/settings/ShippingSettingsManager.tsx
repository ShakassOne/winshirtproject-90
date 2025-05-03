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
import { EmailService } from '@/lib/emailService';

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
      
      // Envoyer notification aux emails configurés
      const notificationEmails = getNotificationEmails();
      if (notificationEmails.length > 0) {
        // Utiliser EmailService pour envoyer une notification
        EmailService.sendTestEmail(
          notificationEmails,
          "Paramètres de livraison mis à jour",
          `Les paramètres de livraison ont été mis à jour.\n\nLivraison gratuite à partir de: ${data.freeShippingThreshold}€\nTemps de préparation: ${data.defaultHandlingTime} jour(s)\nLivraison internationale: ${data.internationalShipping ? 'Activée' : 'Désactivée'}`
        );
        
        setTimeout(() => {
          toast.success("Paramètres de livraison sauvegardés");
          toast.success("Email de notification envoyé avec succès");
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
    
    // Utiliser EmailService avec la nouvelle signature
    const formData = form.getValues();
    EmailService.sendTestEmail(
      notificationEmails,
      "Test de notification de livraison",
      `Ceci est un email de test des paramètres de livraison.\n\nParamètres actuels:\nLivraison gratuite à partir de: ${formData.freeShippingThreshold}€\nTemps de préparation: ${formData.defaultHandlingTime} jour(s)\nLivraison internationale: ${formData.internationalShipping ? 'Activée' : 'Désactivée'}`
    ).then(success => {
      setTimeout(() => {
        if (success) {
          toast.success(`Email de test envoyé à ${notificationEmails.length} destinataire(s)`);
        } else {
          toast.error("Erreur lors de l'envoi de l'email de test");
        }
        setLoading(false);
      }, 1500);
    });
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

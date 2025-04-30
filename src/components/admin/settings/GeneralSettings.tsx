
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  cleanupAllTestData, 
  deleteAllClients, 
  deleteAllOrders, 
  resetLotteryParticipants 
} from '@/utils/cleanupUtils';
import { toast } from '@/lib/toast';

const GeneralSettings = () => {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load settings from localStorage
  const [settings, setSettings] = useState({
    siteTitle: localStorage.getItem('site_title') || 'WinShirt',
    autoSave: localStorage.getItem('auto_save') === 'true',
    darkMode: localStorage.getItem('dark_mode') === 'true',
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key === 'siteTitle' ? 'site_title' : key === 'autoSave' ? 'auto_save' : 'dark_mode', value.toString());
    toast.success(`Paramètre "${key}" mis à jour`, { position: "bottom-right" });
  };

  const handleCleanupData = (type: 'all' | 'clients' | 'orders' | 'lotteries') => {
    setIsDeleting(true);
    
    setTimeout(() => {
      try {
        if (type === 'all') {
          cleanupAllTestData();
          toast.success("Toutes les données de test ont été supprimées", { position: "bottom-right" });
        } else if (type === 'clients') {
          deleteAllClients();
          toast.success("Tous les clients ont été supprimés", { position: "bottom-right" });
        } else if (type === 'orders') {
          deleteAllOrders();
          toast.success("Toutes les commandes ont été supprimées", { position: "bottom-right" });
        } else if (type === 'lotteries') {
          resetLotteryParticipants();
          toast.success("Les compteurs de participants aux loteries ont été réinitialisés", { position: "bottom-right" });
        }
      } catch (error) {
        console.error("Error during data cleanup:", error);
        toast.error("Erreur lors du nettoyage des données", { position: "bottom-right" });
      } finally {
        setIsDeleting(false);
      }
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Généraux</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-title">Titre du site</Label>
            <Input
              id="site-title"
              value={settings.siteTitle}
              onChange={(e) => handleSettingChange('siteTitle', e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">Sauvegarde automatique</Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Mode sombre</Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
        </div>

        <Separator className="my-4" />
        
        <div>
          <Button 
            variant="outline" 
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="w-full"
          >
            {showDangerZone ? "Masquer" : "Afficher"} la zone de danger
          </Button>
          
          {showDangerZone && (
            <div className="mt-4 space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Les actions ci-dessous sont destructives et ne peuvent pas être annulées.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  variant="destructive" 
                  onClick={() => handleCleanupData('clients')}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer tous les clients
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={() => handleCleanupData('orders')}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer toutes les commandes
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={() => handleCleanupData('lotteries')}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réinitialiser compteurs loteries
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={() => handleCleanupData('all')}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Tout nettoyer
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;

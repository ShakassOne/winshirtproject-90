
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import { 
  clearLocalStorage, 
  toggleDevMode, 
  isDevModeEnabled 
} from '@/lib/syncManager';
import { checkSupabaseConnectionWithDetails } from '@/lib/syncManager';

const AdvancedSettings: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
    status?: number;
  } | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Check dev mode status on load
    setDevMode(isDevModeEnabled());
  }, []);

  const handleClearStorage = async () => {
    try {
      setIsClearing(true);
      await clearLocalStorage();
      toast.success("Stockage local effacé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'effacement du stockage local");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      setIsTesting(true);
      setConnectionStatus(null);
      const result = await checkSupabaseConnectionWithDetails();
      setConnectionStatus(result);
      
      if (result.connected) {
        toast.success("Connexion Supabase établie avec succès");
      } else {
        toast.error(`Erreur de connexion Supabase: ${result.error}`);
      }
    } catch (error) {
      toast.error("Erreur lors du test de connexion");
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDevModeToggle = (enabled: boolean) => {
    setDevMode(enabled);
    toggleDevMode(enabled);
  };

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle>Paramètres avancés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Stockage local</h3>
              <p className="text-sm text-gray-400">Effacer toutes les données stockées localement</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClearStorage}
              disabled={isClearing}
              className="flex gap-2 items-center"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Effacement...' : 'Effacer'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Connexion Supabase</h3>
              <p className="text-sm text-gray-400">
                Tester la connexion à Supabase
              </p>
              {connectionStatus && (
                <div className={`mt-2 text-sm ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connectionStatus.connected 
                    ? 'Connecté avec succès' 
                    : `Erreur: ${connectionStatus.error || 'Inconnu'} ${connectionStatus.status ? `(Code: ${connectionStatus.status})` : ''}`}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={testSupabaseConnection}
              disabled={isTesting}
              className="flex gap-2 items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Test...' : 'Tester'}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div>
              <h3 className="text-lg font-medium">Mode développement</h3>
              <p className="text-sm text-gray-400">
                Activer pour ignorer l'authentification lors des synchronisations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="dev-mode"
                checked={devMode}
                onCheckedChange={handleDevModeToggle}
              />
              <Label htmlFor="dev-mode">{devMode ? 'Activé' : 'Désactivé'}</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettings;

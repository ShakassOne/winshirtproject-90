
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { FtpConfig, getDefaultFtpConfig } from '@/lib/supabase';

const FtpSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FtpConfig>(getDefaultFtpConfig());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Placeholder for API call to load FTP config
      // For now using default config
      setConfig(getDefaultFtpConfig());
    } catch (error) {
      console.error('Failed to load FTP config', error);
      toast.error('Erreur lors du chargement de la configuration FTP');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FtpConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      // Placeholder for API call to test the FTP connection
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulate delay
      
      const success = Math.random() > 0.5; // For demo purposes
      setTestResult({
        success,
        message: success
          ? 'Connexion FTP établie avec succès'
          : 'Impossible de se connecter au serveur FTP. Vérifiez vos paramètres.'
      });
      
      if (success) {
        toast.success('La connexion FTP fonctionne !');
      } else {
        toast.error('La connexion FTP a échoué.');
      }
    } catch (error) {
      console.error('FTP test failed', error);
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      });
      toast.error('Erreur lors du test de connexion');
    } finally {
      setTestingConnection(false);
    }
  };

  const saveFtpConfig = async () => {
    setSaving(true);
    try {
      // Placeholder for API call to save FTP config
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay
      toast.success('Configuration FTP sauvegardée');
    } catch (error) {
      console.error('Failed to save FTP config', error);
      toast.error('Erreur lors de la sauvegarde de la configuration FTP');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="winshirt-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-winshirt-purple" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex justify-between items-center">
          <span>Paramètres FTP</span>
          <Switch
            checked={config.enabled}
            onCheckedChange={value => handleInputChange('enabled', value)}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="host" className="text-white">Serveur FTP</Label>
            <Input
              id="host"
              placeholder="ftp.example.com"
              value={config.host}
              onChange={e => handleInputChange('host', e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="port" className="text-white">Port</Label>
            <Input
              id="port"
              type="number"
              placeholder="21"
              value={config.port}
              onChange={e => handleInputChange('port', parseInt(e.target.value) || 21)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="username" className="text-white">Nom d'utilisateur</Label>
            <Input
              id="username"
              placeholder="username"
              value={config.username}
              onChange={e => handleInputChange('username', e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-white">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={e => handleInputChange('password', e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="basePath" className="text-white">Chemin de base</Label>
            <Input
              id="basePath"
              placeholder="/public_html/"
              value={config.basePath}
              onChange={e => handleInputChange('basePath', e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
            <p className="text-gray-400 text-sm mt-1">
              Le chemin sur le serveur FTP où les fichiers seront uploadés
            </p>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="baseUrl" className="text-white">URL de base</Label>
            <Input
              id="baseUrl"
              placeholder="https://example.com/uploads/"
              value={config.baseUrl}
              onChange={e => handleInputChange('baseUrl', e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
            />
            <p className="text-gray-400 text-sm mt-1">
              L'URL publique qui correspond au chemin de base FTP
            </p>
          </div>
          
          <div className="flex items-center justify-between md:col-span-2">
            <Label htmlFor="secure" className="text-white">
              Utiliser FTPS (connexion sécurisée)
            </Label>
            <Switch
              id="secure"
              checked={config.secure}
              onCheckedChange={checked => handleInputChange('secure', checked)}
            />
          </div>
        </div>
        
        {testResult && (
          <div className={`p-4 mt-4 rounded-md ${testResult.success ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'}`}>
            {testResult.message}
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 mt-6">
          <Button 
            variant="outline" 
            className="bg-winshirt-purple/5 border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
            disabled={testingConnection || !config.host || !config.username || !config.password}
            onClick={testConnection}
          >
            {testingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              'Tester la connexion'
            )}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="justify-end">
        <Button 
          onClick={saveFtpConfig} 
          disabled={saving}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les paramètres'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FtpSettingsManager;

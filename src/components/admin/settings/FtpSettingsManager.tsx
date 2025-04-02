
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, Server, Globe, Save } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ftpConfig } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const FtpSettingsManager: React.FC = () => {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      enabled: ftpConfig.enabled,
      uploadEndpoint: ftpConfig.uploadEndpoint,
      baseUrl: ftpConfig.baseUrl
    }
  });

  // Chargement des paramètres depuis le localStorage
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('ftpSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          form.reset(settings);
        } catch (error) {
          console.error("Erreur lors du chargement des paramètres FTP:", error);
        }
      }
    };

    loadSettings();
  }, [form]);

  // Sauvegarde des paramètres
  const handleSaveSettings = (data: any) => {
    try {
      // Sauvegarder les paramètres dans localStorage
      localStorage.setItem('ftpSettings', JSON.stringify(data));
      
      // Mettre à jour la configuration globale
      Object.assign(ftpConfig, data);
      
      toast.success("Paramètres FTP sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres FTP:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
    }
  };

  // Test d'upload FTP
  const handleTestUpload = async () => {
    if (!testFile) {
      toast.error("Veuillez sélectionner un fichier à tester");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('folder', 'test');

      const uploadEndpoint = form.getValues('uploadEndpoint');

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const baseUrl = form.getValues('baseUrl');
      const imageUrl = `${baseUrl}/test/${result.filename}`;
      
      setTestResult(imageUrl);
      toast.success("Test d'upload réussi!");
    } catch (error) {
      console.error("Erreur lors du test d'upload:", error);
      toast.error(`Erreur de test: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Gestion des uploads d'images
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-100">
            Ces paramètres seront utilisés lorsque vous serez connecté sur winshirt.fr. 
            En attendant, les images sont stockées temporairement.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-winshirt-purple/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white text-lg">Activer l'upload FTP</FormLabel>
                    <FormDescription className="text-gray-400">
                      Activer pour utiliser l'upload FTP au lieu de Supabase
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="uploadEndpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Server className="h-4 w-4" /> API endpoint d'upload
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="/api/upload" 
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      URL de l'API d'upload sur votre serveur
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Globe className="h-4 w-4" /> URL de base des images
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://winshirt.fr/images" 
                        className="bg-winshirt-space-light border-winshirt-purple/30"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      URL racine pour accéder aux images
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="border border-winshirt-purple/20 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-white">Test d'upload FTP</h3>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  onChange={(e) => e.target.files && setTestFile(e.target.files[0])}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
                <Button 
                  type="button" 
                  onClick={handleTestUpload}
                  disabled={testLoading}
                  className="bg-winshirt-blue"
                >
                  Tester
                </Button>
              </div>
              
              {testResult && (
                <div className="mt-4 space-y-2">
                  <p className="text-green-400">Image uploadée avec succès:</p>
                  <div className="border border-winshirt-purple/20 rounded-lg p-2">
                    <p className="text-sm text-gray-300 break-all">{testResult}</p>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <img 
                      src={testResult} 
                      alt="Test upload" 
                      className="max-h-full object-contain" 
                      onError={() => toast.error("Impossible de charger l'image - vérifiez l'URL")}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-winshirt-purple">
                <Save className="h-4 w-4 mr-2" /> Enregistrer les paramètres
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FtpSettingsManager;

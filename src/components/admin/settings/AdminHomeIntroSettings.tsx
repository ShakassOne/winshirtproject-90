
import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

const AdminHomeIntroSettings: React.FC = () => {
  const { homeIntroSettings, saveHomeIntroSettings, isSaving, isLoading } = useSiteSettings();
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (homeIntroSettings) {
      setTitle(homeIntroSettings.title);
      setSubtitle(homeIntroSettings.subtitle);
      setDescription(homeIntroSettings.description);
    }
  }, [homeIntroSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings = {
      title,
      subtitle,
      description
    };
    
    await saveHomeIntroSettings(updatedSettings);
  };

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white">Paramètres de la page d'accueil</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm text-gray-300">
                Titre principal
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre principal de la page d'accueil"
                className="bg-gray-800/50 border border-gray-700 placeholder:text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subtitle" className="text-sm text-gray-300">
                Sous-titre
              </label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Sous-titre de la page d'accueil"
                className="bg-gray-800/50 border border-gray-700 placeholder:text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm text-gray-300">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la page d'accueil"
                rows={4}
                className="bg-gray-800/50 border border-gray-700 placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminHomeIntroSettings;


import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Home, Edit, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const AdminHomeIntroSettings = () => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    homeIntroSettings, 
    saveHomeIntroSettings, 
    loadHomeIntroSettings,
    isSaving, 
    isLoading 
  } = useSiteSettings();
  
  // Charger les paramètres au montage du composant
  useEffect(() => {
    setTitle(homeIntroSettings.title);
    setSubtitle(homeIntroSettings.subtitle);
    setDescription(homeIntroSettings.description);
  }, [homeIntroSettings]);

  const handleSave = async () => {
    const success = await saveHomeIntroSettings({
      title,
      subtitle,
      description
    });

    if (success) {
      setIsEditing(false);
      // Recharger les paramètres pour s'assurer que tout est à jour
      await loadHomeIntroSettings();
    }
  };

  return (
    <Card className="winshirt-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Home className="h-5 w-5" />
          Paramètres de la page d'accueil
        </CardTitle>
        <Button
          variant={isEditing ? "outline" : "secondary"}
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <>Annuler</>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Modifier
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Titre principal</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre principal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Sous-titre</label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Sous-titre"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Description"
              />
            </div>
            <Button
              className="flex items-center gap-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder les changements'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Titre principal</h3>
              <p className="text-gray-300">{title}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sous-titre</h3>
              <p className="text-gray-300">{subtitle}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Description</h3>
              <p className="text-gray-300">{description}</p>
            </div>
          </div>
        )}
        <div className="mt-4 p-4 bg-gray-800/50 rounded-md">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Aperçu</h3>
          <div className="p-4 border border-dashed border-gray-700 rounded-lg">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <h2 className="text-lg text-gray-400 mt-1">{subtitle}</h2>
            <p className="text-sm text-gray-400 mt-2">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminHomeIntroSettings;

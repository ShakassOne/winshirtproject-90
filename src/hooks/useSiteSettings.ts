
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { Json } from '@/integrations/supabase/types';

interface HomeIntroSettings {
  title: string;
  subtitle: string;
  description: string;
}

export const useSiteSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [homeIntroSettings, setHomeIntroSettings] = useState<HomeIntroSettings>({
    title: 'Changer le monde avec des vêtements',
    subtitle: 'Gagnez des produits exclusifs et soutenez des causes qui comptent',
    description: 'Participez à nos loteries pour gagner des vêtements uniques tout en soutenant des initiatives qui font la différence. Chaque ticket acheté est une chance de gagner et un geste pour la planète.'
  });

  useEffect(() => {
    loadHomeIntroSettings();
  }, []);

  const loadHomeIntroSettings = async () => {
    try {
      setIsLoading(true);
      
      // Essayer de récupérer depuis Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'home_intro')
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
        
        // Fallback sur localStorage si disponible
        const localSettings = localStorage.getItem('homeIntroSettings');
        if (localSettings) {
          setHomeIntroSettings(JSON.parse(localSettings));
        }
      } else if (data && data.value) {
        // Convertir de JSON à HomeIntroSettings
        setHomeIntroSettings(data.value as unknown as HomeIntroSettings);
        
        // Sauvegarder également dans localStorage pour fallback
        localStorage.setItem('homeIntroSettings', JSON.stringify(data.value));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHomeIntroSettings = async (settings: HomeIntroSettings) => {
    try {
      setIsSaving(true);
      
      // Sauvegarder dans localStorage pour fallback
      localStorage.setItem('homeIntroSettings', JSON.stringify(settings));
      
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          value: settings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'home_intro');

      if (error) {
        console.error('Erreur Supabase:', error);
        toast.warning('Paramètres sauvegardés localement (erreur de connexion Supabase)');
        return true; // Retourne quand même true car sauvegardé localement
      }
      
      toast.success('Paramètres sauvegardés avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    homeIntroSettings,
    saveHomeIntroSettings,
    loadHomeIntroSettings,
    isSaving,
    isLoading
  };
};


import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/lib/toast';

interface HomeIntroSettings {
  title: string;
  subtitle: string;
  description: string;
}

export const useSiteSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveHomeIntroSettings = async (settings: HomeIntroSettings) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          value: settings,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'home_intro');

      if (error) throw error;
      
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
    saveHomeIntroSettings,
    isSaving
  };
};

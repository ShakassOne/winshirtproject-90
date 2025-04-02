
import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service pour gérer l'upload des images
export const uploadImage = async (file: File, bucket: string = 'products'): Promise<string | null> => {
  try {
    // Créer un nom de fichier unique basé sur la date et le nom original
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    // Upload du fichier vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }

    // Récupérer l'URL publique de l'image
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return null;
  }
};


import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de la présence des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Les variables d'environnement Supabase ne sont pas définies!");
  console.log("Pour utiliser Supabase, vous devez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY");
}

// Création du client Supabase avec une URL et clé par défaut pour développement
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-development-only'
);

// Fonction modifiée pour gérer l'absence de connexion à Supabase
export const uploadImage = async (file: File, bucket: string = 'products'): Promise<string | null> => {
  try {
    // Vérifier si les identifiants Supabase sont disponibles
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Erreur: Impossible d'uploader l'image - identifiants Supabase manquants");
      return null;
    }
    
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

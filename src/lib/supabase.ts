
import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de la présence des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Les variables d'environnement Supabase ne sont pas définies!");
  console.log("Pour utiliser Supabase, vous devez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY");
}

// Fonction pour vérifier si Supabase est correctement configuré
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && 
           supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder-project.supabase.co' && 
           supabaseAnonKey !== 'placeholder-key-for-development-only');
};

// Création du client Supabase avec un timeout plus court pour éviter les longs délais
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-development-only',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (...args) => {
        // Définit un timeout plus court pour éviter les longs délais
        const controller = new AbortController();
        const { signal } = controller;
        
        // Timeout de 5 secondes
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // @ts-ignore
        return fetch(...args, { signal })
          .finally(() => clearTimeout(timeoutId));
      }
    }
  }
);

// Configuration pour le serveur FTP
export const ftpConfig = {
  // Ces valeurs seront remplies lors de la mise en production
  enabled: false, // À activer quand on se connectera à winshirt.fr
  uploadEndpoint: '/api/upload', // Endpoint de l'API pour l'upload FTP
  baseUrl: 'https://winshirt.fr/images', // URL de base pour les images sur FTP
};

// Fonction pour déterminer si on utilise FTP ou Supabase
export const shouldUseFTP = (): boolean => {
  return ftpConfig.enabled;
};

// Fonction pour gérer l'upload d'images (Supabase ou FTP)
export const uploadImage = async (file: File, bucket: string = 'products'): Promise<string | null> => {
  try {
    // Si FTP est activé, utiliser l'upload FTP
    if (shouldUseFTP()) {
      return await uploadImageToFTP(file, bucket);
    }
    
    // Sinon, utiliser Supabase Storage
    // Vérifier si les identifiants Supabase sont disponibles
    if (!isSupabaseConfigured()) {
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
      console.error('Erreur lors de l\'upload vers Supabase:', error);
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

// Fonction pour uploader une image vers le serveur FTP via une API
export const uploadImageToFTP = async (file: File, folder: string = 'products'): Promise<string | null> => {
  try {
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Envoyer la requête au serveur
    const response = await fetch(ftpConfig.uploadEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de l'upload FTP: ${errorText}`);
      return null;
    }

    // Récupérer l'URL de l'image uploadée
    const result = await response.json();
    
    // Renvoyer l'URL complète
    return `${ftpConfig.baseUrl}/${folder}/${result.filename}`;
  } catch (error) {
    console.error('Erreur lors de l\'upload FTP:', error);
    return null;
  }
};

// Gestion des configurations du site
export type SlideType = {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  textColor: string;
  order: number;
};

export type HomeIntroConfig = {
  slides: SlideType[];
  transitionTime: number;
  showButtons: boolean;
  showIndicators: boolean;
  autoPlay: boolean;
};

// Fonction pour récupérer la configuration de l'intro de la page d'accueil
export const getHomeIntroConfig = async (): Promise<HomeIntroConfig | null> => {
  try {
    if (isSupabaseConfigured()) {
      // Essayer de récupérer depuis Supabase
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .eq('name', 'home_intro')
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération de la configuration:", error);
        // Fallback au localStorage
        return getHomeIntroConfigFromLocalStorage();
      }
      
      return data?.value || getDefaultHomeIntroConfig();
    } else {
      // Fallback au localStorage si Supabase n'est pas configuré
      return getHomeIntroConfigFromLocalStorage();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration:", error);
    return getHomeIntroConfigFromLocalStorage();
  }
};

// Fonction pour enregistrer la configuration de l'intro
export const saveHomeIntroConfig = async (config: HomeIntroConfig): Promise<boolean> => {
  try {
    // Sauvegarder dans localStorage pour fallback
    localStorage.setItem('home_intro_config', JSON.stringify(config));
    
    if (isSupabaseConfigured()) {
      // Essayer de sauvegarder dans Supabase
      const { error } = await supabase
        .from('configurations')
        .upsert({ name: 'home_intro', value: config }, { onConflict: 'name' });
      
      if (error) {
        console.error("Erreur lors de la sauvegarde de la configuration:", error);
        return false;
      }
      
      return true;
    } else {
      // Si Supabase n'est pas configuré, confirmer que localStorage a fonctionné
      return true;
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la configuration:", error);
    return false;
  }
};

// Fonction helper pour récupérer depuis localStorage
const getHomeIntroConfigFromLocalStorage = (): HomeIntroConfig => {
  try {
    const config = localStorage.getItem('home_intro_config');
    if (config) {
      return JSON.parse(config);
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du localStorage:", error);
  }
  
  return getDefaultHomeIntroConfig();
};

// Configuration par défaut de l'intro
export const getDefaultHomeIntroConfig = (): HomeIntroConfig => {
  return {
    slides: [
      {
        id: 1,
        title: "Achetez des vêtements, Gagnez des cadeaux incroyables",
        subtitle: "WinShirt révolutionne le shopping en ligne. Achetez nos vêtements de qualité et participez automatiquement à nos loteries exclusives pour gagner des prix exceptionnels.",
        buttonText: "Voir les produits",
        buttonLink: "/products",
        backgroundImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
        textColor: "#FFFFFF",
        order: 1
      },
      {
        id: 2,
        title: "Des loteries exclusives",
        subtitle: "Participez à nos loteries et tentez de gagner des prix exceptionnels.",
        buttonText: "Voir les loteries",
        buttonLink: "/lotteries",
        backgroundImage: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
        textColor: "#FFFFFF",
        order: 2
      }
    ],
    transitionTime: 5000,
    showButtons: true,
    showIndicators: true,
    autoPlay: true
  };
};

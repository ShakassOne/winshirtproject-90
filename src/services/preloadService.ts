
import { getLotteries } from "./lotteryService";
import { fetchProducts } from "./productService";
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

/**
 * Précharge toutes les données nécessaires au démarrage de l'application
 */
export const preloadAllData = async () => {
  try {
    console.log("Préchargement des données...");
    
    // Vérifier la connexion Supabase
    try {
      const { data, error } = await supabase.from('lotteries').select('count()', { count: 'exact' });
      if (!error) {
        console.log("Connexion Supabase établie, données disponibles");
      }
    } catch (e) {
      console.warn("Connexion à Supabase non disponible, utilisation des données locales");
    }
    
    // Précharger les loteries
    try {
      const lotteries = await getLotteries();
      console.log(`${lotteries.length} loteries chargées`);
    } catch (error) {
      console.error("Erreur lors du préchargement des loteries:", error);
    }
    
    // Précharger les produits
    try {
      const products = await fetchProducts();
      console.log(`${products.length} produits chargés`);
    } catch (error) {
      console.error("Erreur lors du préchargement des produits:", error);
    }
    
    console.log("Préchargement des données terminé");
  } catch (error) {
    console.error("Erreur lors du préchargement des données:", error);
  }
};

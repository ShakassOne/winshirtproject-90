import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchDataFromSupabase, syncLocalDataToSupabase, checkSupabaseConnection } from '@/lib/supabase';
import { mockProducts } from '@/data/mockData';
import { ValidTableName } from '@/integrations/supabase/client';
import { snakeToCamel, camelToSnake } from '@/lib/utils';

// Helper function to validate product data
const validateProductData = (product: Partial<ExtendedProduct>): string | null => {
  if (!product.name || product.name.trim() === '') return "Le nom du produit est requis";
  if (!product.price || isNaN(Number(product.price))) return "Le prix du produit est invalide";
  return null;
};

/**
 * Hook pour récupérer les produits avec gestion d'état (chargement, erreurs)
 */
export const useProducts = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log("productService: Chargement des produits...");
      
      // Essayer d'abord de récupérer depuis Supabase
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("productService: Produits récupérés depuis Supabase:", data.length);
          // Convertir les données de snake_case à camelCase
          const productsWithProperFormat = data.map(product => snakeToCamel(product)) as ExtendedProduct[];
          
          // S'assurer que chaque produit a un champ 'type'
          const productsWithType = productsWithProperFormat.map(product => ({
            ...product,
            type: product.type || product.productType || "standard",
            // Assurer que brand, material et autres champs facultatifs sont présents, même si null
            brand: product.brand || null,
            material: product.material || null,
            fit: product.fit || "regular",
            gender: product.gender || "unisexe"
          }));
          
          setProducts(productsWithType);
          localStorage.setItem('products', JSON.stringify(productsWithType));
          return;
        }
      }
      
      // Si aucun produit n'est trouvé dans Supabase, utiliser les données locales
      const localData = localStorage.getItem('products');
      if (localData) {
        const localProducts = JSON.parse(localData);
        if (Array.isArray(localProducts) && localProducts.length > 0) {
          console.log("productService: Produits récupérés depuis localStorage:", localProducts.length);
          
          // S'assurer que chaque produit a un champ 'type'
          const productsWithType = localProducts.map((product: any) => ({
            ...product,
            type: product.type || product.productType || "standard"
          })) as ExtendedProduct[];
          
          setProducts(productsWithType);
          
          // Tenter de synchroniser avec Supabase
          if (isConnected) {
            await syncLocalDataToSupabase('products');
          }
          return;
        }
      }
      
      // Si aucune donnée n'est trouvée, utiliser les données mock
      console.log("productService: Utilisation des données mock");
      // Préparation des données mock avec le type
      const preparedMockProducts = mockProducts.map(product => ({
        ...product,
        type: product.type || "standard"
      })) as ExtendedProduct[];
      
      setProducts(preparedMockProducts);
      localStorage.setItem('products', JSON.stringify(preparedMockProducts));
      
      // Tenter de synchroniser les données mock avec Supabase
      if (isConnected) {
        await syncLocalDataToSupabase('products');
      }
      
    } catch (err) {
      console.error("productService: Erreur lors du chargement des produits:", err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      toast.error("Impossible de charger les produits", { position: "bottom-right" });
      
      // En cas d'erreur, charger les données mock
      const preparedMockProducts = mockProducts.map(product => ({
        ...product,
        type: product.type || "standard"
      })) as ExtendedProduct[];
      
      setProducts(preparedMockProducts);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProducts();
  }, []);

  // Set up real-time subscription for products
  useEffect(() => {
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        async (payload) => {
          console.log("productService: Mise à jour en temps réel détectée", payload);
          await loadProducts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { 
    products, 
    loading, 
    error, 
    refreshProducts: loadProducts
  };
};

// Export function to sync products to Supabase
export const syncProductsToSupabase = async (): Promise<boolean> => {
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    toast.error("Impossible de synchroniser - Mode hors-ligne", { position: "bottom-right" });
    return false;
  }
  
  const tableName: ValidTableName = 'products';
  return await syncLocalDataToSupabase(tableName);
};

// Récupérer tous les produits
export const getAllProducts = async (): Promise<ExtendedProduct[]> => {
  try {
    return await fetchDataFromSupabase('products') as ExtendedProduct[];
  } catch (error) {
    console.error("productService: Erreur lors de la récupération des produits:", error);
    toast.error("Impossible de récupérer les produits", { position: "bottom-right" });
    return [];
  }
};

// Créer un produit avec validation et correction du format des données
export const createProduct = async (product: Omit<ExtendedProduct, 'id'>): Promise<ExtendedProduct | null> => {
  try {
    console.log("createProduct: Début de la création du produit", product);
    
    // Validate product data before proceeding
    const validationError = validateProductData(product);
    if (validationError) {
      toast.error(validationError, { position: "bottom-right" });
      return null;
    }
    
    const isConnected = await checkSupabaseConnection();
    
    // Assurer que les champs requis sont définis
    const productWithDefaults = {
      ...product,
      type: product.type || "standard",
      brand: product.brand || null,
      fit: product.fit || "regular",
      gender: product.gender || "unisexe",
      material: product.material || null
    };
    
    // Générer un ID pour le nouveau produit - Fix: use a smaller integer value
    // PostgreSQL integer has a max value of 2147483647, so ensure we stay below that
    const newProductId = Math.floor(Math.random() * 1000000) + 1; // Safe random integer ID
    const newProduct = { ...productWithDefaults, id: newProductId };
    
    if (isConnected) {
      // Si connecté à Supabase, essayer d'insérer directement
      console.log("createProduct: Tentative d'insertion dans Supabase");
      
      // Convertir en snake_case pour Supabase
      const productForSupabase = camelToSnake(newProduct);
      console.log("createProduct: Données converties pour Supabase:", productForSupabase);
      
      const { data, error } = await supabase
        .from('products')
        .insert([productForSupabase])
        .select();
      
      if (error) {
        console.error("productService: Erreur lors de la création du produit dans Supabase:", error);
        throw error;
      }
      
      // Conversion du résultat en format camelCase
      const createdProduct = data && data[0] ? snakeToCamel(data[0]) as ExtendedProduct : null;
      console.log("createProduct: Produit créé dans Supabase:", createdProduct);
      
      // Mettre à jour le stockage local pour garder la cohérence
      const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
      localStorage.setItem('products', JSON.stringify([...existingProducts, createdProduct]));
      
      toast.success("Produit créé avec succès", { position: "bottom-right" });
      return createdProduct;
    } else {
      // Mode hors-ligne: stocker uniquement dans localStorage
      console.log("createProduct: Mode hors-ligne, stockage local uniquement");
      const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
      localStorage.setItem('products', JSON.stringify([...existingProducts, newProduct]));
      
      toast.success("Produit créé localement (mode hors-ligne)", { position: "bottom-right" });
      return newProduct;
    }
  } catch (error) {
    console.error("productService: Erreur détaillée lors de la création du produit:", error);
    toast.error(`Erreur lors de la création du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const updateProduct = async (product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  try {
    console.log("updateProduct: Début de la mise à jour du produit", product);
    
    // Validate product data before proceeding
    const validationError = validateProductData(product);
    if (validationError) {
      toast.error(validationError, { position: "bottom-right" });
      return null;
    }
    
    const isConnected = await checkSupabaseConnection();
    
    // Assurer que les champs requis sont définis
    const productWithDefaults = {
      ...product,
      type: product.type || "standard",
      brand: product.brand || null,
      fit: product.fit || "regular",
      gender: product.gender || "unisexe",
      material: product.material || null
    };
    
    // Mettre à jour dans localStorage
    const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
    const updatedProducts = existingProducts.map((p: ExtendedProduct) => 
      p.id === productWithDefaults.id ? { ...p, ...productWithDefaults } : p
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    const updatedProduct = updatedProducts.find((p: ExtendedProduct) => p.id === productWithDefaults.id);
    
    if (isConnected) {
      // Mettre à jour dans Supabase
      console.log("updateProduct: Tentative de mise à jour dans Supabase");
      
      // Convertir en snake_case pour Supabase
      const productForSupabase = camelToSnake(productWithDefaults);
      console.log("updateProduct: Données converties pour Supabase:", productForSupabase);
      
      const { data, error } = await supabase
        .from('products')
        .update(productForSupabase)
        .eq('id', productWithDefaults.id)
        .select();
      
      if (error) {
        console.error("productService: Erreur lors de la mise à jour du produit dans Supabase:", error);
        toast.error(`Erreur lors de la mise à jour du produit: ${error.message}`, { position: "bottom-right" });
        return updatedProduct;
      }
      
      toast.success("Produit mis à jour avec succès", { position: "bottom-right" });
      return data && data[0] ? snakeToCamel(data[0]) as ExtendedProduct : updatedProduct;
    } else {
      toast.success("Produit mis à jour localement (mode hors-ligne)", { position: "bottom-right" });
      return updatedProduct;
    }
  } catch (error) {
    console.error("productService: Erreur détaillée lors de la mise à jour du produit:", error);
    toast.error(`Erreur lors de la mise à jour du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    console.log("deleteProduct: Suppression du produit", id);
    const isConnected = await checkSupabaseConnection();
    
    // Supprimer du localStorage
    const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
    const filteredProducts = existingProducts.filter((p: ExtendedProduct) => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    
    if (isConnected) {
      // Supprimer de Supabase
      console.log("deleteProduct: Tentative de suppression dans Supabase");
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("productService: Erreur lors de la suppression du produit dans Supabase:", error);
        toast.error(`Erreur lors de la suppression du produit: ${error.message}`, { position: "bottom-right" });
        return false;
      }
      
      toast.success("Produit supprimé avec succès", { position: "bottom-right" });
    } else {
      toast.success("Produit supprimé localement (mode hors-ligne)", { position: "bottom-right" });
    }
    
    return true;
  } catch (error) {
    console.error("productService: Erreur détaillée lors de la suppression du produit:", error);
    toast.error(`Erreur lors de la suppression du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Fonctions utilitaires pour la conversion de case
// Ces fonctions sont déjà définies dans lib/utils.ts, nous les utilisons ici directement


import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchDataFromSupabase, syncLocalDataToSupabase, checkSupabaseConnection } from '@/lib/supabase';
import { ValidTableName } from '@/integrations/supabase/client';

/**
 * Hook pour récupérer les produits avec gestion d'état (chargement, erreurs)
 */
export const useProducts = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        console.log("productService: Chargement des produits...");
        
        // Essayer d'abord de récupérer depuis Supabase
        const allProducts = await fetchDataFromSupabase('products') as ExtendedProduct[];
        
        if (allProducts && allProducts.length > 0) {
          console.log("productService: Produits récupérés depuis Supabase:", allProducts.length);
          setProducts(allProducts);
        } else {
          // Si aucun produit n'est trouvé dans Supabase, utiliser les données locales
          const localData = localStorage.getItem('products');
          if (localData) {
            const localProducts = JSON.parse(localData);
            console.log("productService: Produits récupérés depuis localStorage:", localProducts.length);
            setProducts(localProducts);
          } else {
            console.log("productService: Aucun produit trouvé");
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("productService: Erreur lors du chargement des produits:", err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        toast.error("Impossible de charger les produits", { position: "bottom-right" });
      } finally {
        setLoading(false);
      }
    };

    getProducts();

    // Set up real-time subscription for products
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        async (payload) => {
          console.log("productService: Mise à jour en temps réel détectée", payload);
          await getProducts();
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { 
    products, 
    loading, 
    error, 
    refreshProducts: async () => {
      setLoading(true);
      try {
        const allProducts = await fetchDataFromSupabase('products') as ExtendedProduct[];
        setProducts(allProducts);
        toast.success("Produits mis à jour", { position: "bottom-right" });
      } catch (err) {
        console.error("Erreur lors du rafraîchissement des produits:", err);
        toast.error("Erreur lors de la mise à jour des produits", { position: "bottom-right" });
      } finally {
        setLoading(false);
      }
    }
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

// Créer, mettre à jour ou supprimer un produit avec synchronisation Supabase
export const createProduct = async (product: Omit<ExtendedProduct, 'id'>): Promise<ExtendedProduct | null> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    // Générer un ID pour le nouveau produit
    const newProductId = Date.now();
    const newProduct = { ...product, id: newProductId };
    
    if (isConnected) {
      // Si connecté à Supabase, essayer d'insérer directement
      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          id: newProductId,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          secondary_image: product.secondaryImage,
          sizes: product.sizes,
          colors: product.colors,
          type: product.type,
          product_type: product.productType,
          sleeve_type: product.sleeveType,
          linked_lotteries: product.linkedLotteries || [],
          popularity: product.popularity || 0,
          tickets: product.tickets || 1,
          weight: product.weight,
          delivery_price: product.deliveryPrice,
          allow_customization: product.allowCustomization || false,
          default_visual_id: product.defaultVisualId,
          default_visual_settings: product.defaultVisualSettings,
          visual_category_id: product.visualCategoryId
        }])
        .select();
      
      if (error) {
        console.error("productService: Erreur lors de la création du produit:", error);
        throw error;
      }
      
      // Conversion du résultat en format camelCase
      const createdProduct = data && data[0] ? snakeToCamel(data[0]) as ExtendedProduct : null;
      
      // Mettre à jour le stockage local pour garder la cohérence
      const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
      localStorage.setItem('products', JSON.stringify([...existingProducts, createdProduct]));
      
      toast.success("Produit créé avec succès", { position: "bottom-right" });
      return createdProduct;
    } else {
      // Mode hors-ligne: stocker uniquement dans localStorage
      const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
      localStorage.setItem('products', JSON.stringify([...existingProducts, newProduct]));
      
      toast.success("Produit créé localement (mode hors-ligne)", { position: "bottom-right" });
      return newProduct;
    }
  } catch (error) {
    console.error("productService: Erreur lors de la création du produit:", error);
    toast.error(`Erreur lors de la création du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const updateProduct = async (id: number, productData: Partial<ExtendedProduct>): Promise<ExtendedProduct | null> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    // Mettre à jour dans localStorage
    const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
    const updatedProducts = existingProducts.map((p: ExtendedProduct) => 
      p.id === id ? { ...p, ...productData } : p
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    const updatedProduct = updatedProducts.find((p: ExtendedProduct) => p.id === id);
    
    if (isConnected) {
      // Mettre à jour dans Supabase
      const { data, error } = await supabase
        .from('products')
        .update(camelToSnake(productData))
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("productService: Erreur lors de la mise à jour du produit:", error);
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
    console.error("productService: Erreur lors de la mise à jour du produit:", error);
    toast.error(`Erreur lors de la mise à jour du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    // Supprimer du localStorage
    const existingProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')!) : [];
    const filteredProducts = existingProducts.filter((p: ExtendedProduct) => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    
    if (isConnected) {
      // Supprimer de Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("productService: Erreur lors de la suppression du produit:", error);
        toast.error(`Erreur lors de la suppression du produit: ${error.message}`, { position: "bottom-right" });
        return false;
      }
      
      toast.success("Produit supprimé avec succès", { position: "bottom-right" });
    } else {
      toast.success("Produit supprimé localement (mode hors-ligne)", { position: "bottom-right" });
    }
    
    return true;
  } catch (error) {
    console.error("productService: Erreur lors de la suppression du produit:", error);
    toast.error(`Erreur lors de la suppression du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Fonction utilitaire pour convertir de snake_case à camelCase
const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Fonction utilitaire pour convertir de camelCase à snake_case
const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

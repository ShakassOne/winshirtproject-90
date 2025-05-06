
import React from 'react';
import { ExtendedProduct } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import { appToSupabaseProduct, supabaseToAppProduct } from "@/lib/dataConverters";

export const useProducts = () => {
  const [products, setProducts] = React.useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Essayer d'abord de récupérer à partir de Supabase
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      
      // Convertir les données au format ExtendedProduct
      const extendedProducts = data.map((item) => supabaseToAppProduct(item));
      setProducts(extendedProducts);

      // Sauvegarder dans localStorage comme fallback
      localStorage.setItem('products', JSON.stringify(extendedProducts));
      
    } catch (err) {
      console.error("Erreur lors de la récupération des produits:", err);
      // Essayer de charger à partir du localStorage en cas d'échec
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    return fetchProducts();
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refreshProducts };
};

// Création d'un nouveau produit
export const createProduct = async (product: Omit<ExtendedProduct, 'id'>): Promise<ExtendedProduct> => {
  try {
    console.log('Création du produit:', product);
    
    // Convertir le produit au format Supabase
    const supabaseData = appToSupabaseProduct(product as ExtendedProduct);
    
    // Essayer d'abord de créer dans Supabase
    const { data, error } = await supabase
      .from('products')
      .insert([supabaseData])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase lors de la création:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée après création');
    }
    
    // Convertir en ExtendedProduct
    const createdProduct = supabaseToAppProduct(data);
    
    // Mise à jour du localStorage
    const storedProducts = localStorage.getItem('products');
    const products = storedProducts ? JSON.parse(storedProducts) : [];
    products.push(createdProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    toast.success(`Produit "${createdProduct.name}" créé avec succès`);
    return createdProduct;
    
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    
    // Fallback au localStorage
    const storedProducts = localStorage.getItem('products');
    let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: ExtendedProduct = {
      ...product,
      id: newId,
      participants: []
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    toast.success("Produit créé avec succès (stockage local seulement)");
    return newProduct;
  }
};

// Mise à jour d'un produit existant
export const updateProduct = async (id: number, product: ExtendedProduct): Promise<ExtendedProduct> => {
  try {
    // Mettre à jour dans localStorage d'abord pour fiabilité
    const storedProducts = localStorage.getItem('products');
    let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    products = products.map(p => p.id === id ? {...product, id} : p);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Mettre à jour dans Supabase si disponible
    if (supabase) {
      // Convertir au format Supabase
      const supabaseData = appToSupabaseProduct(product);
      
      const { data, error } = await supabase
        .from('products')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        // Continuer car localStorage est déjà mis à jour
      } else if (data) {
        // Succès Supabase
        toast.success(`Produit "${product.name}" mis à jour avec succès`);
        return supabaseToAppProduct(data);
      }
    }
    
    // Retourne le produit mis à jour en localStorage
    toast.success(`Produit "${product.name}" mis à jour avec succès (stockage local)`);
    return product;
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return product; // Retourne le produit original
  }
};

// Suppression d'un produit
export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    // Supprimer du localStorage d'abord
    const storedProducts = localStorage.getItem('products');
    let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Supprimer de Supabase si disponible
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        console.error('Erreur Supabase lors de la suppression:', error);
        // Continuer car localStorage est déjà mis à jour
      }
    }
    
    toast.success("Produit supprimé avec succès");
    return true;
    
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Synchronisation des produits avec Supabase
export const syncProductsToSupabase = async (): Promise<boolean> => {
  try {
    // Vérifier si Supabase est configuré
    if (!supabase) {
      toast.error("Synchronisation impossible - Supabase non configuré");
      return false;
    }
    
    // Récupérer les produits du localStorage
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts) {
      toast.warning("Aucun produit local à synchroniser");
      return false;
    }
    
    const products: ExtendedProduct[] = JSON.parse(storedProducts);
    if (products.length === 0) {
      toast.warning("Aucun produit trouvé");
      return false;
    }
    
    // Convertir les données pour Supabase
    const supabaseData = products.map(product => appToSupabaseProduct(product));
    
    // Upsert (insert or update)
    const { error } = await supabase
      .from('products')
      .upsert(supabaseData, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Erreur lors de la synchronisation:", error);
      throw error;
    }
    
    toast.success(`${products.length} produits synchronisés`);
    return true;
    
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

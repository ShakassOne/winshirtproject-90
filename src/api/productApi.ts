
import { ExtendedProduct } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { appToSupabaseProduct, supabaseToAppProduct } from "@/lib/dataConverters";

// Helper function to check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  return Boolean(supabase && supabase.auth);
};

// Helper function to save products to localStorage
const saveProductsToLocalStorage = (products: ExtendedProduct[]) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

// Function to get last ID from localStorage products
const getNextProductId = (products: ExtendedProduct[]): number => {
  if (products.length === 0) return 1;
  const maxId = Math.max(...products.map(product => product.id));
  return maxId + 1;
};

// Fonction pour récupérer tous les produits
export const fetchProducts = async (): Promise<ExtendedProduct[]> => {
  // Always use localStorage as fallback first
  const storedProducts = localStorage.getItem('products');
  let localProducts: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
  
  if (!isSupabaseConfigured()) {
    console.log('Supabase n\'est pas configuré. Utilisation du localStorage uniquement.');
    return localProducts;
  }

  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      // Return localStorage data on error
      return localProducts;
    }
    
    // Convertir les données au format ExtendedProduct
    if (data && data.length > 0) {
      const products: ExtendedProduct[] = data.map(item => supabaseToAppProduct(item));
      
      // Sauvegarder dans localStorage comme fallback
      saveProductsToLocalStorage(products);
      
      return products;
    } else {
      // If no data from Supabase, return localStorage data
      return localProducts;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    // Fallback au localStorage en cas d'erreur
    return localProducts;
  }
};

// Fonction pour créer un nouveau produit
export const createProduct = async (product: Omit<ExtendedProduct, 'id'>): Promise<ExtendedProduct | null> => {
  console.log('Création du produit:', product); // Debug
  
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedProducts = localStorage.getItem('products');
      const products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      const newId = getNextProductId(products);
      const newProduct: ExtendedProduct = {
        ...product,
        id: newId,
        participants: [] // Add empty participants array to fix the type error
      };
      
      products.push(newProduct);
      saveProductsToLocalStorage(products);
      
      toast.success("Produit créé avec succès (stockage local)");
      return newProduct;
    } catch (error) {
      console.error('Erreur lors de la création du produit en local:', error);
      toast.error("Erreur lors de la création du produit");
      return null;
    }
  }

  try {
    // Convert product to Supabase format
    const supabaseData = appToSupabaseProduct(product as ExtendedProduct);
    
    console.log('Données envoyées à Supabase:', supabaseData); // Debug
    
    // Try to create in Supabase
    const { data, error } = await supabase
      .from('products')
      .insert([supabaseData]) // Use array for insert
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase lors de la création:', error);
      
      // Create locally if Supabase fails
      const storedProducts = localStorage.getItem('products');
      const products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      const newId = getNextProductId(products);
      const newProduct: ExtendedProduct = {
        ...product,
        id: newId,
        participants: [] // Add empty participants array to fix the type error
      };
      
      products.push(newProduct);
      saveProductsToLocalStorage(products);
      
      toast.warning("Produit créé localement (échec de Supabase)");
      return newProduct;
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée après création');
    }
    
    console.log('Données reçues de Supabase après création:', data); // Debug
    
    // Convert to ExtendedProduct
    const createdProduct = supabaseToAppProduct(data);
    
    // Update local storage to include the new product
    const products = await fetchProducts();
    products.push(createdProduct);
    saveProductsToLocalStorage(products);
    
    toast.success(`Produit "${createdProduct.name}" créé avec succès`);
    return createdProduct;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // Fallback to localStorage if all else fails
    try {
      const storedProducts = localStorage.getItem('products');
      const products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      const newId = getNextProductId(products);
      const newProduct: ExtendedProduct = {
        ...product,
        id: newId,
        participants: [] // Add empty participants array to fix the type error
      };
      
      products.push(newProduct);
      saveProductsToLocalStorage(products);
      
      toast.warning("Produit créé localement suite à une erreur");
      return newProduct;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la création du produit");
      return null;
    }
  }
};

// Fonction pour mettre à jour un produit existant
export const updateProduct = async (id: number, product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  // Always update local storage first for reliability
  try {
    const storedProducts = localStorage.getItem('products');
    let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    
    products = products.map(p => p.id === id ? {...product, id} : p);
    saveProductsToLocalStorage(products);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du localStorage:', error);
  }
  
  // Si Supabase n'est pas configuré, utiliser localStorage uniquement
  if (!isSupabaseConfigured()) {
    toast.success("Produit mis à jour avec succès (stockage local uniquement)");
    return product;
  }

  try {
    // Convert to Supabase format
    const supabaseData = appToSupabaseProduct(product);
    
    // Try to update in Supabase
    const { data, error } = await supabase
      .from('products')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase lors de la mise à jour:', error);
      toast.warning("Produit mis à jour localement uniquement (échec de Supabase)");
      return product;
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée après mise à jour');
    }
    
    // Convert back to app format
    const updatedProduct = supabaseToAppProduct(data);
    
    toast.success(`Produit "${updatedProduct.name}" mis à jour avec succès`);
    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return product; // Return the original product since it's already in localStorage
  }
};

// Fonction pour supprimer un produit
export const deleteProduct = async (productId: number): Promise<boolean> => {
  // Always remove from localStorage first
  try {
    const storedProducts = localStorage.getItem('products');
    let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    
    products = products.filter(p => p.id !== productId);
    saveProductsToLocalStorage(products);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit en local:', error);
  }
  
  // Si Supabase n'est pas configuré, succès après localStorage
  if (!isSupabaseConfigured()) {
    toast.success("Produit supprimé avec succès (stockage local)");
    return true;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('Erreur lors de la suppression du produit dans Supabase:', error);
      toast.warning("Produit supprimé localement uniquement (échec de Supabase)");
      return true; // Still return true since we deleted from localStorage
    }
    
    toast.success("Produit supprimé avec succès");
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return true; // Still return true since we deleted from localStorage
  }
};

// Add function to sync products to Supabase
export const syncProductsToSupabase = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    toast.error("Synchronisation impossible - Mode hors-ligne");
    return false;
  }

  try {
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

    // Convert data for Supabase
    const supabaseData = products.map(product => appToSupabaseProduct(product));

    // Upsert (insert or update automatically)
    const { error } = await supabase
      .from('products')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });

    if (error) throw error;

    toast.success(`${products.length} produits synchronisés`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

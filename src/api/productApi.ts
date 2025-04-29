
import { ExtendedProduct } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { snakeToCamel, camelToSnake } from "@/lib/utils";

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
  if (!isSupabaseConfigured()) {
    console.log('Supabase n\'est pas configuré. Utilisation du localStorage uniquement.');
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    
    // Convertir les données au format ExtendedProduct
    const products: ExtendedProduct[] = data.map(item => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        secondaryImage: item.secondary_image,
        sizes: item.sizes || [],
        colors: item.colors || [],
        type: item.type || 'standard',
        productType: item.product_type,
        sleeveType: item.sleeve_type,
        linkedLotteries: item.linked_lotteries || [],
        popularity: item.popularity,
        tickets: item.tickets || 1,
        weight: item.weight,
        deliveryPrice: item.delivery_price,
        allowCustomization: item.allow_customization === true, // Conversion explicite en booléen
        defaultVisualId: item.default_visual_id,
        defaultVisualSettings: item.default_visual_settings,
        visualCategoryId: item.visual_category_id
      };
    });
    
    // Sauvegarder dans localStorage comme fallback
    saveProductsToLocalStorage(products);
    
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    toast.error("Erreur de connexion: utilisation des données locales");
    
    // Fallback au localStorage en cas d'erreur
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        return JSON.parse(storedProducts);
      } catch (e) {
        return [];
      }
    }
    return [];
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
        id: newId
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
    // Log des données converties pour debug
    const supabaseData = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      secondary_image: product.secondaryImage,
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType,
      sleeve_type: product.sleeveType,
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity || Math.random() * 100,
      tickets: product.tickets || 1,
      weight: product.weight,
      delivery_price: product.deliveryPrice,
      allow_customization: product.allowCustomization === true, // Conversion explicite en booléen
      default_visual_id: product.defaultVisualId,
      default_visual_settings: product.defaultVisualSettings,
      visual_category_id: product.visualCategoryId
    };
    
    console.log('Données envoyées à Supabase:', supabaseData); // Debug
    
    const { data, error } = await supabase
      .from('products')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase lors de la création:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée après création');
    }
    
    console.log('Données reçues de Supabase après création:', data); // Debug
    
    // Convertir au format ExtendedProduct
    const createdProduct: ExtendedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      secondaryImage: data.secondary_image,
      sizes: data.sizes || [],
      colors: data.colors || [],
      type: data.type || 'standard',
      productType: data.product_type,
      sleeveType: data.sleeve_type,
      linkedLotteries: data.linked_lotteries || [],
      popularity: data.popularity || 0,
      tickets: data.tickets || 1,
      weight: data.weight,
      deliveryPrice: data.delivery_price,
      allowCustomization: data.allow_customization === true, // Conversion explicite en booléen
      defaultVisualId: data.default_visual_id,
      defaultVisualSettings: data.default_visual_settings,
      visualCategoryId: data.visual_category_id
    };
    
    // Mettre à jour le localStorage pour la cohérence
    const products = await fetchProducts();
    products.push(createdProduct);
    saveProductsToLocalStorage(products);
    
    toast.success(`Produit "${createdProduct.name}" créé avec succès`);
    return createdProduct;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // Fallback au localStorage
    try {
      const storedProducts = localStorage.getItem('products');
      const products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      const newId = getNextProductId(products);
      const newProduct: ExtendedProduct = {
        ...product,
        id: newId
      };
      
      products.push(newProduct);
      saveProductsToLocalStorage(products);
      
      return newProduct;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la création du produit");
      return null;
    }
  }
};

// Fonction pour mettre à jour un produit existant
export const updateProduct = async (product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  console.log('Mise à jour du produit:', product); // Debug
  
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedProducts = localStorage.getItem('products');
      let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      products = products.map(p => p.id === product.id ? product : p);
      saveProductsToLocalStorage(products);
      
      toast.success("Produit mis à jour avec succès (stockage local)");
      return product;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit en local:', error);
      toast.error("Erreur lors de la mise à jour du produit");
      return null;
    }
  }

  try {
    const supabaseData = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      secondary_image: product.secondaryImage,
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType,
      sleeve_type: product.sleeveType,
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity,
      tickets: product.tickets || 1,
      weight: product.weight,
      delivery_price: product.deliveryPrice,
      allow_customization: product.allowCustomization === true, // Conversion explicite en booléen
      default_visual_id: product.defaultVisualId,
      default_visual_settings: product.defaultVisualSettings,
      visual_category_id: product.visualCategoryId
    };
    
    console.log('Données envoyées à Supabase pour mise à jour:', supabaseData); // Debug
    
    const { data, error } = await supabase
      .from('products')
      .update(supabaseData)
      .eq('id', product.id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur Supabase lors de la mise à jour:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée après mise à jour');
    }
    
    console.log('Données reçues de Supabase après mise à jour:', data); // Debug
    
    // Convertir au format ExtendedProduct
    const updatedProduct: ExtendedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      secondaryImage: data.secondary_image,
      sizes: data.sizes || [],
      colors: data.colors || [],
      type: data.type || 'standard',
      productType: data.product_type,
      sleeveType: data.sleeve_type,
      linkedLotteries: data.linked_lotteries || [],
      popularity: data.popularity,
      tickets: data.tickets || 1,
      weight: data.weight,
      deliveryPrice: data.delivery_price,
      allowCustomization: data.allow_customization === true, // Conversion explicite en booléen
      defaultVisualId: data.default_visual_id,
      defaultVisualSettings: data.default_visual_settings,
      visualCategoryId: data.visual_category_id
    };
    
    // Mettre à jour le localStorage pour la cohérence
    const products = await fetchProducts();
    const updatedProducts = products.map(p => p.id === product.id ? updatedProduct : p);
    saveProductsToLocalStorage(updatedProducts);
    
    toast.success(`Produit "${updatedProduct.name}" mis à jour avec succès`);
    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    // Fallback au localStorage
    try {
      const storedProducts = localStorage.getItem('products');
      let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      products = products.map(p => p.id === product.id ? product : p);
      saveProductsToLocalStorage(products);
      
      return product;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la mise à jour du produit");
      return null;
    }
  }
};

// Fonction pour supprimer un produit
export const deleteProduct = async (productId: number): Promise<boolean> => {
  // Si Supabase n'est pas configuré, utiliser localStorage
  if (!isSupabaseConfigured()) {
    try {
      const storedProducts = localStorage.getItem('products');
      let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      products = products.filter(p => p.id !== productId);
      saveProductsToLocalStorage(products);
      
      toast.success("Produit supprimé avec succès (stockage local)");
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du produit en local:', error);
      toast.error("Erreur lors de la suppression du produit");
      return false;
    }
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    
    // Mettre à jour le localStorage pour la cohérence
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        let products: ExtendedProduct[] = JSON.parse(storedProducts);
        products = products.filter(p => p.id !== productId);
        saveProductsToLocalStorage(products);
      } catch (e) {
        console.error('Erreur lors de la mise à jour du localStorage:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    toast.error("Erreur de connexion: supprimé localement");
    
    // Fallback au localStorage
    try {
      const storedProducts = localStorage.getItem('products');
      let products: ExtendedProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
      
      products = products.filter(p => p.id !== productId);
      saveProductsToLocalStorage(products);
      
      return true;
    } catch (localError) {
      console.error('Erreur lors du fallback local:', localError);
      toast.error("Erreur lors de la suppression du produit");
      return false;
    }
  }
};

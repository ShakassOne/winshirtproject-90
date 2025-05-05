import { supabase } from '@/integrations/supabase/client';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import React from 'react';
import { snakeToCamel, camelToSnake } from "@/lib/utils";
import { checkSupabaseConnection } from '@/integrations/supabase/client';

/**
 * Hook to fetch products data
 */
export const useProducts = () => {
  const [products, setProducts] = React.useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data structure if needed
        const formattedProducts = data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: product.image || '',
          secondaryImage: product.secondary_image,
          sizes: product.sizes || [],
          colors: product.colors || [],
          type: product.type || 'standard',
          productType: product.product_type || '',
          sleeveType: product.sleeve_type || '',
          linkedLotteries: product.linked_lotteries || [],
          popularity: product.popularity || 0,
          tickets: product.tickets || 1,
          weight: product.weight,
          deliveryPrice: product.delivery_price,
          allowCustomization: product.allow_customization || false,
          defaultVisualId: product.default_visual_id,
          defaultVisualSettings: product.default_visual_settings,
          visualCategoryId: product.visual_category_id,
          printAreas: product.print_areas || [],
          brand: product.brand || '',
          fit: product.fit || '',
          gender: product.gender || '',
          material: product.material || ''
        })) as ExtendedProduct[];
        
        setProducts(formattedProducts);
        
        // Store in localStorage as fallback
        localStorage.setItem('products', JSON.stringify(formattedProducts));
      } else {
        // Fallback to localStorage
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // If no data in localStorage, use empty array
          setProducts([]);
        }
      }
      return true;
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        try {
          setProducts(JSON.parse(storedProducts));
        } catch (e) {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
    
    // Set up a refresh interval to check for updates
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return { products, loading, error, refreshProducts: fetchProducts };
};

/**
 * Hook to fetch lotteries data
 */
export const useLotteries = () => {
  const [lotteries, setLotteries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchLotteries = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('lotteries')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setLotteries(data);
        
        // Store in localStorage as fallback
        localStorage.setItem('lotteries', JSON.stringify(data));
      } else {
        // Fallback to localStorage
        const storedLotteries = localStorage.getItem('lotteries');
        if (storedLotteries) {
          setLotteries(JSON.parse(storedLotteries));
        } else {
          // If no data in localStorage, use empty array
          setLotteries([]);
        }
      }
      return true;
    } catch (err) {
      console.error("Error fetching lotteries:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        try {
          setLotteries(JSON.parse(storedLotteries));
        } catch (e) {
          setLotteries([]);
        }
      } else {
        setLotteries([]);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLotteries();
  }, []);

  return { lotteries, loading, error, refreshLotteries: fetchLotteries };
};

/**
 * Create a new product
 */
export const createProduct = async (product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  try {
    // Check if Supabase is configured
    const isConnected = await checkSupabaseConnection();
    
    // Prepare product data object
    const productData = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      secondary_image: product.secondaryImage || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType || '',
      sleeve_type: product.sleeveType || '',
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity || 0,
      tickets: product.tickets || 1,
      weight: product.weight || 0,
      delivery_price: product.deliveryPrice || 0,
      allow_customization: product.allowCustomization || false,
      default_visual_id: product.defaultVisualId || null,
      default_visual_settings: product.defaultVisualSettings || null,
      visual_category_id: product.visualCategoryId || null,
      print_areas: product.printAreas || [],
      brand: product.brand || '',
      fit: product.fit || '',
      gender: product.gender || '',
      material: product.material || ''
    };
    
    // Get current user, if authenticated
    const { data: userData } = await supabase.auth.getUser();
    const isAuthenticated = !!userData?.user;
    
    // Ajouter l'utilisateur si authentifié
    if (isAuthenticated && userData?.user) {
      productData['created_by'] = userData.user.id;
    }
    
    if (isConnected) {
      // Try to save to Supabase
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating product in Supabase:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned after product creation");
      }
      
      // Convert to ExtendedProduct
      const newProduct: ExtendedProduct = supabaseToAppProduct(data);
      
      // Update local storage
      saveProductToLocalStorage(newProduct);
      
      return newProduct;
    } else {
      // Offline mode - save to localStorage only
      const productId = Date.now();
      const newProduct = {
        id: productId,
        ...product
      };
      
      // Add to local storage
      const existingProducts = getProductsFromLocalStorage();
      existingProducts.push(newProduct);
      saveProductsToLocalStorage(existingProducts);
      
      toast.warning("Produit créé en mode hors ligne. Il sera synchronisé dès que possible.", { position: "bottom-right" });
      return newProduct;
    }
  } catch (error) {
    console.error("Error creating product:", error);
    
    // Try to create locally anyway when server fails
    try {
      const productId = Date.now();
      const newProduct = {
        id: productId,
        ...product
      };
      
      // Add to local storage
      const existingProducts = getProductsFromLocalStorage();
      existingProducts.push(newProduct);
      saveProductsToLocalStorage(existingProducts);
      
      toast.warning("Produit créé localement suite à une erreur serveur.", { position: "bottom-right" });
      return newProduct;
    } catch (e) {
      console.error("Failed to create product locally:", e);
      throw error;
    }
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: number, product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  try {
    // Check if Supabase is configured
    const isConnected = await checkSupabaseConnection();
    
    // Prepare product data object
    const productData = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      secondary_image: product.secondaryImage || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType || '',
      sleeve_type: product.sleeveType || '',
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity || 0,
      tickets: product.tickets || 1,
      weight: product.weight || 0,
      delivery_price: product.deliveryPrice || 0,
      allow_customization: product.allowCustomization || false,
      default_visual_id: product.defaultVisualId || null,
      default_visual_settings: product.defaultVisualSettings || null,
      visual_category_id: product.visualCategoryId || null,
      print_areas: product.printAreas || [],
      brand: product.brand || '',
      fit: product.fit || '',
      gender: product.gender || '',
      material: product.material || ''
    };
    
    if (isConnected) {
      // Try to update to Supabase
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating product in Supabase:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned after product update");
      }
      
      // Convert to ExtendedProduct
      const updatedProduct: ExtendedProduct = supabaseToAppProduct(data);
      
      // Update local storage
      saveProductToLocalStorage(updatedProduct);
      
      return updatedProduct;
    } else {
      // Offline mode - update to localStorage only
      const updatedProduct = {
        id: id,
        ...product
      };
      
      // Update local storage
      saveProductToLocalStorage(updatedProduct);
      
      toast.warning("Produit mis à jour en mode hors ligne. Il sera synchronisé dès que possible.", { position: "bottom-right" });
      return updatedProduct;
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Delete an existing product
 */
export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    // Check if Supabase is configured
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      // Try to delete to Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting product in Supabase:", error);
        throw error;
      }
      
      // Remove from local storage
      removeProductFromLocalStorage(id);
      
      return true;
    } else {
      // Offline mode - remove from localStorage only
      removeProductFromLocalStorage(id);
      
      toast.warning("Produit supprimé en mode hors ligne. La suppression sera synchronisée dès que possible.", { position: "bottom-right" });
      return true;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

/**
 * Save a product to local storage
 */
const saveProductToLocalStorage = (product: ExtendedProduct) => {
  try {
    const products = getProductsFromLocalStorage();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      // Update existing product
      products[existingIndex] = product;
    } else {
      // Add new product
      products.push(product);
    }
    
    saveProductsToLocalStorage(products);
  } catch (error) {
    console.error("Error saving product to localStorage:", error);
  }
};

/**
 * Remove a product from local storage
 */
const removeProductFromLocalStorage = (id: number) => {
  try {
    let products = getProductsFromLocalStorage();
    products = products.filter(p => p.id !== id);
    saveProductsToLocalStorage(products);
  } catch (error) {
    console.error("Error removing product from localStorage:", error);
  }
};

/**
 * Get all products from local storage
 */
const getProductsFromLocalStorage = (): ExtendedProduct[] => {
  try {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error("Error getting products from localStorage:", error);
    return [];
  }
};

/**
 * Save products array to local storage
 */
const saveProductsToLocalStorage = (products: ExtendedProduct[]) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products to localStorage:", error);
  }
};

/**
 * Helper function to convert Supabase product to app format
 */
export const supabaseToAppProduct = (product: any): ExtendedProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: product.image || '',
    secondaryImage: product.secondary_image || '',
    sizes: product.sizes || [],
    colors: product.colors || [],
    type: product.type || 'standard',
    productType: product.product_type || '',
    sleeveType: product.sleeve_type || '',
    linkedLotteries: product.linked_lotteries || [],
    popularity: product.popularity || 0,
    tickets: product.tickets || 1,
    weight: product.weight || 0,
    deliveryPrice: product.delivery_price || 0,
    allowCustomization: product.allow_customization || false,
    defaultVisualId: product.default_visual_id || null,
    defaultVisualSettings: product.default_visual_settings || null,
    visualCategoryId: product.visual_category_id || null,
    printAreas: product.print_areas || [],
    brand: product.brand || '',
    fit: product.fit || '',
    gender: product.gender || '',
    material: product.material || ''
  };
};

// Add function to sync products to Supabase
export const syncProductsToSupabase = async (): Promise<boolean> => {
  try {
    // Check if Supabase is configured
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

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

    // Convert data from camelCase to snake_case for Supabase
    const supabaseData = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || null,
      price: product.price,
      image: product.image || null,
      secondary_image: product.secondaryImage || null,
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType || null,
      sleeve_type: product.sleeveType || null,
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity || 0,
      tickets: product.tickets || 1,
      weight: product.weight || null,
      delivery_price: product.deliveryPrice || null,
      allow_customization: product.allowCustomization || false,
      default_visual_id: product.defaultVisualId || null,
      default_visual_settings: product.defaultVisualSettings || null,
      visual_category_id: product.visualCategoryId || null,
      print_areas: product.printAreas || [], // Added to handle the new column
      brand: product.brand || null,
      fit: product.fit || null,
      gender: product.gender || null,
      material: product.material || null,
    }));

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


import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client
import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';
import { supabaseToAppProduct, appToSupabaseProduct } from '@/lib/dataConverters';
import { showValidationErrors, validateProducts } from '@/lib/syncValidator';

export const createProduct = async (productData: any) => {
  try {
    // Convertir au format Supabase
    const supabaseProduct = appToSupabaseProduct(productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([supabaseProduct]);

    if (error) throw error;

    console.log('Product created:', data);
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: number, productData: any) => {
  try {
    // Convertir au format Supabase
    const supabaseProduct = appToSupabaseProduct(productData);
    
    const { data, error } = await supabase
      .from('products')
      .update(supabaseProduct)
      .eq('id', productId);

    if (error) throw error;

    console.log('Product updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    console.log('Product deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const syncProductsToSupabase = async () => {
  try {
    // Fetch products from localStorage
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts) {
      console.error('No local products found to sync');
      return false;
    }
    
    const localProducts: ExtendedProduct[] = JSON.parse(storedProducts);
    
    // Validate products before sync
    const validationResult = validateProducts(localProducts);
    if (!showValidationErrors(validationResult, 'Produit')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }
    
    // Transform data to match Supabase schema using converter
    const supabaseReadyProducts = localProducts.map((product: ExtendedProduct) => 
      appToSupabaseProduct(product)
    );
    
    console.log('Preparing to sync products with transformed data:', supabaseReadyProducts);

    // Use one product at a time to avoid batch errors
    for (const product of supabaseReadyProducts) {
      const { error } = await supabase
        .from('products')
        .upsert(product, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error syncing product ID ${product.id}:`, error);
        toast.error(`Erreur lors de la synchronisation du produit ID ${product.id}: ${error.message}`, { position: "bottom-right" });
        // Continue with next product
      }
    }

    toast.success(`Produits synchronisés avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error syncing products:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Create the useProducts hook
export const useProducts = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data to match ExtendedProduct type using converter
        const formattedProducts = data.map(item => 
          supabaseToAppProduct(item)
        ) as ExtendedProduct[];
        
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
      return true; // Return true to indicate success
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
      return false; // Return false to indicate failure
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async (): Promise<boolean> => {
    return await fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refreshProducts };
};

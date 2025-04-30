
import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection } from '@/lib/supabase';
import { pullDataFromSupabase as fetchDataFromSupabase, pushDataToSupabase as syncLocalDataToSupabase } from '@/lib/syncManager';
import { getMockProducts } from '@/data/mockData';
import { ValidTableName } from '@/lib/syncManager';
import { snakeToCamel, camelToSnake, snakeToCamelObject, camelToSnakeObject } from '@/lib/utils';
import { showNotification } from '@/lib/notifications';

/**
 * Hook to fetch products with caching
 */
export const useProducts = (filterOptions = {}) => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isOnline = await checkSupabaseConnection();
      
      if (isOnline) {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id');
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.length > 0) {
          // Convert Supabase snake_case to camelCase
          const formattedProducts = data.map(product => {
            return snakeToCamelObject(product) as ExtendedProduct;
          });
          
          setProducts(formattedProducts);
          localStorage.setItem('products', JSON.stringify(data));
          setLoading(false);
          return;
        } else {
          // If no data, try to pull from Supabase
          await fetchDataFromSupabase('products' as ValidTableName);
        }
      }
      
      // Try to get from localStorage if offline or no data in Supabase
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        const formattedProducts = parsedProducts.map((product: any) => {
          return snakeToCamelObject(product) as ExtendedProduct;
        });
        
        setProducts(formattedProducts);
        setLoading(false);
        return;
      }
      
      // Fallback to mock data if all else fails
      const mockProductsData = getMockProducts();
      setProducts(mockProductsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err as Error);
      
      // Try to get from localStorage as fallback
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          setProducts(parsedProducts.map((product: any) => snakeToCamelObject(product)) as ExtendedProduct[]);
        } catch (parseErr) {
          console.error('Error parsing stored products:', parseErr);
          // Last resort - use mock data
          const mockProductsData = getMockProducts();
          setProducts(mockProductsData);
        }
      } else {
        // Last resort - use mock data
        const mockProductsData = getMockProducts();
        setProducts(mockProductsData);
      }
      
      toast.error(`Erreur lors du chargement des produits: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    
    const handleStorageChange = () => {
      fetchProducts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, []);
  
  return { products, loading, error, refreshProducts: fetchProducts };
};

/**
 * Create a new product
 * @param product - The product data
 * @returns A promise resolving to the created product
 */
export const createProduct = async (product: Omit<ExtendedProduct, 'id'>): Promise<ExtendedProduct> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error("Not connected to Supabase");
    }

    // Convert to snake_case for Supabase
    const snakeCaseProduct = camelToSnakeObject(product);

    const { data, error } = await supabase
      .from('products')
      .insert([snakeCaseProduct])
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Sync local data
    await syncLocalDataToSupabase('products' as ValidTableName);
    
    showNotification('create', 'produit', true);
    return snakeToCamelObject(data) as ExtendedProduct;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    showNotification('create', 'produit', false, errorMessage);
    throw err;
  }
};

/**
 * Update an existing product
 * @param product - The product data with ID
 * @returns A promise resolving to the updated product
 */
export const updateProduct = async (product: ExtendedProduct): Promise<ExtendedProduct> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error("Not connected to Supabase");
    }

    // Convert to snake_case for Supabase
    const snakeCaseProduct = camelToSnakeObject(product);
    const { id, ...updateData } = snakeCaseProduct;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Sync local data
    await syncLocalDataToSupabase('products' as ValidTableName);
    
    showNotification('update', 'produit', true);
    return snakeToCamelObject(data) as ExtendedProduct;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    showNotification('update', 'produit', false, errorMessage);
    throw err;
  }
};

/**
 * Delete a product
 * @param id - The product ID to delete
 * @returns A promise resolving to void
 */
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error("Not connected to Supabase");
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    
    // Sync local data
    await syncLocalDataToSupabase('products' as ValidTableName);
    
    showNotification('delete', 'produit', true);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    showNotification('delete', 'produit', false, errorMessage);
    throw err;
  }
};

/**
 * Sync products to Supabase
 * @returns A promise resolving to void
 */
export const syncProductsToSupabase = async (): Promise<void> => {
  try {
    await syncLocalDataToSupabase('products' as ValidTableName);
    showNotification('sync', 'produits', true);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    showNotification('sync', 'produits', false, errorMessage);
    throw err;
  }
};

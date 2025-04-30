import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection } from '@/lib/supabase';
import { pullDataFromSupabase as fetchDataFromSupabase, pushDataToSupabase as syncLocalDataToSupabase } from '@/lib/syncManager';
import { getMockProducts } from '@/data/mockData';
import { ValidTableName } from '@/lib/syncManager';
import { snakeToCamel, camelToSnake } from '@/lib/utils';

/**
 * Hook to fetch products with caching
 */
export const useProducts = (filterOptions = {}) => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
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
              return {
                ...snakeToCamel(product),
                // Add any specific mappings here
              } as ExtendedProduct;
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
            return {
              ...snakeToCamel(product),
              // Add any specific mappings here
            } as ExtendedProduct;
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
            setProducts(parsedProducts.map((product: any) => snakeToCamel(product)) as ExtendedProduct[]);
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
  
  return { products, loading, error };
};

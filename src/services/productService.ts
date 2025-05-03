
import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client
import { useState, useEffect } from 'react';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

export const createProduct = async (productData: any) => {
  try {
    const { data, error } = await supabase
      .from('products') // Remplace 'products' par le nom de ta table
      .insert([productData]);

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
    const { data, error } = await supabase
      .from('products')
      .update(productData)
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
    // Fetch products from localStorage instead of undefined function
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts) {
      console.error('No local products found to sync');
      return false;
    }
    
    const localProducts = JSON.parse(storedProducts);
    
    const { data, error } = await supabase
      .from('products')
      .upsert(localProducts, { 
        onConflict: 'id' // Fix: use string instead of array
      });

    if (error) throw error;

    console.log('Products synced to Supabase:', data);
    return true;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
};

// Create the useProducts hook that was missing
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
        // Transform data to match ExtendedProduct type if needed
        const formattedProducts = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '',
          secondaryImage: item.secondary_image || '',
          sizes: item.sizes || [],
          colors: item.colors || [],
          type: item.type || 'standard',
          productType: item.product_type || '',
          sleeveType: item.sleeve_type || '',
          linkedLotteries: item.linked_lotteries || [],
          popularity: item.popularity || 0,
          tickets: item.tickets || 1,
          weight: item.weight,
          deliveryPrice: item.delivery_price,
          allowCustomization: !!item.allow_customization,
          defaultVisualId: item.default_visual_id,
          defaultVisualSettings: item.default_visual_settings,
          visualCategoryId: item.visual_category_id,
          printAreas: item.print_areas || [],
          brand: item.brand,
          fit: item.fit,
          gender: item.gender,
          material: item.material,
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
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    return fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refreshProducts };
};

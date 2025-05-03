
import { supabase } from '@/lib/supabase'; // Using the correct path to the Supabase client

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
    // Fetch products from your local data source (e.g., Lovable)
    const localProducts = await getLocalProducts(); // Define this function to fetch local products
    const { data, error } = await supabase
      .from('products')
      .upsert(localProducts, { onConflict: ['id'] }); // Assure-toi que 'id' est la clé primaire

    if (error) throw error;

    console.log('Products synced to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
};

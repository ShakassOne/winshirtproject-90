
import { supabase } from '@/lib/supabase';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

// Fonction pour récupérer tous les produits
export const fetchProducts = async (): Promise<ExtendedProduct[]> => {
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
        linkedLotteries: item.linked_lotteries,
        popularity: item.popularity,
        tickets: item.tickets || 1,
        weight: item.weight,
        deliveryPrice: item.delivery_price
      };
    });
    
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    toast.error("Erreur lors du chargement des produits");
    
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
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
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
        delivery_price: product.deliveryPrice
      })
      .select()
      .single();
    
    if (error) throw error;
    
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
      linkedLotteries: data.linked_lotteries,
      popularity: data.popularity || Math.random() * 100,
      tickets: data.tickets || 1,
      weight: data.weight,
      deliveryPrice: data.delivery_price
    };
    
    return createdProduct;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    toast.error("Erreur lors de la création du produit");
    return null;
  }
};

// Fonction pour mettre à jour un produit existant
export const updateProduct = async (product: ExtendedProduct): Promise<ExtendedProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
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
        delivery_price: product.deliveryPrice
      })
      .eq('id', product.id)
      .select()
      .single();
    
    if (error) throw error;
    
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
      linkedLotteries: data.linked_lotteries,
      popularity: data.popularity,
      tickets: data.tickets || 1,
      weight: data.weight,
      deliveryPrice: data.delivery_price
    };
    
    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    toast.error("Erreur lors de la mise à jour du produit");
    return null;
  }
};

// Fonction pour supprimer un produit
export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    toast.error("Erreur lors de la suppression du produit");
    return false;
  }
};

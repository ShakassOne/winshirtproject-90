
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';

/**
 * Convertit un produit du format Supabase au format d'application
 */
export const supabaseToAppProduct = (item: any): ExtendedProduct => {
  return {
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
    allowCustomization: item.allow_customization === true,
    defaultVisualId: item.default_visual_id,
    defaultVisualSettings: item.default_visual_settings,
    visualCategoryId: item.visual_category_id,
    printAreas: item.print_areas || [],
    brand: item.brand,
    fit: item.fit,
    gender: item.gender,
    material: item.material,
    participants: [] // Add empty participants array to fix the type error
  };
};

/**
 * Convertit un produit du format d'application au format Supabase
 */
export const appToSupabaseProduct = (product: ExtendedProduct): any => {
  return {
    id: product.id,
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
    weight: product.weight,
    delivery_price: product.deliveryPrice,
    allow_customization: product.allowCustomization === true,
    default_visual_id: product.defaultVisualId,
    default_visual_settings: product.defaultVisualSettings,
    visual_category_id: product.visualCategoryId,
    print_areas: product.printAreas || [],
    brand: product.brand,
    fit: product.fit,
    gender: product.gender,
    material: product.material,
  };
};

/**
 * Convertit une loterie du format Supabase au format d'application
 */
export const supabaseToAppLottery = (lottery: any): ExtendedLottery => {
  return {
    id: lottery.id,
    title: lottery.title,
    description: lottery.description || '',
    image: lottery.image || '',
    value: lottery.value,
    status: lottery.status,
    featured: lottery.featured || false,
    targetParticipants: lottery.target_participants,
    currentParticipants: lottery.current_participants || 0,
    drawDate: lottery.draw_date,
    endDate: lottery.end_date,
    linkedProducts: lottery.linked_products || [],
    participants: [] // Add empty participants array to fix the type error
  };
};

/**
 * Convertit une loterie du format d'application au format Supabase
 */
export const appToSupabaseLottery = (lottery: ExtendedLottery): any => {
  return {
    id: lottery.id,
    title: lottery.title,
    description: lottery.description || '',
    image: lottery.image || '', // Ensure image is never null
    value: lottery.value,
    status: lottery.status || 'active',
    featured: lottery.featured === true,
    target_participants: lottery.targetParticipants || 10,
    current_participants: lottery.currentParticipants || 0,
    draw_date: lottery.drawDate,
    end_date: lottery.endDate,
    linked_products: lottery.linkedProducts || [],
  };
};

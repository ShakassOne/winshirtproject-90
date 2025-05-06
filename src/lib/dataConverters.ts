
import { ExtendedProduct, PrintArea } from '@/types/product';
import { Product } from '@/types/database.types';
import { ExtendedLottery } from '@/types/lottery';

export const appToSupabaseProduct = (product: ExtendedProduct): any => {
  // Convertir notre modèle d'application en format compatible avec Supabase
  const { id, participants, lotteryName, lotteryImage, deliveryInfo, ...rest } = product;

  return {
    ...rest,
    id: id, // Gardez l'ID pour les mises à jour
    // Assurez-vous que tous les champs sont dans un format accepté par Postgres
    sizes: Array.isArray(rest.sizes) ? rest.sizes : [],
    colors: Array.isArray(rest.colors) ? rest.colors : [],
    print_areas: Array.isArray(rest.printAreas) ? rest.printAreas.map(area => ({
      id: area.id,
      position: area.position,
      name: area.name,
      bounds: area.bounds,
      constraints: area.constraints || null,
      format: area.format || null,
      allow_custom_position: area.allowCustomPosition || false
    })) : [],
    linked_lotteries: Array.isArray(rest.linkedLotteries) ? rest.linkedLotteries : []
  };
};

export const supabaseToAppProduct = (data: any): ExtendedProduct => {
  // Convertir les données Supabase en notre modèle d'application
  const product: ExtendedProduct = {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    image: data.image || '',
    secondaryImage: data.secondary_image || data.secondaryImage || '',
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    type: data.type || 'standard',
    productType: data.product_type || data.productType || '',
    sleeveType: data.sleeve_type || data.sleeveType || '',
    linkedLotteries: Array.isArray(data.linked_lotteries) ? data.linked_lotteries : 
                     Array.isArray(data.linkedLotteries) ? data.linkedLotteries : [],
    popularity: data.popularity || 0,
    tickets: data.tickets || 1,
    weight: data.weight || 0,
    deliveryPrice: data.delivery_price || data.deliveryPrice || 0,
    allowCustomization: typeof data.allow_customization !== 'undefined' ? data.allow_customization : 
                        typeof data.allowCustomization !== 'undefined' ? data.allowCustomization : false,
    defaultVisualId: data.default_visual_id || data.defaultVisualId || null,
    defaultVisualSettings: data.default_visual_settings || data.defaultVisualSettings || null,
    visualCategoryId: data.visual_category_id || data.visualCategoryId || null,
    printAreas: Array.isArray(data.print_areas) ? data.print_areas.map((area: any) => ({
      id: area.id,
      position: area.position,
      name: area.name,
      bounds: area.bounds,
      constraints: area.constraints || null,
      format: area.format || null,
      allowCustomPosition: area.allow_custom_position || area.allowCustomPosition || false
    })) : Array.isArray(data.printAreas) ? data.printAreas : [],
    brand: data.brand || '',
    fit: data.fit || '',
    gender: data.gender || '',
    material: data.material || '',
    participants: [], // Ces informations viennent généralement d'une autre table
    lotteryName: '', // Ces champs sont généralement calculés
    lotteryImage: ''
  };

  return product;
};

// Ajout des fonctions manquantes pour la conversion des loteries
export const appToSupabaseLottery = (lottery: ExtendedLottery): any => {
  // Conversion de notre modèle d'application au format Supabase
  const { id, participants, winner, ...rest } = lottery;

  return {
    ...rest,
    id: id, // Gardez l'ID pour les mises à jour
    target_participants: rest.targetParticipants,
    current_participants: rest.currentParticipants || 0,
    draw_date: rest.drawDate,
    end_date: rest.endDate,
    linked_products: Array.isArray(rest.linkedProducts) ? rest.linkedProducts : []
  };
};

export const supabaseToAppLottery = (data: any): ExtendedLottery => {
  // Conversion des données Supabase en notre modèle d'application
  const lottery: ExtendedLottery = {
    id: data.id,
    title: data.title || '',
    description: data.description || '',
    image: data.image || '',
    value: data.value || 0,
    status: data.status || 'active',
    featured: data.featured || false,
    targetParticipants: data.target_participants || data.targetParticipants || 0,
    currentParticipants: data.current_participants || data.currentParticipants || 0,
    drawDate: data.draw_date || data.drawDate || null,
    endDate: data.end_date || data.endDate || null,
    linkedProducts: Array.isArray(data.linked_products) ? data.linked_products : 
                   Array.isArray(data.linkedProducts) ? data.linkedProducts : [],
    participants: [], // Les participants sont généralement chargés séparément
    winner: null // De même pour le gagnant
  };

  return lottery;
};

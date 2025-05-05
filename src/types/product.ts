import { ProductVisualSettings } from './visual';

export interface ExtendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  secondaryImage?: string;
  sizes: string[];
  colors: string[];
  type: string; // Quality type: entry level, standard, premium - IMPORTANT: non facultatif
  productType?: string; // T-shirts, sweatshirt, polo
  sleeveType?: string; // courtes ou longues
  linkedLotteries?: number[];
  lotteryName?: string;
  lotteryImage?: string;
  popularity?: number;
  tickets?: number; // Nombre de tickets (1-5) pour ce produit
  deliveryInfo?: DeliveryInfo; // Information de livraison spécifique au produit
  deliveryPrice?: number; // Prix de livraison spécifique
  weight?: number; // Poids en grammes
  featured?: boolean; // Added the featured property
  
  // Nouveaux champs pour la gestion des visuels
  allowCustomization?: boolean; // Si le produit permet la personnalisation visuelle
  defaultVisualId?: number | null; // ID du visuel par défaut
  defaultVisualSettings?: ProductVisualSettings | any; // Paramètres du visuel par défaut - added any for compatibility
  visualCategoryId?: number | null; // ID de la catégorie de visuels associée
  
  // Nouveaux filtres avancés
  gender?: 'homme' | 'femme' | 'enfant' | 'unisexe' | string; // Genre - added string for compatibility
  material?: string; // Matière: coton, polyester, bio, technique
  fit?: 'regular' | 'ajusté' | 'oversize' | string; // Coupe - added string for compatibility
  brand?: string; // Marque - Nouveau champ ajouté à la base de données
  
  // Zones d'impression
  printAreas?: PrintArea[] | any[]; // Zones d'impression disponibles - added any[] for compatibility
}

export interface DeliveryInfo {
  weight?: number; // Poids en grammes
  dimensions?: {
    length: number;
    width: number;
    height: number;
  }; // Dimensions en cm
  handlingTime?: number; // Temps de préparation en jours
  freeShipping?: boolean; // Si le produit bénéficie de la livraison gratuite
  shippingRestrictions?: string[]; // Pays où la livraison n'est pas possible
}

// Updated to make format optional
export interface PrintArea {
  id: number;
  name: string; // Nom de la zone (ex: "Recto", "Verso")
  position: 'front' | 'back' | string; // Recto ou verso - added string for compatibility
  format: 'custom' | string; // Format personnalisé (rendu optional) - added string for compatibility
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }; // Coordonnées et dimensions de la zone
  allowCustomPosition?: boolean; // Si le client peut repositionner dans la zone (toujours true maintenant)
  [key: string]: any; // Add index signature for compatibility with JSON
}

// Interface pour les filtres disponibles
export interface ProductFilters {
  productTypes: string[]; // T-shirt, Sweatshirt, etc.
  sleeveTypes: string[]; // Manches courtes, longues, etc.
  genders: string[]; // Homme, femme, enfant
  materials: string[]; // Coton, polyester, etc.
  fits: string[]; // Regular, ajusté, etc.
  brands: string[]; // Marques
  sizes: string[]; // XS, S, M, L, XL, etc.
  colors: string[]; // Couleurs disponibles
}

// Add a type to handle JSON data from Supabase
export type Json = any;

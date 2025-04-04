
import { ProductVisualSettings } from './visual';

export interface ExtendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  secondaryImage?: string; // Nouvelle propriété pour une image secondaire
  sizes: string[];
  colors: string[];
  type: string; // Quality type: entry level, standard, premium
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
  
  // Nouveaux champs pour la gestion des visuels
  allowCustomization?: boolean; // Si le produit permet la personnalisation visuelle
  defaultVisualId?: number | null; // ID du visuel par défaut
  defaultVisualSettings?: ProductVisualSettings; // Paramètres du visuel par défaut
  visualCategoryId?: number | null; // ID de la catégorie de visuels associée
  
  // Nouveaux filtres avancés
  gender?: 'homme' | 'femme' | 'enfant' | 'unisexe'; // Genre
  material?: string; // Matière: coton, polyester, bio, technique
  fit?: 'regular' | 'ajusté' | 'oversize'; // Coupe
  brand?: string; // Marque
  
  // Zones d'impression
  printAreas?: PrintArea[]; // Zones d'impression disponibles
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

// Mise à jour pour inclure le format personnalisé (custom uniquement)
export interface PrintArea {
  id: number;
  name: string; // Nom de la zone (ex: "Recto", "Verso")
  position: 'front' | 'back'; // Recto ou verso
  format: 'custom'; // Seulement format personnalisé
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }; // Coordonnées et dimensions de la zone
  allowCustomPosition?: boolean; // Si le client peut repositionner dans la zone (toujours true maintenant)
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

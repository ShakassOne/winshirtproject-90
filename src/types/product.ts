
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


import { toast } from './toast';

/**
 * Synchronise les liens entre les produits et les loteries 
 * pour s'assurer que les références croisées sont cohérentes
 */
export const syncProductsAndLotteries = () => {
  try {
    // Récupérer les données depuis localStorage
    const productsString = localStorage.getItem('products');
    const lotteriesString = localStorage.getItem('lotteries');

    if (!productsString || !lotteriesString) {
      console.error("Données des produits ou loteries non disponibles");
      return false;
    }

    // Parser les données
    const products = JSON.parse(productsString);
    const lotteries = JSON.parse(lotteriesString);

    // Liste de contrôle pour les mises à jour
    let productsUpdated = false;
    let lotteriesUpdated = false;

    // 1. Mettre à jour les liens dans les produits
    products.forEach((product: any) => {
      // S'assurer que linked_lotteries est un tableau
      if (!Array.isArray(product.linked_lotteries)) {
        product.linked_lotteries = [];
        productsUpdated = true;
      }
      
      // Vérifier si les loteries liées existent toujours
      product.linked_lotteries = product.linked_lotteries.filter((lotteryId: number) => 
        lotteries.some((lottery: any) => lottery.id === lotteryId));
      
      // Alternative: utiliser linkedLotteries au lieu de linked_lotteries si c'est le format utilisé
      if (product.linkedLotteries && Array.isArray(product.linkedLotteries)) {
        product.linked_lotteries = product.linkedLotteries;
        delete product.linkedLotteries;
        productsUpdated = true;
      }
    });

    // 2. Mettre à jour les liens dans les loteries
    lotteries.forEach((lottery: any) => {
      // S'assurer que linked_products est un tableau
      if (!Array.isArray(lottery.linked_products)) {
        lottery.linked_products = [];
        lotteriesUpdated = true;
      }
      
      // Vérifier si les produits liés existent toujours
      lottery.linked_products = lottery.linked_products.filter((productId: number) => 
        products.some((product: any) => product.id === productId));
      
      // Alternative: utiliser linkedProducts au lieu de linked_products si c'est le format utilisé
      if (lottery.linkedProducts && Array.isArray(lottery.linkedProducts)) {
        lottery.linked_products = lottery.linkedProducts;
        delete lottery.linkedProducts;
        lotteriesUpdated = true;
      }
    });

    // 3. Réparation : Assurer la cohérence bidirectionnelle des liens
    // Si un produit est lié à une loterie, cette loterie doit aussi être liée à ce produit
    products.forEach((product: any) => {
      if (Array.isArray(product.linked_lotteries)) {
        product.linked_lotteries.forEach((lotteryId: number) => {
          const lottery = lotteries.find((l: any) => l.id === lotteryId);
          if (lottery) {
            if (!Array.isArray(lottery.linked_products)) {
              lottery.linked_products = [];
            }
            if (!lottery.linked_products.includes(product.id)) {
              lottery.linked_products.push(product.id);
              lotteriesUpdated = true;
            }
          }
        });
      }
    });

    // Et vice versa
    lotteries.forEach((lottery: any) => {
      if (Array.isArray(lottery.linked_products)) {
        lottery.linked_products.forEach((productId: number) => {
          const product = products.find((p: any) => p.id === productId);
          if (product) {
            if (!Array.isArray(product.linked_lotteries)) {
              product.linked_lotteries = [];
            }
            if (!product.linked_lotteries.includes(lottery.id)) {
              product.linked_lotteries.push(lottery.id);
              productsUpdated = true;
            }
          }
        });
      }
    });

    // Enregistrer les modifications si nécessaire
    if (productsUpdated) {
      localStorage.setItem('products', JSON.stringify(products));
      console.log("Produits mis à jour avec liens synchronisés");
    }

    if (lotteriesUpdated) {
      localStorage.setItem('lotteries', JSON.stringify(lotteries));
      console.log("Loteries mises à jour avec liens synchronisés");
    }

    if (productsUpdated || lotteriesUpdated) {
      toast.info("Liens entre produits et loteries synchronisés");
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la synchronisation des liens:", error);
    toast.error("Erreur lors de la synchronisation des liens");
    return false;
  }
};

/**
 * Vérifie si un produit particulier a des loteries liées valides
 * et retourne les objets loterie correspondants
 */
export const getLinkedLotteriesForProduct = (productId: number) => {
  try {
    // Récupérer les données depuis localStorage
    const productsString = localStorage.getItem('products');
    const lotteriesString = localStorage.getItem('lotteries');

    if (!productsString || !lotteriesString) {
      console.error("Données des produits ou loteries non disponibles");
      return [];
    }

    // Parser les données
    const products = JSON.parse(productsString);
    const lotteries = JSON.parse(lotteriesString);

    // Trouver le produit
    const product = products.find((p: any) => p.id === productId);
    if (!product) {
      console.error("Produit non trouvé:", productId);
      return [];
    }

    // Vérifier si le produit a des loteries liées
    const linkedLotteryIds = Array.isArray(product.linked_lotteries) 
      ? product.linked_lotteries 
      : product.linkedLotteries || [];

    if (linkedLotteryIds.length === 0) {
      console.log("Aucune loterie liée pour le produit:", productId);
      return [];
    }

    // Récupérer les objets loterie liés au produit
    const linkedLotteries = lotteries.filter((lottery: any) => 
      linkedLotteryIds.includes(lottery.id) && 
      lottery.status === 'active'
    );

    console.log(`${linkedLotteries.length} loteries liées trouvées pour le produit ${productId}:`, linkedLotteries);
    return linkedLotteries;
  } catch (error) {
    console.error("Erreur lors de la récupération des loteries liées:", error);
    return [];
  }
};

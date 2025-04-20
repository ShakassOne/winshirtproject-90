import { toast } from './toast';
import { simulateSendEmail } from '@/contexts/AuthContext';

const STRIPE_PUBLIC_KEY = 'pk_test_51abcdefghijklmnopqrstuvwxyz'; // Remplacez par votre clé publique Stripe

// Add a type declaration for the Stripe global object
declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

interface CheckoutItem {
  id: string | number;
  name: string; 
  price: number;
  quantity: number;
  lotteryId?: number;
  lotteryName?: string;
  size?: string;
  color?: string;
}

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Define more specific return types
export interface StripeCheckoutSuccess {
  success: true;
  url: string;
}

export interface StripeCheckoutError {
  success: false;
  error: any;
}

export type StripeCheckoutResult = StripeCheckoutSuccess | StripeCheckoutError;

export const initiateStripeCheckout = async (
  items: Array<CheckoutItem>,
  totalAmount?: number,
  shippingInfo?: ShippingInfo
): Promise<StripeCheckoutResult> => {
  try {
    // Afficher un message d'initialisation
    toast.info('Initialisation du paiement...');
    
    console.log('Items for checkout:', items);
    console.log('Total amount:', totalAmount);
    console.log('Shipping info:', shippingInfo);
    
    // Calculer le montant total si non fourni
    const amount = totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Dans un environnement de production, vous appelleriez un backend
    // Ici, nous simulons le processus pour la démonstration
    if (typeof window !== 'undefined' && window.Stripe) {
      // Si le script Stripe est chargé
      return await handleStripeCheckout(items, amount, shippingInfo);
    } else {
      // Charger le script Stripe dynamiquement
      const stripeLoaded = await loadStripeScript();
      if (stripeLoaded) {
        return await handleStripeCheckout(items, amount, shippingInfo);
      } else {
        throw new Error("Impossible de charger Stripe");
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    toast.error('Erreur lors de l\'initialisation du paiement');
    return { success: false, error };
  }
};

// Fonction pour charger le script Stripe
const loadStripeScript = () => {
  return new Promise<boolean>((resolve, reject) => {
    if (document.getElementById('stripe-script')) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'stripe-script';
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      reject(new Error('Impossible de charger le script Stripe'));
    };
    
    document.body.appendChild(script);
  });
};

// Fonction pour gérer le checkout avec Stripe
const handleStripeCheckout = async (
  items: Array<CheckoutItem>, 
  amount: number, 
  shippingInfo?: ShippingInfo
): Promise<StripeCheckoutResult> => {
  // En mode de test, simuler le processus de paiement
  const TEST_MODE = true; // À remplacer par une vérification de l'environnement
  
  if (TEST_MODE) {
    // Simuler la redirection vers la page de paiement Stripe
    const success = simulateOrderCreation(items, shippingInfo);
    
    if (success) {
      return { 
        success: true, 
        url: '/account' // URL de test, normalement ce serait l'URL de la session Stripe
      };
    } else {
      return { success: false, error: 'Erreur de simulation' };
    }
  } else {
    // En production, initialiser Stripe et créer une session de paiement
    if (!window.Stripe) {
      toast.error("Stripe n'est pas chargé");
      return { success: false, error: "Stripe n'est pas chargé" };
    }
    
    const stripe = window.Stripe(STRIPE_PUBLIC_KEY);
    
    // Préparer les éléments pour la session Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `${item.size || 'M'}, ${item.color || 'Noir'}${item.lotteryName ? `, Loterie: ${item.lotteryName}` : ''}`,
        },
        unit_amount: Math.round(item.price * 100), // Convertir en centimes
      },
      quantity: item.quantity,
    }));
    
    // Dans un environnement réel, vous appelleriez votre backend pour créer une session Stripe
    // Pour cette démo, nous simulons la réponse
    const sessionId = `test_session_${Date.now()}`;
    
    // Stocker les informations de commande en localStorage pour les récupérer après le paiement
    localStorage.setItem('pending_order', JSON.stringify({
      items,
      shippingInfo,
      sessionId,
      amount,
      timestamp: Date.now()
    }));
    
    // Dans un environnement réel, stripe.redirectToCheckout serait utilisé ici
    // Simuler la redirection
    const success = simulateOrderCreation(items, shippingInfo);
    
    if (success) {
      // Simuler une redirection vers Stripe avec retour sur la page de succès
      return { 
        success: true, 
        url: '/account' // URL de test, normalement ce serait l'URL de la session Stripe
      };
    } else {
      return { success: false, error: "Erreur lors de la création de la session Stripe" };
    }
  }
};

// Fonction pour simuler un achat réussi
const simulateOrderCreation = (items: Array<CheckoutItem>, shippingInfo?: ShippingInfo) => {
  try {
    // Récupérer l'utilisateur actuellement connecté
    const userString = localStorage.getItem('winshirt_user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Utiliser les informations de livraison si fournies (utilisateur non connecté)
    const customerInfo = user || {
      id: Date.now(), // ID temporaire pour les utilisateurs non connectés
      name: shippingInfo?.name || 'Invité',
      email: shippingInfo?.email || 'guest@example.com'
    };
    
    // 1. Récupérer les loteries et les produits
    const lotteriesString = localStorage.getItem('lotteries');
    const productsString = localStorage.getItem('products');
    
    if (!lotteriesString || !productsString) {
      console.error('Données des loteries ou produits manquantes');
      return false;
    }
    
    const lotteries = JSON.parse(lotteriesString);
    const products = JSON.parse(productsString);
    
    // 2. Pour chaque article acheté, mettre à jour les participants de la loterie associée
    items.forEach(item => {
      if (item.lotteryId) {
        // Trouver la loterie
        const lotteryIndex = lotteries.findIndex((l: any) => l.id === item.lotteryId);
        
        if (lotteryIndex !== -1) {
          // Créer un participant réel basé sur l'utilisateur connecté
          const participant = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: customerInfo.name,
            email: customerInfo.email,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
          };
          
          // Si participants n'existe pas, l'initialiser
          if (!lotteries[lotteryIndex].participants) {
            lotteries[lotteryIndex].participants = [];
          }
          
          // Ajouter le participant à la loterie (pour chaque quantité achetée)
          for (let i = 0; i < item.quantity; i++) {
            lotteries[lotteryIndex].participants.push({...participant, id: participant.id + i});
            // Incrémenter le nombre de participants
            lotteries[lotteryIndex].currentParticipants += 1;
          }
          
          // Vérifier si la loterie a atteint le nombre cible de participants
          if (lotteries[lotteryIndex].currentParticipants >= lotteries[lotteryIndex].targetParticipants) {
            // Si oui, programmer un tirage automatique dans 24 heures
            if (!lotteries[lotteryIndex].drawDate) {
              const drawDate = new Date();
              drawDate.setDate(drawDate.getDate() + 1); // +24 heures
              lotteries[lotteryIndex].drawDate = drawDate.toISOString();
              
              // Notifier les administrateurs qu'une loterie a atteint son objectif
              const adminEmails = localStorage.getItem('admin_notification_emails');
              const emails = adminEmails ? JSON.parse(adminEmails) : ['admin@winshirt.com'];
              
              emails.forEach((email: string) => {
                simulateSendEmail(
                  email,
                  "Loterie complète - Tirage programmé",
                  `La loterie "${lotteries[lotteryIndex].title}" a atteint son objectif de ${lotteries[lotteryIndex].targetParticipants} participants. Un tirage est programmé pour le ${new Date(lotteries[lotteryIndex].drawDate).toLocaleString('fr-FR')}.`
                );
              });
            }
          }
        }
      }
    });
    
    // 3. Enregistrer les loteries mises à jour
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    sessionStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    // 4. Enregistrer la commande pour l'utilisateur actuel
    const ordersString = localStorage.getItem('orders') || '[]';
    const orders = JSON.parse(ordersString);
    
    // Calculer le coût d'expédition (5.99€)
    const shippingCost = 5.99;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
      id: Date.now(),
      clientId: customerInfo.id,
      clientName: customerInfo.name,
      clientEmail: customerInfo.email,
      orderDate: new Date().toISOString(),
      status: 'processing',
      items: items.map(item => {
        const product = products.find((p: any) => p.id.toString() === item.id.toString());
        return {
          id: Date.now() + Math.floor(Math.random() * 1000),
          productId: item.id,
          productName: item.name,
          productImage: product?.image || 'https://placehold.co/600x400/png',
          quantity: item.quantity,
          price: item.price,
          size: item.size || 'M',
          color: item.color || 'Noir',
          lotteriesEntries: item.lotteryId ? [item.lotteryId] : []
        };
      }),
      shipping: {
        address: shippingInfo?.address || '123 Rue Exemple',
        city: shippingInfo?.city || 'Paris',
        postalCode: shippingInfo?.postalCode || '75000',
        country: shippingInfo?.country || 'France',
        method: 'Standard',
        cost: shippingCost
      },
      payment: {
        method: 'Stripe',
        transactionId: 'txn_' + Date.now(),
        status: 'completed'
      },
      subtotal: subtotal,
      total: subtotal + shippingCost,
      trackingNumber: 'TRK' + Date.now(),
      notes: ''
    };
    
    orders.push(newOrder);
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 5. Enregistrer les participations de l'utilisateur
    const participationsString = localStorage.getItem('participations') || '[]';
    const participations = JSON.parse(participationsString);
    
    items.forEach(item => {
      if (item.lotteryId) {
        for (let i = 0; i < item.quantity; i++) {
          participations.push({
            id: Date.now() + Math.floor(Math.random() * 1000) + i,
            userId: customerInfo.id,
            lotteryId: item.lotteryId,
            productId: item.id,
            ticketNumber: `T${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString()
          });
        }
      }
    });
    
    localStorage.setItem('participations', JSON.stringify(participations));
    
    // 6. Si l'utilisateur n'est pas connecté, créer un nouvel utilisateur
    if (!user && shippingInfo) {
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      const newClient = {
        id: customerInfo.id,
        name: shippingInfo.name,
        email: shippingInfo.email,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        orderCount: 1,
        totalSpent: subtotal + shippingCost
      };
      
      clients.push(newClient);
      localStorage.setItem('clients', JSON.stringify(clients));
      
      // Envoyer un email de bienvenue
      simulateSendEmail(
        shippingInfo.email,
        "Bienvenue chez WinShirt - Votre compte a été créé",
        `Bonjour ${shippingInfo.name},\n\nVotre compte a été créé suite à votre commande. Vous pouvez vous connecter avec l'email ${shippingInfo.email} et demander un nouveau mot de passe si nécessaire.\n\nMerci pour votre commande !\n\nL'équipe WinShirt`
      );
    }
    
    // Vider le panier après achat réussi
    localStorage.setItem('cart', '[]');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la simulation d\'achat:', error);
    return false;
  }
};

// Fonction pour configurer Stripe (sera appelée lors de l'initialisation de l'application)
export const setupStripe = () => {
  // Ici, vous pourriez initialiser Stripe avec votre clé publique
  // Cette fonction serait appelée au démarrage de l'application
  console.log('Stripe setup with key:', STRIPE_PUBLIC_KEY);
  
  // Charger le script Stripe au démarrage
  loadStripeScript().catch(error => {
    console.error("Erreur lors du chargement du script Stripe:", error);
  });
};

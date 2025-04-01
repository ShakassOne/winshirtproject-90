
import { toast } from './toast';

const STRIPE_PUBLIC_KEY = 'pk_test_51abcdefghijklmnopqrstuvwxyz'; // Remplacez par votre clé publique Stripe

// Add a type declaration for the Stripe global object
declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

export const initiateStripeCheckout = async (
  items: Array<{ id: string | number; name: string; price: number; quantity: number }>
) => {
  try {
    // Afficher un message d'initialisation
    toast.info('Initialisation du paiement...');
    
    console.log('Items for checkout:', items);
    
    // Calculer le montant total
    const amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Dans un environnement de production, vous appelleriez un backend
    // Ici, nous simulons le processus pour la démonstration
    if (typeof window !== 'undefined' && window.Stripe) {
      // Si le script Stripe est chargé
      handleStripeCheckout(items, amount);
    } else {
      // Charger le script Stripe dynamiquement
      loadStripeScript().then(() => {
        handleStripeCheckout(items, amount);
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    toast.error('Erreur lors de l\'initialisation du paiement');
    return { success: false, error };
  }
};

// Fonction pour charger le script Stripe
const loadStripeScript = () => {
  return new Promise((resolve, reject) => {
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
const handleStripeCheckout = (items: Array<{ id: string | number; name: string; price: number; quantity: number }>, amount: number) => {
  toast.success('Redirection vers Stripe...');
  
  // Simulation - Dans un environnement de production, vous créeriez une session checkout avec Stripe
  setTimeout(() => {
    // Simuler un achat réussi
    const orderSuccessful = simulateSuccessfulOrder(items);
    
    if (orderSuccessful) {
      // Si la commande est réussie, enregistrer l'achat et lier à la loterie
      toast.success('Paiement réussi !');
      
      // Rediriger vers une page de confirmation
      setTimeout(() => {
        window.location.href = '/account';
      }, 1500);
    } else {
      toast.error('Échec du paiement');
    }
  }, 1500);
};

// Fonction pour simuler un achat réussi
const simulateSuccessfulOrder = (items: Array<{ id: string | number; name: string; price: number; quantity: number }>) => {
  try {
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
      // Trouver le produit
      const product = products.find((p: any) => p.id.toString() === item.id.toString());
      
      if (product && product.linkedLotteries && product.linkedLotteries.length > 0) {
        // Pour chaque loterie liée au produit
        product.linkedLotteries.forEach((lotteryId: number) => {
          // Trouver la loterie
          const lotteryIndex = lotteries.findIndex((l: any) => l.id === lotteryId);
          
          if (lotteryIndex !== -1) {
            // Créer un participant simulé
            const mockParticipant = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              name: 'Client Test',
              email: 'client@example.com',
              avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70)
            };
            
            // Si participants n'existe pas, l'initialiser
            if (!lotteries[lotteryIndex].participants) {
              lotteries[lotteryIndex].participants = [];
            }
            
            // Ajouter le participant à la loterie (pour chaque quantité achetée)
            for (let i = 0; i < item.quantity; i++) {
              lotteries[lotteryIndex].participants.push({...mockParticipant, id: mockParticipant.id + i});
              // Incrémenter le nombre de participants
              lotteries[lotteryIndex].currentParticipants += 1;
            }
          }
        });
      }
    });
    
    // 3. Enregistrer les loteries mises à jour
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    sessionStorage.setItem('lotteries', JSON.stringify(lotteries));
    
    // 4. Simuler un enregistrement de commande
    const ordersString = localStorage.getItem('orders') || '[]';
    const orders = JSON.parse(ordersString);
    
    const newOrder = {
      id: Date.now(),
      clientId: 1,
      clientName: 'Client Test',
      clientEmail: 'client@example.com',
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
          size: 'M',
          color: 'Noir',
          lotteriesEntries: product?.linkedLotteries || []
        };
      }),
      shipping: {
        address: '123 Rue Exemple',
        city: 'Paris',
        postalCode: '75000',
        country: 'France',
        method: 'Standard',
        cost: 5.99
      },
      payment: {
        method: 'Stripe',
        transactionId: 'txn_' + Date.now(),
        status: 'completed'
      },
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.99,
      trackingNumber: 'TRK' + Date.now(),
      notes: 'Commande simulée'
    };
    
    orders.push(newOrder);
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
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
};

// Documentation pour la configuration Stripe:
/*
Pour configurer Stripe complètement, vous devrez:

1. Créer un compte Stripe (https://dashboard.stripe.com/register)
2. Obtenir vos clés API depuis le tableau de bord Stripe (https://dashboard.stripe.com/apikeys)
3. Remplacer STRIPE_PUBLIC_KEY par votre clé publique
4. Pour une implémentation complète en production:
   - Créer une fonction backend (Supabase Edge Function) pour générer des sessions de paiement
   - Utiliser Stripe.js et les Elements pour les formulaires de carte
   - Configurer les webhooks pour recevoir les événements de paiement

Documentation Stripe: https://stripe.com/docs
*/

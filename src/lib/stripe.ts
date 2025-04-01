
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

export const initiateStripeCheckout = async (
  items: Array<CheckoutItem>
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
const handleStripeCheckout = (items: Array<CheckoutItem>, amount: number) => {
  toast.success('Simulation de paiement Stripe...');
  
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
const simulateSuccessfulOrder = (items: Array<CheckoutItem>) => {
  try {
    // Récupérer l'utilisateur actuellement connecté
    const userString = localStorage.getItem('winshirt_user');
    if (!userString) {
      console.error('Aucun utilisateur connecté');
      return false;
    }
    
    const user = JSON.parse(userString);
    
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
            name: user.name,
            email: user.email,
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
    
    const newOrder = {
      id: Date.now(),
      clientId: user.id,
      clientName: user.name,
      clientEmail: user.email,
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
            userId: user.id,
            lotteryId: item.lotteryId,
            productId: item.id,
            ticketNumber: `T${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString()
          });
        }
      }
    });
    
    localStorage.setItem('participations', JSON.stringify(participations));
    
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


import { toast } from './toast';
import { simulateSendEmail } from '@/contexts/AuthContext';
import { StripeCheckoutResult } from '@/types/checkout';
import { ExtendedLottery } from '@/types/lottery';
import { supabase } from '@/integrations/supabase/client';

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
  image?: string; // Add missing image property here
  selectedLotteries?: Array<{id: number, name: string}>;
  visualDesign?: {
    visualId: number;
    visualName: string;
    visualImage: string;
    settings: any;
    printAreaId: number | null;
  } | null;
}

export const initiateStripeCheckout = async (
  items: Array<CheckoutItem>
): Promise<StripeCheckoutResult> => {
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
      return handleStripeCheckout(items, amount);
    } else {
      // Charger le script Stripe dynamiquement
      await loadStripeScript();
      return handleStripeCheckout(items, amount);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    toast.error('Erreur lors de l\'initialisation du paiement');
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
};

// Fonction pour charger le script Stripe
const loadStripeScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('stripe-script')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'stripe-script';
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Impossible de charger le script Stripe'));
    };
    
    document.body.appendChild(script);
  });
};

// Fonction pour gérer le checkout avec Stripe
const handleStripeCheckout = (items: Array<CheckoutItem>, amount: number): StripeCheckoutResult => {
  toast.success('Simulation de paiement Stripe...');
  
  // Simulation - Dans un environnement de production, vous créeriez une session checkout avec Stripe
  try {
    // Simuler un achat réussi
    const orderSuccessful = simulateSuccessfulOrder(items);
    
    if (orderSuccessful) {
      // Si la commande est réussie, enregistrer l'achat et lier à la loterie
      toast.success('Paiement réussi !');
      
      // Dans un vrai environnement, on retournerait l'URL de redirection Stripe
      return { 
        success: true,
        orderId: Date.now()
      };
    } else {
      return { 
        success: false, 
        error: 'Échec du paiement' 
      };
    }
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du paiement' 
    };
  }
};

// Fonction pour simuler un achat réussi
const simulateSuccessfulOrder = async (items: Array<CheckoutItem>): Promise<boolean> => {
  try {
    // Récupérer l'utilisateur actuellement connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Créer ou mettre à jour le compte client
    if (user) {
      // Pour la table clients dans Supabase, utiliser user_id comme colonne pour l'ID d'utilisateur
      const { error: clientError } = await supabase
        .from('clients')
        .upsert({
          user_id: user.id,
          name: user.user_metadata.full_name || user.email?.split('@')[0],
          email: user.email,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (clientError) {
        console.error('Erreur lors de la création du compte client:', clientError);
        return false;
      }
    }
    
    // 2. Mettre à jour les loteries
    const lotteryUpdates = items.flatMap(item => 
      (item.selectedLotteries || []).map(lottery => ({
        id: lottery.id,
        currentParticipants: item.quantity
      }))
    );
    
    for (const update of lotteryUpdates) {
      const { error } = await supabase
        .from('lotteries')
        .update({ 
          current_participants: supabase.rpc('increment', { row_id: update.id, num_increment: update.currentParticipants, field_name: 'current_participants' })
        })
        .eq('id', update.id);
      
      if (error) {
        console.error(`Erreur lors de la mise à jour de la loterie ${update.id}:`, error);
        return false;
      }
    }
    
    console.log("Simulant une commande réussie avec les articles:", items);
    
    // Récupérer l'utilisateur actuellement connecté
    const userString = localStorage.getItem('winshirt_user');
    let userLocal = null;
    
    if (userString) {
      userLocal = JSON.parse(userString);
    }
    
    // 1. Récupérer les loteries et les produits
    const lotteriesString = localStorage.getItem('lotteries');
    const productsString = localStorage.getItem('products');
    
    if (!lotteriesString || !productsString) {
      console.error('Données des loteries ou produits manquantes');
      return false;
    }
    
    const lotteries = JSON.parse(lotteriesString) as ExtendedLottery[];
    const products = JSON.parse(productsString);
    
    // 2. Pour chaque article acheté, mettre à jour les participants de la loterie associée
    items.forEach(item => {
      // Vérifier si l'article a des loteries sélectionnées
      if (item.selectedLotteries && item.selectedLotteries.length > 0) {
        item.selectedLotteries.forEach(selectedLottery => {
          // Trouver la loterie
          const lotteryIndex = lotteries.findIndex((l: ExtendedLottery) => l.id === selectedLottery.id);
          
          if (lotteryIndex !== -1) {
            console.log(`Mise à jour de la loterie ID:${selectedLottery.id}, index:${lotteryIndex}, participants actuels:${lotteries[lotteryIndex].currentParticipants}`);
            
            // Créer un participant basé sur l'utilisateur connecté ou simuler un utilisateur anonyme
            const participant = userLocal 
              ? {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  name: userLocal.name,
                  email: userLocal.email,
                  avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
                }
              : {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  name: "Client anonyme",
                  email: "anonymous@example.com",
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
            
            console.log(`Loterie ${lotteries[lotteryIndex].title} mise à jour: Participants maintenant à ${lotteries[lotteryIndex].currentParticipants}`);
            
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
          } else {
            console.error(`Loterie non trouvée avec l'ID ${selectedLottery.id}`);
          }
        });
      }
    });
    
    // 3. Enregistrer les loteries mises à jour
    localStorage.setItem('lotteries', JSON.stringify(lotteries));
    sessionStorage.setItem('lotteries', JSON.stringify(lotteries));
    console.log("Loteries mises à jour et sauvegardées:", lotteries);
    
    // 4. Enregistrer la commande pour l'utilisateur actuel
    const lastOrderDetailsString = localStorage.getItem('lastOrderDetails');
    const lastOrderDetails = lastOrderDetailsString ? JSON.parse(lastOrderDetailsString) : null;
    
    const ordersString = localStorage.getItem('orders') || '[]';
    const orders = JSON.parse(ordersString);
    
    const newOrder = {
      id: Date.now(),
      clientId: userLocal?.id || null,
      clientName: lastOrderDetails?.customerInfo?.fullName || userLocal?.name || 'Client anonyme',
      clientEmail: lastOrderDetails?.customerInfo?.email || userLocal?.email || 'anonymous@example.com',
      orderDate: new Date().toISOString(),
      status: 'processing',
      items: items.map(item => {
        return {
          id: Date.now() + Math.floor(Math.random() * 1000),
          productId: item.id,
          productName: item.name,
          productImage: item.image || 'https://placehold.co/600x400/png',
          quantity: item.quantity,
          price: item.price,
          size: item.size || 'M',
          color: item.color || 'Noir',
          lotteriesEntries: item.selectedLotteries ? item.selectedLotteries.map(l => l.id) : [],
          visualDesign: item.visualDesign || null // Conserver les informations du visuel
        };
      }),
      shipping: lastOrderDetails?.shippingAddress ? {
        address: lastOrderDetails.shippingAddress.address,
        city: lastOrderDetails.shippingAddress.city,
        postalCode: lastOrderDetails.shippingAddress.postalCode,
        country: lastOrderDetails.shippingAddress.country,
        method: lastOrderDetails.shippingMethod || 'Standard',
        cost: lastOrderDetails.shippingCost || 5.99
      } : {
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
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (lastOrderDetails?.shippingCost || 5.99),
      trackingNumber: 'TRK' + Date.now(),
      notes: lastOrderDetails?.orderNotes || '',
      delivery: {
        status: 'preparing',
        estimatedDeliveryDate: (() => {
          const date = new Date();
          const method = lastOrderDetails?.shippingMethod || 'standard';
          if (method === 'express') date.setDate(date.getDate() + 2);
          else if (method === 'priority') date.setDate(date.getDate() + 1);
          else date.setDate(date.getDate() + 5);
          return date.toISOString();
        })()
      }
    };
    
    orders.push(newOrder);
    console.log("Nouvelle commande créée:", newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 5. Enregistrer les participations de l'utilisateur
    if (userLocal) {
      const participationsString = localStorage.getItem('participations') || '[]';
      const participations = JSON.parse(participationsString);
      
      items.forEach(item => {
        if (item.selectedLotteries && item.selectedLotteries.length > 0) {
          item.selectedLotteries.forEach(selectedLottery => {
            for (let i = 0; i < item.quantity; i++) {
              participations.push({
                id: Date.now() + Math.floor(Math.random() * 1000) + i,
                userId: userLocal.id,
                lotteryId: selectedLottery.id,
                productId: item.id,
                ticketNumber: `T${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
                date: new Date().toISOString()
              });
            }
          });
        }
      });
      
      localStorage.setItem('participations', JSON.stringify(participations));
    }
    
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

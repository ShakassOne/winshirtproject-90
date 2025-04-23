
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
  image?: string;
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

// Fonction pour simuler un achat réussi - Utilise Supabase au lieu de localStorage
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
    
    // 2. Mettre à jour les loteries sélectionnées
    const lotteryUpdates = items.flatMap(item => 
      (item.selectedLotteries || []).map(lottery => ({
        id: lottery.id,
        currentParticipants: item.quantity
      }))
    );
    
    for (const update of lotteryUpdates) {
      try {
        // Récupérer la loterie actuelle
        const { data, error } = await supabase
          .from('lotteries')
          .select('current_participants')
          .eq('id', update.id)
          .single();
          
        if (error) {
          console.error(`Erreur lors de la récupération de la loterie ${update.id}:`, error);
          continue;
        }
        
        // Calculer la nouvelle valeur
        const newParticipants = (data.current_participants || 0) + update.currentParticipants;
        
        // Mettre à jour directement avec la nouvelle valeur
        const { error: updateError } = await supabase
          .from('lotteries')
          .update({ current_participants: newParticipants })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`Erreur lors de la mise à jour de la loterie ${update.id}:`, updateError);
        }
      } catch (error) {
        console.error(`Exception lors de la mise à jour de la loterie ${update.id}:`, error);
      }
    }
    
    console.log("Simulant une commande réussie avec les articles:", items);
    
    // 3. Créer la commande dans Supabase
    let orderId = Date.now();
    const orderData = {
      user_id: user ? parseInt(user.id.substring(0, 8), 16) : null, // Convertir UUID en nombre
      status: 'processing',
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.99,
      shipping_address: {
        address: '123 Rue Exemple',
        city: 'Paris',
        postalCode: '75000',
        country: 'France'
      },
      shipping_method: 'standard',
      shipping_cost: 5.99,
      payment_method: 'Stripe',
      payment_status: 'completed',
      created_at: new Date().toISOString()
    };
    
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();
    
    if (orderError) {
      console.error('Erreur lors de la création de la commande:', orderError);
      return false;
    }
    
    orderId = orderResult.id;
    
    // 4. Ajouter les articles de la commande
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      quantity: item.quantity,
      price: item.price,
      customization: item.visualDesign ? {
        visualId: item.visualDesign.visualId,
        visualName: item.visualDesign.visualName,
        visualImage: item.visualDesign.visualImage,
        settings: item.visualDesign.settings,
        printAreaId: item.visualDesign.printAreaId
      } : null,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Erreur lors de l\'ajout des articles de la commande:', itemsError);
      return false;
    }
    
    // 5. Ajouter les participants à la loterie
    if (user) {
      for (const item of items) {
        if (item.selectedLotteries && item.selectedLotteries.length > 0) {
          for (const selectedLottery of item.selectedLotteries) {
            for (let i = 0; i < item.quantity; i++) {
              const userId = parseInt(user.id.substring(0, 8), 16);
              
              const participantData = {
                lottery_id: selectedLottery.id,
                user_id: userId,
                name: user.user_metadata.full_name || user.email?.split('@')[0],
                email: user.email,
                avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              };
              
              const { error: participantError } = await supabase
                .from('lottery_participants')
                .insert(participantData);
              
              if (participantError) {
                console.error('Erreur lors de l\'ajout du participant:', participantError);
              }
              
              // Vérifier si la loterie a atteint le nombre cible de participants
              const { data: lottery, error: lotteryError } = await supabase
                .from('lotteries')
                .select('current_participants, target_participants')
                .eq('id', selectedLottery.id)
                .single();
              
              if (!lotteryError && lottery && lottery.current_participants >= lottery.target_participants) {
                // Si oui, programmer un tirage automatique dans 24 heures
                const drawDate = new Date();
                drawDate.setDate(drawDate.getDate() + 1); // +24 heures
                
                const { error: updateLotteryError } = await supabase
                  .from('lotteries')
                  .update({ draw_date: drawDate.toISOString() })
                  .eq('id', selectedLottery.id)
                  .is('draw_date', null);
                
                if (updateLotteryError) {
                  console.error('Erreur lors de la mise à jour de la date de tirage:', updateLotteryError);
                } else {
                  // Notifier les administrateurs qu'une loterie a atteint son objectif
                  const adminEmails = ['admin@winshirt.com'];
                  
                  adminEmails.forEach(email => {
                    simulateSendEmail(
                      email,
                      "Loterie complète - Tirage programmé",
                      `La loterie "${selectedLottery.name}" a atteint son objectif de ${lottery.target_participants} participants. Un tirage est programmé pour le ${new Date(drawDate).toLocaleString('fr-FR')}.`
                    );
                  });
                }
              }
            }
          }
        }
      }
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

// Fonction utilitaire pour supprimer toutes les données de Supabase
export const clearAllData = async (): Promise<boolean> => {
  try {
    // Liste des tables à vider dans l'ordre pour éviter les problèmes de clés étrangères
    const tables = [
      'order_items',
      'orders',
      'lottery_winners',
      'lottery_participants',
      'lotteries',
      'products',
      'visuals',
      'clients'
    ];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 0); // Supprime toutes les lignes
      
      if (error) {
        console.error(`Erreur lors de la suppression des données de ${table}:`, error);
        return false;
      }
    }
    
    toast.success('Toutes les données ont été supprimées avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données:', error);
    toast.error('Erreur lors de la suppression des données');
    return false;
  }
};

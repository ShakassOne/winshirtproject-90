import { toast } from './toast';
import { simulateSendEmail } from '@/contexts/AuthContext';
import { StripeCheckoutResult } from '@/types/checkout';
import { ExtendedLottery } from '@/types/lottery';

// Function to handle successful Stripe checkout
export const handleSuccessfulCheckout = async (result: StripeCheckoutResult, lottery: ExtendedLottery) => {
  if (result && result.paymentIntent) {
    // Payment was successful
    toast.success(`Paiement réussi! ID de transaction: ${result.paymentIntent.id}`);
    
    // Simulate sending a confirmation email
    const emailSent = simulateSendEmail(
      result.paymentIntent.receipt_email || 'test@example.com',
      'Confirmation de votre participation à la loterie',
      `Votre participation à la loterie ${lottery.title} a été confirmée. Merci!`
    );
    
    if (emailSent) {
      console.log('Email de confirmation envoyé.');
    } else {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation.');
    }
  } else if (result && result.error) {
    // Payment failed
    toast.error(`Erreur de paiement: ${result.error.message}`);
  } else {
    // No payment or error information
    toast.error('Le paiement a été annulé ou une erreur inconnue est survenue.');
  }
};

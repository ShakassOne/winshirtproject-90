import { toast } from '@/lib/toast';
import { simulateSendEmail } from '@/utils/mailUtils';

// Stripe API key - in production, this would be stored in environment variables
const STRIPE_API_KEY = 'sk_test_mock_key_for_development';

// Initialize Stripe client
let stripeClient: any = null;

// Mock Stripe functionality for development
export const initializeStripe = async () => {
  console.log('Initializing mock Stripe client');
  stripeClient = {
    checkout: {
      sessions: {
        create: createMockCheckoutSession,
      },
      paymentIntents: {
        retrieve: retrieveMockPaymentIntent,
      },
    },
  };
  return stripeClient;
};

// Create a mock checkout session
const createMockCheckoutSession = async (options: any) => {
  console.log('Creating mock checkout session with options:', options);
  
  // Generate a mock session ID
  const sessionId = `cs_mock_${Math.random().toString(36).substring(2, 15)}`;
  
  // Return a mock session object
  return {
    id: sessionId,
    url: `https://mock-checkout.stripe.com/${sessionId}`,
    payment_status: 'unpaid',
    status: 'open',
    customer: options.customer || null,
    metadata: options.metadata || {},
  };
};

// Retrieve a mock payment intent
const retrieveMockPaymentIntent = async (id: string) => {
  console.log('Retrieving mock payment intent:', id);
  
  // Return a mock payment intent object
  return {
    id: id,
    status: 'succeeded',
    amount: 5000, // $50.00
    currency: 'eur',
    payment_method: 'pm_card_visa',
    customer: 'cus_mock_customer',
    metadata: {},
  };
};

// Process a payment
export const processPayment = async (
  amount: number,
  currency: string = 'eur',
  customerEmail: string,
  metadata: any = {}
) => {
  try {
    if (!stripeClient) {
      await initializeStripe();
    }
    
    console.log(`Processing payment of ${amount} ${currency} for ${customerEmail}`);
    
    // Create a mock checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'WinShirt Order',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cart`,
      customer_email: customerEmail,
      metadata,
    });
    
    // Send confirmation email
    simulateSendEmail(
      customerEmail,
      'Votre paiement WinShirt',
      `Merci pour votre paiement de ${amount / 100} ${currency.toUpperCase()}. Votre commande est en cours de traitement.`
    );
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    toast.error('Erreur lors du traitement du paiement');
    return {
      success: false,
      error,
    };
  }
};

// Verify a payment
export const verifyPayment = async (sessionId: string) => {
  try {
    if (!stripeClient) {
      await initializeStripe();
    }
    
    console.log(`Verifying payment for session: ${sessionId}`);
    
    // In a real implementation, we would retrieve the session and check its payment status
    const paymentIntent = await stripeClient.checkout.paymentIntents.retrieve(sessionId);
    
    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntent,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error,
    };
  }
};

export default {
  initializeStripe,
  processPayment,
  verifyPayment,
};

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// Detect if user has provided a valid Stripe test secret key (starts with sk_test_)
export const isRealStripeConfigured = () => {
  return (
    stripeSecretKey.startsWith('sk_test_') &&
    !stripeSecretKey.includes('placeholder') &&
    stripeSecretKey.length > 25
  );
};

let stripeInstance = null;

if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  });
}

export const getStripe = () => {
  if (!stripeInstance) {
    // If not yet initialized or initialized with fallback
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeInstance;
};

export default getStripe;

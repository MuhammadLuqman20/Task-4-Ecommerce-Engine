import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#94a3b8',
      },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// 1. Live Stripe Elements Form (Only mounted inside <Elements> wrapper)
const RealStripeFormInner = ({ clientSecret, paymentIntentId, shippingAddress, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setErrorMessage(null);
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Stripe card element could not be loaded');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: 'US',
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment incomplete: status is ${result.paymentIntent.status}`);
      }

      // Server-side verification and order creation
      const verifyRes = await api.post('/checkout/verify-payment', {
        paymentIntentId: result.paymentIntent.id,
        shippingAddress,
      });

      if (verifyRes.data.success) {
        await fetchCart();
        navigate(`/order-success/${verifyRes.data.data._id}`, {
          state: { order: verifyRes.data.data },
        });
      } else {
        throw new Error(verifyRes.data.message || 'Payment verification failed on server');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'An unexpected payment error occurred'
      );
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="sandbox-banner">
        <ShieldCheck size={20} className="text-indigo-400" />
        <div>
          <strong>Stripe Test Sandbox Active:</strong> Card payments are in test mode. No real money will be charged.
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Credit / Debit Card Details
          </label>
          <CreditCard size={18} className="text-gray-400" />
        </div>
        <div style={{ padding: '0.6rem 0' }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <button type="submit" disabled={processing} className="btn btn-primary btn-full btn-lg">
        {processing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="spinner" />
            <span>Verifying with Stripe...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={17} />
            <span>Pay ${totalAmount.toFixed(2)} USD</span>
          </div>
        )}
      </button>
    </form>
  );
};

// 2. Sandbox Test Card Form (Does NOT call useStripe, runs without external API dependencies)
const SandboxForm = ({ paymentIntentId, shippingAddress, totalAmount }) => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [testCardNumber, setTestCardNumber] = useState('4242 4242 4242 4242');
  const [testExp, setTestExp] = useState('12/28');
  const [testCvc, setTestCvc] = useState('123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setProcessing(true);

    try {
      const cleanCard = testCardNumber.replace(/\s+/g, '');

      // Simulate Stripe decline responses for test cards
      if (cleanCard === '4000000000000002') {
        throw new Error('Your card was declined. (Stripe Test Decline Card triggered)');
      }
      if (cleanCard === '4000000000009995') {
        throw new Error('Your card has insufficient funds. (Stripe Test Code 9995 triggered)');
      }

      // Simulate 1s gateway response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Server-side payment verification and safe order creation
      const verifyRes = await api.post('/checkout/verify-payment', {
        paymentIntentId,
        shippingAddress,
      });

      if (verifyRes.data.success) {
        await fetchCart();
        navigate(`/order-success/${verifyRes.data.data._id}`, {
          state: { order: verifyRes.data.data },
        });
      } else {
        throw new Error(verifyRes.data.message || 'Payment verification failed on server');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'An unexpected payment error occurred'
      );
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="sandbox-banner">
        <ShieldCheck size={20} className="text-indigo-400" />
        <div>
          <strong>Stripe Sandbox Simulator Active:</strong> Test any scenario using pre-filled Stripe test cards.
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Credit / Debit Card Details
          </label>
          <CreditCard size={18} className="text-gray-400" />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={testCardNumber}
            onChange={(e) => setTestCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.05em' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input
            type="text"
            value={testExp}
            onChange={(e) => setTestExp(e.target.value)}
            placeholder="MM/YY"
            style={{ width: '100%', fontFamily: 'monospace' }}
            required
          />
          <input
            type="text"
            value={testCvc}
            onChange={(e) => setTestCvc(e.target.value)}
            placeholder="CVC"
            style={{ width: '100%', fontFamily: 'monospace' }}
            required
          />
        </div>

        {/* Quick Test Card Buttons */}
        <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            onClick={() => setTestCardNumber('4242 4242 4242 4242')}
          >
            Use 4242 (Success)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#ef4444' }}
            onClick={() => setTestCardNumber('4000 0000 0000 0002')}
          >
            Test Decline Card
          </button>
        </div>
      </div>

      <button type="submit" disabled={processing} className="btn btn-primary btn-full btn-lg">
        {processing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="spinner" />
            <span>Verifying Payment with Server...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={17} />
            <span>Pay ${totalAmount.toFixed(2)} USD</span>
          </div>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.85rem' }}>
        Processed securely via Stripe Sandbox. Inventory will deduct only upon confirmed charge.
      </p>
    </form>
  );
};

// 3. Main Export Component
const StripeCardForm = ({
  stripePromise,
  clientSecret,
  paymentIntentId,
  isSandboxMock,
  shippingAddress,
  totalAmount,
}) => {
  if (stripePromise && !isSandboxMock && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <RealStripeFormInner
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
          shippingAddress={shippingAddress}
          totalAmount={totalAmount}
        />
      </Elements>
    );
  }

  return (
    <SandboxForm
      paymentIntentId={paymentIntentId}
      shippingAddress={shippingAddress}
      totalAmount={totalAmount}
    />
  );
};

export default StripeCardForm;

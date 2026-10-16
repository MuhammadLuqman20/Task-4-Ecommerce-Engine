import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { ShieldCheck, ArrowLeft, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StripeCardForm from '../components/checkout/StripeCardForm';
import { getFallbackImage } from '../utils/imageFallback';

// Lazy load Stripe if a publishable key is present and not mock
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const isRealPublishableKey =
  stripeKey.startsWith('pk_test_') && !stripeKey.includes('placeholder');

const stripePromise = isRealPublishableKey ? loadStripe(stripeKey) : null;

const CheckoutPage = () => {
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Jane Doe',
    address: '100 Silicon Way, Suite 400',
    city: 'San Francisco',
    postalCode: '94107',
    country: 'United States',
  });

  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isSandboxMock, setIsSandboxMock] = useState(true);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Initialize PaymentIntent when cart items are available
  useEffect(() => {
    if (cartLoading) return;

    if (!cart.items || cart.items.length === 0) {
      setLoadingIntent(false);
      return;
    }

    const initPaymentIntent = async () => {
      try {
        setLoadingIntent(true);
        setErrorMessage(null);

        const res = await api.post('/checkout/create-payment-intent');
        if (res.data.success) {
          setClientSecret(res.data.clientSecret);
          setPaymentIntentId(res.data.paymentIntentId);
          setIsSandboxMock(res.data.isSandboxMock);
        } else {
          setErrorMessage(res.data.message || 'Could not initiate checkout intent');
        }
      } catch (err) {
        console.error('Failed to create PaymentIntent:', err);
        setErrorMessage(
          err.response?.data?.message || 'Failed to initialize payment session with server.'
        );
      } finally {
        setLoadingIntent(false);
      }
    };

    initPaymentIntent();
  }, [cart.items, cartLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  // 1. If cart is still loading
  if (cartLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  // 2. If cart is empty
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="glass-panel" style={{ maxWidth: '540px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <ShoppingBag size={50} className="text-gray-500" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            You need to add at least one product to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse Product Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link
        to="/cart"
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '2rem', display: 'inline-flex' }}
      >
        <ArrowLeft size={16} /> Return to Shopping Cart
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Secure Checkout</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Complete your delivery details and finalize payment in Stripe Sandbox test mode.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="cart-layout">
        {/* Main Column: Shipping & Stripe Card Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Address */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} className="text-indigo-400" />
              <span>1. Shipping Information</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  placeholder="123 Example Street"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} className="text-pink-400" />
              <span>2. Payment Details</span>
            </h3>

            {loadingIntent ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Connecting securely to Stripe Sandbox Engine...
                </p>
              </div>
            ) : clientSecret || paymentIntentId ? (
              <StripeCardForm
                stripePromise={stripePromise}
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                isSandboxMock={isSandboxMock}
                shippingAddress={shippingAddress}
                totalAmount={cart.grandTotal}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
                  Unable to initialize payment session. Please verify your cart items.
                </p>
                <Link to="/cart" className="btn btn-secondary btn-sm">
                  Review Cart
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Side Column: Order Items Summary */}
        <div>
          <div className="summary-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Review Order</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {cart.items.map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.title}
                    style={{ width: '48px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(item.product?.category, item.product?.title);
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product?.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Qty: {item.quantity} &times; ${item.product?.price?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    ${item.itemSubtotal?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cart.subtotal?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${cart.tax?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{cart.shipping === 0 ? 'FREE' : `$${cart.shipping?.toFixed(2)}`}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total to Charge</span>
              <span>${cart.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

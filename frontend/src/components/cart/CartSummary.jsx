import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Truck } from 'lucide-react';

const CartSummary = ({ cart, onCheckout, isCheckingOut = false }) => {
  return (
    <div className="summary-card">
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Order Summary</h3>

      <div className="summary-row">
        <span>Items Subtotal ({cart.totalItems})</span>
        <span>${cart.subtotal.toFixed(2)}</span>
      </div>

      <div className="summary-row">
        <span>Estimated Tax (8%)</span>
        <span>${cart.tax.toFixed(2)}</span>
      </div>

      <div className="summary-row">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Truck size={15} className="text-gray-400" /> Shipping
        </span>
        <span>
          {cart.shipping === 0 ? (
            <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
          ) : (
            `$${cart.shipping.toFixed(2)}`
          )}
        </span>
      </div>

      {cart.subtotal < 100 && cart.subtotal > 0 && (
        <div style={{ fontSize: '0.78rem', color: '#818cf8', marginBottom: '0.75rem' }}>
          Add ${(100 - cart.subtotal).toFixed(2)} more for Free Shipping!
        </div>
      )}

      <div className="summary-divider" />

      <div className="summary-total">
        <span>Estimated Total</span>
        <span>${cart.grandTotal.toFixed(2)}</span>
      </div>

      {onCheckout ? (
        <button
          onClick={onCheckout}
          disabled={cart.items.length === 0 || isCheckingOut}
          className="btn btn-primary btn-full btn-lg"
        >
          {isCheckingOut ? (
            <div className="spinner" />
          ) : (
            <>
              Proceed to Checkout <ArrowRight size={18} />
            </>
          )}
        </button>
      ) : (
        <Link
          to="/checkout"
          className="btn btn-primary btn-full btn-lg"
          style={{ pointerEvents: cart.items.length === 0 ? 'none' : 'auto', opacity: cart.items.length === 0 ? 0.6 : 1 }}
        >
          Proceed to Checkout <ArrowRight size={18} />
        </Link>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
        }}
      >
        <Lock size={13} />
        <span>256-Bit Encrypted Stripe Sandbox</span>
      </div>
    </div>
  );
};

export default CartSummary;

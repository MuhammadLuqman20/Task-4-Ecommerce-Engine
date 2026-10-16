import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => {
  const { cart, loading, clearCart, cartError } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <ShoppingBag size={48} className="text-indigo-400" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Your Cart is Waiting</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Please sign in to view your persistent shopping cart and synchronize your saved items across all devices.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review your selected items before proceeding to the Stripe Checkout Sandbox.
          </p>
        </div>

        {hasItems && (
          <button
            onClick={clearCart}
            className="btn btn-secondary btn-sm"
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={15} /> Clear Cart
          </button>
        )}
      </div>

      {cartError && (
        <div className="alert alert-danger">
          <span>{cartError}</span>
        </div>
      )}

      {loading && !hasItems ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" />
        </div>
      ) : !hasItems ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
          <ShoppingBag size={54} className="text-gray-500" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your shopping cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <ArrowLeft size={18} /> Discover Catalog Items
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-list">
            {cart.items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}

            <div style={{ marginTop: '1rem' }}>
              <Link to="/products" className="btn btn-secondary btn-sm">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

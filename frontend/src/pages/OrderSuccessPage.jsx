import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import api from '../services/api';
import { getFallbackImage } from '../utils/imageFallback';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${id}`);
          if (res.data.success) {
            setOrder(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load order receipt:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={52} />
        </div>

        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Payment Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 1.5rem' }}>
          Thank you for your test order. Your Stripe payment was verified server-side, stock was atomically updated, and your order has been placed.
        </p>

        <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
            Payment Status: Paid
          </span>
          <span className="badge badge-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
            Order ID: {id}
          </span>
        </div>
      </div>

      {order && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} className="text-indigo-400" />
            <span>Order Summary & Receipt</span>
          </h3>

          {/* Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getFallbackImage('Product', item.title);
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              background: 'var(--bg-secondary)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <MapPin size={15} /> Delivery Address
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.shippingAddress.fullName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <CreditCard size={15} /> Payment Method
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Stripe Sandbox (Test Mode)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Intent: {order.paymentInfo?.stripePaymentIntentId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Financial Breakdown
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Subtotal:</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Tax:</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Shipping:</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>Total Paid:</span>
                <span style={{ color: '#10b981' }}>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.print()}
          className="btn btn-secondary"
          title="Print or Save PDF Receipt"
        >
          Print Receipt
        </button>
        <Link to="/orders" className="btn btn-primary">
          <Package size={17} /> View My Order History
        </Link>
        <Link to="/products" className="btn btn-secondary">
          Continue Shopping <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

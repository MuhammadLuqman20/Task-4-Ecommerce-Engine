import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { getFallbackImage } from '../utils/imageFallback';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          View all your previous purchases, verified payment intents, and delivery receipts.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
          <Package size={54} className="text-gray-500" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No orders placed yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            When you complete a test checkout with our Stripe sandbox, your order receipt will appear here.
          </p>
          <Link to="/products" className="btn btn-primary">
            <ShoppingBag size={17} /> Explore Products Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={order._id} className="glass-panel" style={{ padding: '1.75rem' }}>
                {/* Header Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Order #{order._id.substring(0, 8)}...</span>
                      <span className={`badge ${order.orderStatus === 'delivered' ? 'badge-success' : order.orderStatus === 'shipped' ? 'badge-primary' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {order.orderStatus || 'processing'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      <Calendar size={13} /> {formattedDate}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      ${order.totalPrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items Total
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '48px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackImage('Product', item.title);
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    background: 'var(--bg-secondary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CreditCard size={14} className="text-indigo-400" />
                    <span>Stripe Intent: <code style={{ color: 'var(--text-main)' }}>{order.paymentInfo?.stripePaymentIntentId}</code></span>
                  </div>

                  <Link to={`/order-success/${order._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                    View Full Receipt <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, Edit2, Trash2, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getFallbackImage } from '../utils/imageFallback';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Modal / Form state for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
    stockQuantity: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
      }
      if (orderRes.data.success) {
        setOrders(orderRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity < 5).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Electronics',
      imageUrl: '',
      stockQuantity: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      category: prod.category,
      imageUrl: prod.imageUrl,
      stockQuantity: prod.stockQuantity,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFeedbackMsg(null);

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, formData);
        if (res.data.success) {
          setFeedbackMsg('Product updated successfully');
        }
      } else {
        const res = await api.post('/products', formData);
        if (res.data.success) {
          setFeedbackMsg('Product created successfully');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setFeedbackMsg('Product removed from catalog');
      fetchData();
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: newStatus.toLowerCase(),
              }
            : o
        )
      );

      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setFeedbackMsg(`Order #${orderId.substring(0, 8)} status updated to ${newStatus.toUpperCase()}`);
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      setFeedbackMsg(err.response?.data?.message || 'Failed to update order status');
      fetchData();
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage store inventory, catalog items, and view live customer orders.
          </p>
        </div>

        {activeTab === 'products' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <Check size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>
            <DollarSign size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${totalRevenue.toFixed(2)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Processed Revenue</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ color: '#059669', marginBottom: '0.4rem' }}>
            <ShoppingBag size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{orders.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer Orders</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ color: '#0284c7', marginBottom: '0.4rem' }}>
            <Package size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Catalog Items</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ color: '#d97706', marginBottom: '0.4rem' }}>
            <AlertCircle size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{lowStockCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Low Stock Warnings (&lt;5)</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`category-pill ${activeTab === 'products' ? 'active' : ''}`}
        >
          Product Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`category-pill ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'products' ? (
        /* Products Table */
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Product</th>
                <th style={{ padding: '0.9rem 1rem' }}>Category</th>
                <th style={{ padding: '0.9rem 1rem' }}>Price</th>
                <th style={{ padding: '0.9rem 1rem' }}>Stock</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      style={{ width: '44px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackImage(p.category, p.title);
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span className="badge badge-primary">{p.category}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    {p.stockQuantity <= 0 ? (
                      <span className="badge badge-danger">0 Out of Stock</span>
                    ) : p.stockQuantity < 5 ? (
                      <span className="badge badge-warning">{p.stockQuantity} Low Stock</span>
                    ) : (
                      <span className="badge badge-success">{p.stockQuantity} in stock</span>
                    )}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Orders Table */
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Order ID</th>
                <th style={{ padding: '0.9rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.9rem 1rem' }}>Items</th>
                <th style={{ padding: '0.9rem 1rem' }}>Total</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    No customer orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      #{o._id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{o.user?.name || o.shippingAddress?.fullName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {o.items?.length} items ({o.items?.reduce((a, b) => a + b.quantity, 0)} units)
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>${o.totalPrice.toFixed(2)}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <select
                        value={o.orderStatus || 'processing'}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}
                      >
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-dim)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Wireless Pro Earbuds"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="25"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, specifications, build materials..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

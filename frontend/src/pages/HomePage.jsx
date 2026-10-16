import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?limit=4&sort=rating');
        if (res.data.success) {
          setFeaturedProducts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-tag">
            <span>Fast Nationwide Delivery &bull; Verified Quality</span>
          </div>

          <h1 className="hero-title">
            Discover Premium Tech, <br />
            <span className="hero-gradient-text">Devices & Audio Gear</span>
          </h1>

          <p className="hero-subtitle">
            Explore our curated collection of high-performance technology, studio audio systems, and modern workspace essentials.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Catalog <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#4f46e5', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Secure Checkout</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              All transactions are encrypted with 256-bit SSL protocols for completely safe payments.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#059669', marginBottom: '0.75rem' }}>
              <Truck size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Fast Delivery</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Complimentary fast shipping on all orders over $100 with live order tracking.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#db2777', marginBottom: '0.75rem' }}>
              <RotateCcw size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>30-Day Returns</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Hassle-free 30-day money back guarantee with dedicated customer support.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#d97706', marginBottom: '0.75rem' }}>
              <Award size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Official Warranty</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Every product includes a 2-year manufacturer warranty and verified quality guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Featured Devices & Audio</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Hand-picked high performance gear available in our catalog
            </p>
          </div>

          <Link to="/products" className="btn btn-secondary btn-sm">
            View All ({featuredProducts.length > 0 ? 'Catalog' : '8'}) <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

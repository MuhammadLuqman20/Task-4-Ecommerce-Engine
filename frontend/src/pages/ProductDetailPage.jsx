import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getFallbackImage } from '../utils/imageFallback';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setErrorMsg('Product could not be found or is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setErrorMsg(null);
    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res?.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } else {
      setErrorMsg(res?.message || 'Could not add to cart');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          {errorMsg || 'The requested product is missing or inactive.'}
        </p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="container">
      <Link
        to="/products"
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '2rem', display: 'inline-flex' }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          padding: '2rem',
        }}
      >
        {/* Product Image */}
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'cover' }}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFallbackImage(product.category, product.title);
            }}
          />
        </div>

        {/* Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary">{product.category}</span>
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : product.stockQuantity < 5 ? (
              <span className="badge badge-warning">Only {product.stockQuantity} Left in Stock</span>
            ) : (
              <span className="badge badge-success">In Stock ({product.stockQuantity} units)</span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{product.title}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating || 4.8) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{product.rating || 4.8}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ({product.reviewsCount || 24} customer reviews)
            </span>
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              marginBottom: '1.25rem',
            }}
          >
            ${product.price.toFixed(2)}
          </div>

          {/* Description */}
          <div style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
            <p>{product.description}</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quantity & CTA */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Quantity:
                </span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={isOutOfStock}
                  style={{ padding: '0.6rem 1rem' }}
                >
                  {[...Array(Math.min(product.stockQuantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`btn btn-lg ${addedSuccess ? 'btn-secondary' : 'btn-primary'}`}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  backgroundColor: addedSuccess ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  borderColor: addedSuccess ? '#10b981' : undefined,
                  color: addedSuccess ? '#10b981' : undefined,
                }}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : adding ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Shopping Cart
                  </>
                )}
              </button>
            </div>

            {/* Value Props */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.25rem',
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} className="text-indigo-400" />
                <span>Free shipping over $100</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>2-Year Full Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={16} className="text-pink-400" />
                <span>30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

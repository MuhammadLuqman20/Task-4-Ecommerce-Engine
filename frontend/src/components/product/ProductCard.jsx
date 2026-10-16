import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

import { getFallbackImage } from '../../utils/imageFallback';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setErrorMsg(null);
    const res = await addToCart(product._id, 1);
    setAdding(false);

    if (res?.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      setErrorMsg(res?.message || 'Could not add to cart');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-img-wrapper">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getFallbackImage(product.category, product.title);
          }}
        />
        <span className="product-category-tag">{product.category}</span>
      </Link>

      <div className="product-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{product.rating || 4.8}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            ({product.reviewsCount || 20})
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : product.stockQuantity < 5 ? (
              <span className="badge badge-warning">{product.stockQuantity} Left</span>
            ) : (
              <span className="badge badge-success">In Stock</span>
            )}
          </span>
        </div>

        <Link to={`/products/${product._id}`}>
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>
        </Link>

        <p className="product-desc">{product.description}</p>

        {errorMsg && (
          <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertCircle size={13} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-price">${product.price.toFixed(2)}</div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${justAdded ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.5rem 0.9rem',
              backgroundColor: justAdded ? 'rgba(16, 185, 129, 0.2)' : undefined,
              borderColor: justAdded ? '#10b981' : undefined,
              color: justAdded ? '#10b981' : undefined,
            }}
          >
            {justAdded ? (
              <>
                <Check size={15} /> Added
              </>
            ) : adding ? (
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
            ) : (
              <>
                <ShoppingCart size={15} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

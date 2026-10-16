import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getFallbackImage } from '../../utils/imageFallback';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > item.product.stockQuantity) return;
    setUpdating(true);
    await updateQuantity(item.product._id, newQty);
    setUpdating(false);
  };

  const handleRemove = async () => {
    setUpdating(true);
    await removeItem(item.product._id);
  };

  return (
    <div className="cart-item-row">
      <Link to={`/products/${item.product._id}`}>
        <img
          src={item.product.imageUrl}
          alt={item.product.title}
          className="cart-item-thumb"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getFallbackImage(item.product.category, item.product.title);
          }}
        />
      </Link>

      <div>
        <span className="badge badge-primary" style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}>
          {item.product.category}
        </span>
        <Link to={`/products/${item.product._id}`}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.product.title}</h4>
        </Link>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          ${item.product.price.toFixed(2)} each &bull;{' '}
          <span style={{ color: item.product.stockQuantity < 5 ? '#f59e0b' : '#10b981' }}>
            {item.product.stockQuantity} in stock
          </span>
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="qty-control">
        <button
          className="qty-btn"
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={updating || item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="qty-display">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={updating || item.quantity >= item.product.stockQuantity}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Line Item Total & Remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'right' }}>
        <div style={{ minWidth: '75px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
            ${item.itemSubtotal.toFixed(2)}
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={updating}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.45rem', color: '#ef4444' }}
          title="Remove from cart"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

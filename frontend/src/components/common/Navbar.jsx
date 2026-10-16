import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <span>Store</span>
        </Link>

        {/* Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Catalog
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <Package size={17} />
                  <span>My Orders</span>
                </NavLink>
              </li>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <span className="badge badge-primary" style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}>Admin</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Actions (Cart & Auth) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Cart Icon */}
          <Link to="/cart" className="cart-icon-wrapper nav-link" title="Shopping Cart">
            <ShoppingBag size={22} />
            {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
          </Link>

          {/* User state */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-pill">
                <User size={15} className="text-indigo-400" />
                <span style={{ fontWeight: 600 }}>{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of your account"
                style={{ padding: '0.4rem 0.65rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Store. All rights reserved.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Secure Checkout &bull; Verified Payments
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import { PackageOpen } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories/list');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products with active filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/products?sort=${sort}`;
        if (keyword.trim()) {
          url += `&keyword=${encodeURIComponent(keyword.trim())}`;
        }
        if (selectedCategory && selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const res = await api.get(url);
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalCount(res.data.total);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [keyword, selectedCategory, sort]);

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Product Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse our collection of high performance technology, audio systems, and workspace accessories.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <ProductFilters
        keyword={keyword}
        setKeyword={setKeyword}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        sort={sort}
        setSort={setSort}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        <span>Showing {products.length} of {totalCount} items</span>
        {selectedCategory !== 'All' && (
          <span>Category: <strong style={{ color: 'var(--text-main)' }}>{selectedCategory}</strong></span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <PackageOpen size={48} className="text-gray-500" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            We couldn't find any products matching your current search or filter criteria.
          </p>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedCategory('All');
            }}
            className="btn btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

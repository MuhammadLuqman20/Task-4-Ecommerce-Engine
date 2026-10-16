import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const ProductFilters = ({
  keyword,
  setKeyword,
  selectedCategory,
  setSelectedCategory,
  categories,
  sort,
  setSort,
}) => {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search devices, accessories, specs..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="filter-categories">
        <button
          type="button"
          className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <SlidersHorizontal size={16} className="text-gray-400" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: '0.6rem 0.9rem', fontSize: '0.88rem' }}
        >
          <option value="newest">Featured & Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;

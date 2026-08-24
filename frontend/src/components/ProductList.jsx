import React, { useState, useMemo } from 'react';

// Format currency into INR (₹)
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Format quantity with commas
const formatQuantity = (quantity) => {
  return new Intl.NumberFormat('en-IN').format(quantity || 0);
};

// Format date in Indian locale
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

// Badge class mapper
const getCategoryBadgeClass = (category) => {
  const map = {
    'Groceries & Provisions': 'badge-provisions',
    'Groceries & Kirana': 'badge-provisions',
    'Spices & Seasonings': 'badge-spices',
    'Spices & Masalas': 'badge-spices',
    'Dairy & Sweets': 'badge-dairy',
    'Dairy & Sweets (Mithai)': 'badge-dairy',
    'Snacks & Packaged Foods': 'badge-snacks',
    'Snacks & Namkeen': 'badge-snacks',
    'Clothing & Apparel': 'badge-apparel',
    'Clothing & Ethnic Wear': 'badge-apparel',
    'Electronics & Mobiles': 'badge-electronics',
    'Home & Kitchen': 'badge-home',
    'Religious & Festive Items': 'badge-religious',
    'Pooja & Spiritual Items': 'badge-religious',
    'Health & Wellness': 'badge-wellness',
    'Health & Ayurveda': 'badge-wellness',
    'Stationery & Books': 'badge-stationery',
    'Hardware & Electricals': 'badge-hardware',
    'Beauty & Personal Care': 'badge-beauty'
  };
  return map[category] || 'badge-other';
};

const ProductList = ({
  products,
  onEdit,
  onDelete,
  onStockAdjust,
  isLoading,
  isDeleting,
  onAddSampleProducts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Unique categories in current products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchTerm.trim()) {
          const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchCat = (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchName && !matchCat) return false;
        }
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        if (stockFilter === 'out') return p.quantity === 0;
        if (stockFilter === 'low') return p.quantity > 0 && p.quantity < 10;
        if (stockFilter === 'in') return p.quantity >= 10;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'stock-low') return a.quantity - b.quantity;
        if (sortBy === 'stock-high') return b.quantity - a.quantity;
        if (sortBy === 'value-high') return b.price * b.quantity - a.price * a.quantity;
        if (sortBy === 'value-low') return a.price * a.quantity - b.price * b.quantity;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="card shadow-sm p-5 text-center bg-white">
        <div className="spinner-border text-primary mx-auto mb-3" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
        <h5 className="text-secondary">Loading Products...</h5>
        <p className="text-muted small mb-0">Connecting to database</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card shadow-sm text-center py-5 px-4 bg-white">
        <div
          className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: 80, height: 80 }}
        >
          <i className="bi bi-box-seam text-primary fs-1"></i>
        </div>
        <h4 className="fw-bold text-dark">No Products in Inventory</h4>
        <p className="text-muted mb-4 max-w-sm mx-auto">
          Start by filling in the form on the left or add sample products to explore the system.
        </p>
        {onAddSampleProducts && (
          <div>
            <button
              type="button"
              className="btn btn-outline-primary shadow-sm"
              onClick={onAddSampleProducts}
            >
              <i className="bi bi-magic me-2"></i>
              Load Sample Products
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      {/* Header with Item Count */}
      <div className="card-header bg-white py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center">
              <i className="bi bi-boxes text-primary me-2"></i>
              Stock Inventory
              <span className="badge bg-primary bg-opacity-10 text-primary ms-2 fs-6 px-2.5 py-1">
                {products.length} {products.length === 1 ? 'Item' : 'Items'}
              </span>
            </h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              Showing {filteredProducts.length} of {products.length}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="row g-2 mt-2 pt-2 border-top">
          {/* Search */}
          <div className="col-lg-3 col-md-6 col-12">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-lg-3 col-md-6 col-6">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="col-lg-3 col-md-6 col-6">
            <select
              className="form-select form-select-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="All">All Stock Levels</option>
              <option value="in">In Stock (10+)</option>
              <option value="low">Low Stock (&lt;10)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="col-lg-3 col-md-6 col-12">
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="value-high">Stock Value: High to Low</option>
              <option value="value-low">Stock Value: Low to High</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-body p-0">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 px-3">
            <i className="bi bi-funnel text-muted display-6"></i>
            <p className="mt-2 text-muted fw-semibold">No products match the selected filters.</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setStockFilter('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small text-uppercase fw-semibold">
                  <th scope="col" className="ps-3 py-2.5">
                    Product
                  </th>
                  <th scope="col" className="py-2.5">
                    Category
                  </th>
                  <th scope="col" className="text-end py-2.5 text-nowrap">
                    Price (₹)
                  </th>
                  <th scope="col" className="text-center py-2.5 text-nowrap">
                    Stock & Adjust
                  </th>
                  <th scope="col" className="text-end py-2.5 text-nowrap">
                    Valuation
                  </th>
                  <th scope="col" className="text-center pe-3 py-2.5 text-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.quantity === 0;
                  const isLowStock = product.quantity > 0 && product.quantity < 10;
                  const unitLabel = product.unit || 'pcs';
                  const rowStockValue = (product.price || 0) * (product.quantity || 0);

                  return (
                    <tr key={product._id}>
                      {/* Product Name & Date */}
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <div className="product-icon-box bg-primary bg-opacity-10 text-primary me-2 flex-shrink-0">
                            <i className="bi bi-box-seam"></i>
                          </div>
                          <div className="text-truncate">
                            <div
                              className="fw-semibold text-dark text-truncate"
                              title={product.name}
                            >
                              {product.name}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {formatDate(product.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          className={`badge-category ${getCategoryBadgeClass(
                            product.category
                          )} text-truncate`}
                          style={{ maxWidth: '100%' }}
                        >
                          {product.category}
                        </span>
                      </td>

                      {/* Price in ₹ */}
                      <td className="text-end text-nowrap">
                        <span className="fw-bold text-dark font-monospace">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-muted small ms-1" style={{ fontSize: '0.75rem' }}>
                          /{unitLabel}
                        </span>
                      </td>

                      {/* Stock & Quick Adjust */}
                      <td className="text-center">
                        <div className="d-inline-flex align-items-center gap-1 bg-light p-1 rounded-2 border">
                          {/* Decrease Stock Button */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger stock-btn"
                            title="Decrease Stock (-1)"
                            disabled={isOutOfStock || isDeleting}
                            onClick={() => onStockAdjust(product._id, -1)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>

                          {/* Stock Value Badge */}
                          <span
                            className={`badge ${
                              isOutOfStock
                                ? 'bg-danger text-white'
                                : isLowStock
                                ? 'bg-warning text-dark'
                                : 'bg-success text-white'
                            } px-2 py-1 text-nowrap`}
                            style={{ minWidth: '40px', fontSize: '0.75rem' }}
                          >
                            {formatQuantity(product.quantity)} {unitLabel}
                          </span>

                          {/* Increase Stock Button */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success stock-btn"
                            title="Increase Stock (+1)"
                            disabled={isDeleting}
                            onClick={() => onStockAdjust(product._id, 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        {isOutOfStock && (
                          <div
                            className="text-danger fw-bold mt-0.5"
                            style={{ fontSize: '0.68rem' }}
                          >
                            Out of Stock
                          </div>
                        )}
                        {isLowStock && (
                          <div
                            className="text-warning-emphasis fw-semibold mt-0.5"
                            style={{ fontSize: '0.68rem' }}
                          >
                            Low Stock
                          </div>
                        )}
                      </td>

                      {/* Stock Value in INR */}
                      <td className="text-end text-nowrap">
                        <span className="fw-bold text-primary font-monospace">
                          {formatPrice(rowStockValue)}
                        </span>
                      </td>

                      {/* Edit & Delete Actions */}
                      <td className="text-center pe-3 text-nowrap">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary py-0.5 px-1.5"
                            onClick={() => onEdit(product)}
                            disabled={isLoading || isDeleting}
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger py-0.5 px-1.5"
                            onClick={() => {
                              if (
                                window.confirm(`Are you sure you want to delete "${product.name}"?`)
                              ) {
                                onDelete(product._id);
                              }
                            }}
                            disabled={isLoading || isDeleting}
                            title="Delete Product"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

import React, { useState, useEffect, useCallback } from 'react';
import ProductForm from './components/ProductForm.jsx';
import ProductList from './components/ProductList.jsx';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const SAMPLE_PRODUCTS = [
  { name: 'Black Tea Blend (500g)', price: 320, quantity: 45, category: 'Groceries & Provisions', unit: 'packet' },
  { name: 'Pasteurised Table Butter (500g)', price: 275, quantity: 30, category: 'Dairy & Sweets', unit: 'packet' },
  { name: 'Premium Long Grain Rice (5kg)', price: 650, quantity: 20, category: 'Groceries & Provisions', unit: 'kg' },
  { name: 'Refined Sunflower Oil (1L)', price: 145, quantity: 50, category: 'Groceries & Provisions', unit: 'L' },
  { name: 'Crispy Potato Chips (400g)', price: 110, quantity: 60, category: 'Snacks & Packaged Foods', unit: 'packet' },
  { name: 'Mixed Spice Seasoning (100g)', price: 88, quantity: 40, category: 'Spices & Seasonings', unit: 'box' },
  { name: 'Natural Herbal Honey (1kg)', price: 395, quantity: 18, category: 'Health & Wellness', unit: 'kg' },
  { name: 'Pure Clarified Butter (1L)', price: 620, quantity: 6, category: 'Dairy & Sweets', unit: 'L' },
  { name: 'Aromatic Incense Sticks', price: 95, quantity: 35, category: 'Religious & Festive Items', unit: 'packet' },
  { name: 'Family Glucose Biscuits (800g)', price: 90, quantity: 0, category: 'Snacks & Packaged Foods', unit: 'packet' }
];

function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Show Alert
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) {
        let errMsg = 'Failed to connect to backend server.';
        try {
          const errData = await res.json();
          if (errData && errData.message) errMsg = errData.message;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert(err.message || 'Failed to connect to backend server.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Form Submit (Add or Update)
  const handleSubmit = async (productData) => {
    try {
      setIsSubmitting(true);
      const isEdit = Boolean(editingProduct && editingProduct._id);
      const url = isEdit
        ? `${API_BASE_URL}/products/${editingProduct._id}`
        : `${API_BASE_URL}/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Operation failed');
      }

      const saved = await res.json();
      if (isEdit) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? saved : p)));
        showAlert(`Product "${saved.name}" updated successfully!`, 'success');
      } else {
        setProducts((prev) => [saved, ...prev]);
        showAlert(`Product "${saved.name}" added to inventory!`, 'success');
      }
      setEditingProduct(null);
    } catch (err) {
      showAlert(err.message || 'Error saving product', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Selection
  const handleEdit = (product) => {
    setEditingProduct(product);
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showAlert('Product removed from inventory.', 'success');
    } catch (err) {
      showAlert(err.message || 'Error deleting product', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Stock Adjustment (+/-)
  const handleStockAdjust = async (id, adjustment) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment })
      });
      if (!res.ok) throw new Error('Failed to adjust stock');
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err) {
      showAlert(err.message || 'Error updating stock', 'danger');
    }
  };

  // Load Sample Products
  const handleLoadSampleData = async () => {
    try {
      setIsLoading(true);
      for (const sample of SAMPLE_PRODUCTS) {
        await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sample)
        });
      }
      await fetchProducts();
      showAlert('Loaded sample products into inventory!', 'success');
    } catch (err) {
      showAlert('Error loading sample products', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // KPI Calculations
  const totalItems = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
  const outOfStockCount = products.filter((p) => (Number(p.quantity) || 0) === 0).length;
  const lowStockCount = products.filter((p) => (Number(p.quantity) || 0) > 0 && (Number(p.quantity) || 0) < 10).length;

  const formattedStockValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(totalStockValue);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f4f6fb' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar py-2.5 shadow-sm">
        <div className="container-fluid px-lg-5 px-3">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#!">
            <div className="bg-white bg-opacity-15 p-2 rounded-3 text-warning">
              <i className="bi bi-box-seam fs-5"></i>
            </div>
            <div>
              <span className="fs-5 tracking-tight">Product Inventory Manager</span>
              <div className="text-white-50" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                INVENTORY & STOCK MANAGEMENT SYSTEM (INR ₹)
              </div>
            </div>
          </a>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light d-flex align-items-center gap-1"
              onClick={fetchProducts}
              title="Refresh Products"
            >
              <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
              <span className="d-none d-sm-inline">Refresh</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
        {/* Alert */}
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show d-flex align-items-center shadow-sm`} role="alert">
            <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
            <div className="flex-grow-1 fw-medium">{alert.message}</div>
            <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
          </div>
        )}

        {/* 4 Symmetrical KPI Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card stat-card-blue h-100">
              <div className="stat-card-top">
                <span className="stat-label">Total Items</span>
                <div className="stat-icon-wrapper"><i className="bi bi-box-seam"></i></div>
              </div>
              <div className="stat-value-container">
                <div className="stat-value">{totalItems}</div>
                <div className="stat-subtext">Unique Products</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card stat-card-green h-100">
              <div className="stat-card-top">
                <span className="stat-label">Total Units</span>
                <div className="stat-icon-wrapper"><i className="bi bi-stack"></i></div>
              </div>
              <div className="stat-value-container">
                <div className="stat-value">{totalUnits.toLocaleString('en-IN')}</div>
                <div className="stat-subtext">Units in Stock</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card stat-card-purple h-100">
              <div className="stat-card-top">
                <span className="stat-label">Stock Value (INR)</span>
                <div className="stat-icon-wrapper"><i className="bi bi-currency-rupee"></i></div>
              </div>
              <div className="stat-value-container">
                <div className="stat-value">{formattedStockValue}</div>
                <div className="stat-subtext">Total Valuation</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className={`stat-card ${outOfStockCount > 0 ? 'stat-card-red' : lowStockCount > 0 ? 'stat-card-amber' : 'stat-card-green'} h-100`}>
              <div className="stat-card-top">
                <span className="stat-label">Stock Alerts</span>
                <div className="stat-icon-wrapper">
                  <i className={`bi bi-${outOfStockCount > 0 ? 'exclamation-octagon' : lowStockCount > 0 ? 'exclamation-triangle' : 'check-circle'}`}></i>
                </div>
              </div>
              <div className="stat-value-container">
                <div className={`stat-value ${outOfStockCount > 0 ? 'text-danger' : lowStockCount > 0 ? 'text-warning' : 'text-success'}`}>
                  {outOfStockCount} <span className="fs-6 fw-normal text-muted">out</span>
                </div>
                <div className="stat-subtext">
                  {lowStockCount > 0 ? `${lowStockCount} Low Stock` : outOfStockCount === 0 ? 'Stock Normal' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Workspace */}
        <div className="row g-4 align-items-start">
          <div className="col-12 col-xxl-3 col-xl-4 col-lg-4" id="product-form">
            <ProductForm
              product={editingProduct}
              onSubmit={handleSubmit}
              onCancel={() => setEditingProduct(null)}
              isLoading={isSubmitting}
            />
          </div>

          <div className="col-12 col-xxl-9 col-xl-8 col-lg-8">
            <ProductList
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStockAdjust={handleStockAdjust}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onAddSampleProducts={handleLoadSampleData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

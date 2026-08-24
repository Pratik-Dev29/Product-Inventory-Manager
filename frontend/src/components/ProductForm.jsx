import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'Groceries & Provisions',
  'Spices & Seasonings',
  'Dairy & Sweets',
  'Snacks & Packaged Foods',
  'Clothing & Apparel',
  'Electronics & Mobiles',
  'Home & Kitchen',
  'Religious & Festive Items',
  'Health & Wellness',
  'Stationery & Books',
  'Hardware & Electricals',
  'Beauty & Personal Care',
  'Other'
];

const UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'packet', label: 'Packet (pkt)' },
  { value: 'box', label: 'Box' },
  { value: 'dozen', label: 'Dozen (dz)' }
];

const ProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    unit: 'pcs'
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing a product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price !== undefined ? product.price.toString() : '',
        quantity: product.quantity !== undefined ? product.quantity.toString() : '',
        category: product.category || '',
        unit: product.unit || 'pcs'
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        price: '',
        quantity: '',
        category: '',
        unit: 'pcs'
      });
      setErrors({});
    }
  }, [product]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.price === '' || formData.price === null || isNaN(Number(formData.price))) {
      newErrors.price = 'Valid price is required';
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.quantity === '' || formData.quantity === null || isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (parseInt(formData.quantity, 10) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      category: formData.category.trim(),
      unit: formData.unit || 'pcs'
    };

    onSubmit(productData);
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({ name: '', price: '', quantity: '', category: '', unit: 'pcs' });
    setErrors({});
    onCancel();
  };

  const isEditing = Boolean(product && product._id);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark d-flex align-items-center">
          <i
            className={`bi bi-${
              isEditing ? 'pencil-square text-warning' : 'plus-circle text-primary'
            } me-2`}
          ></i>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h5>
        {isEditing && (
          <span className="badge bg-warning text-dark px-2 py-1">Editing Mode</span>
        )}
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit} id="product-form-element">
          <div className="row g-3">
            {/* Product Name */}
            <div className="col-12">
              <label htmlFor="name" className="form-label fw-semibold text-secondary small">
                Product Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Black Tea Blend, Table Butter, Long Grain Rice"
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Category */}
            <div className="col-12">
              <label htmlFor="category" className="form-label fw-semibold text-secondary small">
                Category <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>

            {/* Unit / Measure */}
            <div className="col-12">
              <label htmlFor="unit" className="form-label fw-semibold text-secondary small">
                Unit / Measure
              </label>
              <select
                className="form-select"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={isLoading}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="col-6">
              <label htmlFor="price" className="form-label fw-semibold text-secondary small">
                Price (₹ INR) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text fw-bold text-primary">₹</span>
                <input
                  type="number"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>
              {errors.price && (
                <div className="invalid-feedback d-block">{errors.price}</div>
              )}
            </div>

            {/* Quantity */}
            <div className="col-6">
              <label htmlFor="quantity" className="form-label fw-semibold text-secondary small">
                Quantity in Stock <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                disabled={isLoading}
              />
              {errors.quantity && (
                <div className="invalid-feedback">{errors.quantity}</div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex gap-2 mt-4 pt-2 border-top">
            <button
              type="submit"
              className="btn btn-primary flex-grow-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i
                    className={`bi bi-${isEditing ? 'check-circle' : 'plus-circle'} me-1`}
                  ></i>
                  {isEditing ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-outline-secondary px-3"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

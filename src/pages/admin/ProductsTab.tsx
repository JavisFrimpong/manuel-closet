import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/types';
import {
  Plus, Pencil, Trash2, Loader2, X, Upload, Search,
  Package, ImageIcon, CheckCircle, AlertCircle
} from 'lucide-react';

const CATEGORIES = ['Men', 'Women', 'Unisex', 'Kids', 'Accessories', 'Shoes'];
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '6', '7', '8', '9', '10', '11', '12', 'Free Size'];
const COMMON_COLORS = ['Black', 'White', 'Grey', 'Navy', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
  sizes: string[];
  colors: string[];
  image_url: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: 'Men',
  stock_quantity: '',
  sizes: [],
  colors: [],
  image_url: '',
};

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || 'Men',
      stock_quantity: product.stock_quantity.toString(),
      sizes: product.sizes || [],
      colors: product.colors || [],
      image_url: product.image_url || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('error', 'Image must be under 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      showToast('error', err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleArrayItem = (field: 'sizes' | 'colors', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.stock_quantity) {
      showToast('error', 'Name, price, and stock are required');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      stock_quantity: parseInt(form.stock_quantity),
      sizes: form.sizes,
      colors: form.colors,
      image_url: form.image_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        showToast('success', 'Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
        showToast('success', 'Product added successfully');
      }
      await fetchProducts();
      setShowModal(false);
    } catch (err: any) {
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Product deleted');
    } else {
      showToast('error', 'Failed to delete product');
    }
    setDeleting(null);
  };

  const filtered = products.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border animate-slide-up ${
          toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
        <button
          onClick={openCreate}
          id="add-product-btn"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-brand-400 animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="text-gray-600 mx-auto mb-3" size={48} />
          <p className="text-gray-400 font-semibold">No products found</p>
          <button onClick={openCreate} className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            + Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-dark-700/50 border border-dark-600 rounded-2xl overflow-hidden hover:border-dark-500 transition-all group">
              {/* Image */}
              <div className="aspect-square bg-dark-700 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="text-dark-600" size={32} />
                    <span className="text-dark-600 text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">{product.category}</span>
                <h3 className="text-white font-semibold text-sm mt-0.5 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-brand-400 font-bold text-lg">₵{product.price.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.stock_quantity === 0
                      ? 'bg-red-500/10 text-red-400'
                      : product.stock_quantity <= 5
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {product.stock_quantity === 0 ? 'Out of stock' : `Stock: ${product.stock_quantity}`}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-600 hover:bg-dark-500 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-all"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium rounded-lg transition-all disabled:opacity-60"
                  >
                    {deleting === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-800 z-10">
                <h2 className="text-white font-bold text-lg font-serif">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Product Image</label>
                  <div className="flex items-start gap-4">
                    <div className="w-28 h-28 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : uploadingImage ? (
                        <Loader2 className="text-brand-400 animate-spin" size={24} />
                      ) : (
                        <ImageIcon className="text-dark-500" size={28} />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer bg-dark-700 hover:bg-dark-600 border border-dashed border-dark-500 hover:border-brand-500/50 text-gray-400 hover:text-white text-sm font-medium px-4 py-3 rounded-xl transition-all">
                        <Upload size={16} />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                      <p className="text-gray-600 text-xs mt-2">Or paste image URL below:</p>
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="mt-2 w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Classic Linen Shirt"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description..."
                    rows={3}
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-1.5 block">Price (₵) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-1.5 block">Stock Quantity *</label>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={e => setForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          form.category === cat
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleArrayItem('sizes', size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          form.sizes.includes(size)
                            ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                            : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleArrayItem('colors', color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          form.colors.includes(color)
                            ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                            : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-dark-600 sticky bottom-0 bg-dark-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  id="save-product-btn"
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-60 active:scale-95"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsTab;

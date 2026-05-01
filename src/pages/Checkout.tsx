import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';
import { ShoppingBag, User, Phone, MapPin, FileText, ArrowRight, ChevronLeft } from 'lucide-react';

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

const Checkout = () => {
  const { items, totalPrice, closeCart } = useCart();
  const navigate = useNavigate();
  const [info, setInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const validate = () => {
    const newErrors: Partial<CustomerInfo> = {};
    if (!info.name.trim()) newErrors.name = 'Name is required';
    if (!info.phone.trim() || info.phone.trim().length < 10) newErrors.phone = 'Valid phone number required';
    if (!info.address.trim()) newErrors.address = 'Delivery address is required';
    return newErrors;
  };

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleReviewOrder = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Pass info to order review
    navigate('/order-review', { state: { customerInfo: info, items, totalPrice } });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header />
        <CartSidebar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <ShoppingBag className="text-gray-600" size={64} />
          <p className="text-gray-400 text-xl font-semibold">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <CartSidebar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        <h1 className="text-3xl font-bold text-white font-serif mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Customer Info Form */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <User size={18} className="text-brand-400" />
                Your Information
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="checkout-name"
                      type="text"
                      value={info.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="John Mensah"
                      className={`w-full bg-dark-700 border ${errors.name ? 'border-red-500' : 'border-dark-600'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Phone Number *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={info.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+233 24 000 0000"
                      className={`w-full bg-dark-700 border ${errors.phone ? 'border-red-500' : 'border-dark-600'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Delivery Address *</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-4 text-gray-500" />
                    <textarea
                      id="checkout-address"
                      value={info.address}
                      onChange={e => handleChange('address', e.target.value)}
                      placeholder="House number, street, area, city..."
                      rows={3}
                      className={`w-full bg-dark-700 border ${errors.address ? 'border-red-500' : 'border-dark-600'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none`}
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Order Notes (Optional)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3.5 top-4 text-gray-500" />
                    <textarea
                      id="checkout-notes"
                      value={info.notes}
                      onChange={e => handleChange('notes', e.target.value)}
                      placeholder="Any special instructions..."
                      rows={2}
                      className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 sticky top-28">
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-400" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={16} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-gray-500 text-xs">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ' · '}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-brand-400 font-bold text-sm flex-shrink-0">
                      ₵{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-600 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Delivery</span>
                  <span className="text-green-400">Negotiable</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-dark-600 mt-2">
                  <span>Total</span>
                  <span className="text-brand-400">₵{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleReviewOrder}
                id="review-order-btn"
                className="mt-6 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
              >
                Review Order
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

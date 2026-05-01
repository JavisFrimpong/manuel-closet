import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Order } from '../lib/types';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';
import { Search, Package, Loader2, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-brand-400 bg-brand-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

const OrderTracking = () => {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState(location.state?.orderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (location.state?.orderNumber) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    const query = searchInput.trim().toUpperCase();
    if (!query) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: queryError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', query)
        .maybeSingle();

      if (queryError) throw queryError;

      if (!data) {
        setOrder(null);
        setError(`No order found with number "${query}"`);
      } else {
        setOrder(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;

  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <CartSidebar />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 mb-4">
            <Package className="text-brand-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number to see the latest updates</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="order-number-input"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. MC-0001"
              className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all uppercase"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            id="track-search-btn"
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold px-6 py-4 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-3 text-red-400 mb-6">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Order Found */}
        {order && !loading && (
          <div className="animate-slide-up space-y-6">
            {/* Order Header */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-gray-500 text-sm">Order Number</p>
                  <p className="text-2xl font-bold text-brand-400 font-mono">{order.order_number}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                  {isCancelled ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-600 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="text-white font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="text-brand-400 font-bold text-lg">₵{order.total_amount.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="text-white font-medium">{order.delivery_address}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h2 className="text-white font-bold mb-6">Order Progress</h2>
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-dark-600" />
                  <div
                    className="absolute top-6 left-6 h-0.5 bg-brand-500 transition-all duration-700"
                    style={{
                      width: currentStepIndex >= 0
                        ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * (100 - (100 / STATUS_STEPS.length))}%`
                        : '0%'
                    }}
                  />

                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                            isCompleted
                              ? 'bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/40'
                              : 'bg-dark-700 border-dark-600'
                          } ${isCurrent ? 'ring-4 ring-brand-500/20' : ''}`}>
                            <Icon size={18} className={isCompleted ? 'text-white' : 'text-gray-600'} />
                          </div>
                          <p className={`text-xs font-medium text-center leading-tight ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                <XCircle className="text-red-400 flex-shrink-0" size={32} />
                <div>
                  <p className="text-red-400 font-bold text-lg">Order Cancelled</p>
                  <p className="text-gray-500 text-sm mt-1">This order has been cancelled. Contact us if you have questions.</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h2 className="text-white font-bold mb-4">Items Ordered</h2>
                <div className="space-y-3">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                      <div>
                        <p className="text-white font-medium text-sm">{item.product_name}</p>
                        <p className="text-gray-500 text-xs">
                          {[item.size, item.color].filter(Boolean).join(' · ')} · Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-brand-400 font-bold text-sm">₵{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

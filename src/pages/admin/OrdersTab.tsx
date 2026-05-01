import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Order, OrderStatus } from '../../lib/types';
import {
  Package, ChevronDown, ChevronUp, Search, Filter, Loader2,
  Clock, CheckCircle, Truck, XCircle, RefreshCw
} from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  confirmed: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  processing: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  shipped: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  delivered: 'bg-green-400/10 text-green-400 border-green-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
};

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    }
    setUpdatingId(null);
  };

  const filtered = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      (order.customer_email || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order #, name, email..."
            className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-dark-700 border border-dark-600 rounded-xl text-gray-400 hover:text-white hover:border-dark-500 transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-brand-400 animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="text-gray-600 mx-auto mb-3" size={48} />
          <p className="text-gray-400 font-semibold">No orders found</p>
          <p className="text-gray-600 text-sm mt-1">
            {filterStatus !== 'all' || searchQuery ? 'Try changing your filters' : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm mb-4">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(order => (
            <div key={order.id} className="bg-dark-700/50 border border-dark-600 rounded-2xl overflow-hidden hover:border-dark-500 transition-all">
              {/* Order Row */}
              <div
                className="p-4 cursor-pointer flex items-center gap-4"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-bold font-mono">{order.order_number}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">{order.customer_name}</p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-brand-400 font-bold text-lg">₵{order.total_amount.toFixed(2)}</p>
                  <p className="text-gray-600 text-xs">{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
                {expandedOrderId === order.id ? (
                  <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
                )}
              </div>

              {/* Expanded Details */}
              {expandedOrderId === order.id && (
                <div className="border-t border-dark-600 p-4 space-y-4 bg-dark-800/50 animate-fade-in">
                  {/* Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Items</p>
                      <div className="space-y-1.5">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-dark-700 last:border-0">
                            <div>
                              <p className="text-white">{item.product_name}</p>
                              <p className="text-gray-500 text-xs">{[item.size, item.color].filter(Boolean).join(' · ')} · Qty: {item.quantity}</p>
                            </div>
                            <p className="text-brand-400 font-medium">₵{item.subtotal.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Phone</p>
                      <p className="text-white">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Delivery Address</p>
                      <p className="text-white">{order.delivery_address}</p>
                    </div>
                    {order.notes && (
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs mb-0.5">Notes</p>
                        <p className="text-white">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-3">
                    <p className="text-gray-500 text-sm">Update Status:</p>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className="flex-1 bg-dark-700 border border-dark-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.filter(o => o.value !== 'all').map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {updatingId === order.id && <Loader2 size={16} className="animate-spin text-brand-400" />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;

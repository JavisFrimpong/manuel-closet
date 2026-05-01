import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';
import { ShoppingBag, User, Phone, MapPin, FileText, Loader2, ChevronLeft, CheckCircle } from 'lucide-react';

const OrderReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { customerInfo, items, totalPrice } = location.state || {};

  if (!customerInfo || !items || items.length === 0) {
    navigate('/checkout');
    return null;
  }

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError(null);

    try {
      // Generate sequential order number
      const { data: lastOrder } = await supabase
        .from('orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNum = 1;
      if (lastOrder?.order_number) {
        const last = parseInt(lastOrder.order_number.replace('MC-', ''), 10);
        if (!isNaN(last)) nextNum = last + 1;
      }
      const orderNumber = `MC-${String(nextNum).padStart(4, '0')}`;

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerInfo.name,
          customer_email: null,
          customer_phone: customerInfo.phone,
          delivery_address: customerInfo.address,
          notes: customerInfo.notes || null,
          total_amount: totalPrice,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize || '',
        color: item.selectedColor || '',
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Update stock quantities
      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product.id,
          p_quantity: item.quantity,
        }).catch(() => {}); // Non-critical, don't block order
      }

      clearCart();
      navigate('/order-confirmation', {
        state: { orderNumber },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <CartSidebar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Edit Details
        </button>

        <h1 className="text-3xl font-bold text-white font-serif mb-8">Review Your Order</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Details */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <User size={18} className="text-brand-400" />
              Delivery Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="text-white font-medium">{customerInfo.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-white font-medium">{customerInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Address</p>
                  <p className="text-white font-medium">{customerInfo.address}</p>
                </div>
              </div>
              {customerInfo.notes && (
                <div className="flex items-start gap-3">
                  <FileText size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Notes</p>
                    <p className="text-white font-medium">{customerInfo.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-400" />
              Items ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((item: any, i: number) => (
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
                      {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-brand-400 font-bold text-sm">₵{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-600 mt-4 pt-4">
              <div className="flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-brand-400">₵{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Place Order Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            id="place-order-btn"
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl flex items-center gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
          >
            {placing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;

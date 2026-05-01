import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Mail, Home, Search } from 'lucide-react';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber, emailStatus, emailErrorMessage } = location.state || {};
  const emailSent = emailStatus !== 'failed';

  if (!orderNumber) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <CartSidebar />

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        {/* Success Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-400" size={48} strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center animate-bounce">
            <span className="text-white text-xs">🎉</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white font-serif mb-3">Order Placed!</h1>
        <p className="text-gray-400 text-lg mb-6">Thank you for shopping with Manuel's Closet.</p>
        {!emailSent && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-300 text-sm">
            Order was placed, but email notification failed. {emailErrorMessage ? `Reason: ${emailErrorMessage}` : 'Please verify SMTP settings and edge-function deployment.'}
          </div>
        )}

        {/* Order Number Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 mb-8">
          <p className="text-gray-500 text-sm mb-2">Your Order Number</p>
          <p className="text-4xl font-bold text-brand-400 font-mono tracking-wider">{orderNumber}</p>
          <p className="text-gray-600 text-sm mt-3">Save this number to track your order</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: CheckCircle, label: 'Order Received', color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Package, label: 'Processing', color: 'text-brand-400', bg: 'bg-brand-500/10' },
            {
              icon: Mail,
              label: emailSent ? 'Confirmation Sent' : 'Email Failed',
              color: emailSent ? 'text-blue-400' : 'text-yellow-300',
              bg: emailSent ? 'bg-blue-500/10' : 'bg-yellow-500/10',
            },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 flex flex-col items-center gap-2`}>
              <Icon className={color} size={24} />
              <p className="text-gray-300 text-xs font-medium text-center">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/track', { state: { orderNumber } })}
            id="track-order-btn"
            className="flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-8 py-3.5 rounded-xl font-medium transition-all border border-dark-600 hover:border-dark-500"
          >
            <Search size={18} />
            Track Your Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
          >
            <Home size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

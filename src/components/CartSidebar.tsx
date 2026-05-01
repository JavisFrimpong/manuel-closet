import React from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-800 z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-brand-400" size={22} />
            <h2 className="text-xl font-bold text-white font-serif">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center">
                <ShoppingBag className="text-gray-500" size={32} />
              </div>
              <p className="text-gray-400 text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm">Add some items to get started</p>
              <button
                onClick={closeCart}
                className="mt-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Continue Shopping →
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                className="flex gap-4 bg-dark-700 rounded-xl p-4 group animate-slide-up"
              >
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-600">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="text-gray-600" size={24} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{item.product.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {item.selectedSize && (
                      <span className="text-xs text-gray-400 bg-dark-600 px-2 py-0.5 rounded">
                        {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="text-xs text-gray-400 bg-dark-600 px-2 py-0.5 rounded">
                        {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <p className="text-brand-400 font-bold text-sm mt-1">
                    ₵{(item.product.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-dark-600 hover:bg-dark-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-white font-medium w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-dark-600 hover:bg-dark-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="ml-auto w-7 h-7 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-dark-600 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-bold text-xl">₵{totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 text-xs">Delivery fee calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

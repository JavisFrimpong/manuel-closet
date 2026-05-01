import React, { useState } from 'react';
import { ShoppingBag, Search, Package, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  showSearch?: boolean;
}

const Header = ({ onSearchChange, searchQuery = '', showSearch = false }: HeaderProps) => {
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
                <span className="text-white font-bold text-lg font-serif">M</span>
              </div>
              <div className="hidden xs:block">
                <span className="text-white font-bold text-lg leading-none font-serif">Manuel's</span>
                <span className="block text-brand-400 text-xs font-medium tracking-widest uppercase leading-none">Closet</span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            {showSearch && onSearchChange && (
              <div className="flex-1 max-w-xl hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/track')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all text-sm font-medium"
              >
                <Package size={16} />
                Track Order
              </button>

              {/* Cart Button */}
              <button
                onClick={openCart}
                id="cart-toggle-btn"
                className="relative p-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 active:scale-95"
                aria-label="Open cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-brand-600 text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-fade-in">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-16 z-30 bg-dark-800 border-b border-dark-700 shadow-2xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { navigate('/track'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm font-medium"
            >
              <Package size={18} />
              Track Your Order
            </button>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm font-medium"
            >
              <Search size={18} />
              Browse Products
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

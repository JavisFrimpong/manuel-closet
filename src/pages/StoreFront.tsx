import React, { useState, useEffect } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, Tag, Sparkles,
  Truck, Shield, Star, HeartHandshake, Phone, Mail, MapPin, Instagram, ArrowRight, X, Package, Gem, Award, Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/types';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartSidebar from '../components/CartSidebar';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Men', 'Women', 'Unisex', 'Kids', 'Accessories', 'Shoes'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Across Accra & beyond', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Shield, title: 'Secure Checkout', desc: 'Your data stays safe', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: Star, title: 'Premium Quality', desc: 'Only the best fabrics', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: HeartHandshake, title: 'Customer Support', desc: "We're here 24/7", color: 'text-pink-400', bg: 'bg-pink-400/10' },
];

const LOOKBOOK = [
  {
    title: 'Executive Essentials',
    description: 'Sharp office fits, blazers, and elevated basics for weekdays.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Weekend Relaxed',
    description: 'Comfortable styles curated for brunch, events, and city strolls.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Evening Statement',
    description: 'Premium pieces designed to stand out at dinner and occasions.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
  },
];

const TRUST_STATS = [
  { icon: Users, value: '2,500+', label: 'Happy Customers' },
  { icon: Award, value: '150+', label: 'Curated Products' },
  { icon: Gem, value: '4.9/5', label: 'Average Rating' },
];

const StoreFront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeSearch = searchQuery || mobileSearch;

  const filteredAndSorted = products
    .filter(p => {
      const matchesSearch =
        !activeSearch ||
        p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(activeSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(activeSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-dark-900">
      <Header showSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CartSidebar />

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 sm:hidden" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed top-0 left-0 h-full w-72 bg-dark-800 z-50 p-6 sm:hidden animate-slide-in-right flex flex-col gap-4">
            <button onClick={() => setShowMobileMenu(false)} className="self-end p-2 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <button onClick={() => { navigate('/track'); setShowMobileMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-all">
              <Package size={18} /> Track Order
            </button>
          </div>
        </>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden hero-pattern">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-brand-400/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium px-5 py-2.5 rounded-full mb-8 animate-fade-in">
              <Sparkles size={14} className="animate-pulse" />
              New arrivals dropping every week
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-serif mb-6 leading-tight animate-slide-up">
              Dress Your{' '}
              <span className="gradient-text">Best Self</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Premium fashion curated for every occasion. From everyday casual to special events — Manuel's Closet has your perfect look.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <a href="#products"
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]">
                Shop Now <ArrowRight size={18} />
              </a>
              <button onClick={() => navigate('/track')}
                className="bg-dark-700/80 hover:bg-dark-600 text-white font-semibold py-4 px-8 rounded-xl border border-dark-600 hover:border-dark-500 flex items-center justify-center gap-2 transition-all">
                <Package size={18} /> Track Your Order
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-dark-900 to-transparent" />
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section className="border-b border-dark-700 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={color} size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{title}</p>
                  <p className="text-gray-500 text-xs truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MOBILE SEARCH ===== */}
      <div className="sm:hidden px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={mobileSearch}
            onChange={e => setMobileSearch(e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* ===== FILTERS BAR ===== */}
      <div id="products" className="sticky top-16 z-20 bg-dark-900/95 backdrop-blur-md border-b border-dark-700 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-nowrap scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-xl pl-4 pr-8 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== PRODUCTS GRID ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700">
                <div className="aspect-[3/4] shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-3 shimmer rounded w-1/3" />
                  <div className="h-4 shimmer rounded w-2/3" />
                  <div className="h-3 shimmer rounded w-full" />
                  <div className="h-10 shimmer rounded-xl w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <Tag className="text-red-400" size={32} />
            </div>
            <h3 className="text-red-400 text-xl font-bold mb-2">Couldn't load products</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">{error}</p>
            <button onClick={fetchProducts} className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]">
              Try Again
            </button>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-5">
              <Tag className="text-gray-600" size={32} />
            </div>
            <h3 className="text-gray-300 text-xl font-bold">No products found</h3>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearchQuery(''); setMobileSearch(''); setSelectedCategory('All'); }}
              className="mt-6 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors"
            >
              Clear all filters →
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                Showing <span className="text-white font-semibold">{filteredAndSorted.length}</span> product{filteredAndSorted.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredAndSorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ===== LOOKBOOK SECTION ===== */}
      <section className="border-t border-dark-700 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">Style Lookbook</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">Outfits For Every Moment</h2>
            </div>
            <p className="text-gray-400 max-w-md text-sm md:text-base">
              Explore professionally curated style directions to help you shop faster and dress better.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {LOOKBOOK.map((card) => (
              <article
                key={card.title}
                className="group rounded-2xl overflow-hidden border border-dark-700 bg-dark-800/60 hover:border-brand-500/40 transition-all"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="bg-dark-800/50 border-t border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white font-serif mb-3">Why Shoppers Choose Manuel's Closet</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We combine quality fabrics, smart pricing, and dependable delivery so every purchase feels premium from cart to doorstep.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {TRUST_STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="bg-dark-700/80 border border-dark-600 rounded-xl p-3 text-center">
                    <Icon size={18} className="text-brand-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-lg">{value}</p>
                    <p className="text-gray-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-dark-600">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80"
                alt="Fashion showroom"
                className="w-full h-[320px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section className="bg-dark-800/50 border-t border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 mb-5">
              <Mail className="text-brand-400" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3">Stay in Style</h2>
            <p className="text-gray-400 mb-8">Get notified about new arrivals, exclusive deals, and style tips. No spam, ever.</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 transition-all"
              />
              <button className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-dark-800 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <span className="text-white font-bold text-lg font-serif">M</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg leading-none font-serif">Manuel's</span>
                  <span className="block text-brand-400 text-xs font-medium tracking-widest uppercase leading-none">Closet</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your one-stop destination for premium fashion. Quality meets style at unbeatable prices.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><a href="#products" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Shop All</a></li>
                <li><a href="/track" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Track Order</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2.5">
                {['Men', 'Women', 'Unisex', 'Accessories'].map(cat => (
                  <li key={cat}>
                    <button onClick={() => setSelectedCategory(cat)} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Phone size={14} className="text-brand-400 flex-shrink-0" />
                  +233 XX XXX XXXX
                </li>
                <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Mail size={14} className="text-brand-400 flex-shrink-0" />
                  hello@manuelscloset.com
                </li>
                <li className="flex items-start gap-2.5 text-gray-400 text-sm">
                  <MapPin size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  Accra, Ghana
                </li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:bg-dark-600 transition-all">
                  <Instagram size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Manuel's Closet. All rights reserved.</p>
            <p className="text-gray-700 text-xs">Crafted with ❤️ in Ghana</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;

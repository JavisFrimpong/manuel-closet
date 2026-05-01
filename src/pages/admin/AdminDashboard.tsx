import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, ShoppingBag, LogOut, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  deliveredOrders: number;
}

type Tab = 'overview' | 'products' | 'orders';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, stock_quantity'),
        supabase.from('orders').select('id, status, total_amount'),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        lowStockProducts: products.filter(p => p.stock_quantity <= 5).length,
        totalRevenue: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0),
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange in App.tsx handles the redirect automatically
  };

  const STAT_CARDS = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-400/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Total Revenue',
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      format: (v: number) => `₵${v.toFixed(2)}`,
    },
    {
      label: 'Delivered',
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Low Stock',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      format: (v: number) => v.toString(),
    },
  ];

  const NAV_ITEMS: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col fixed left-0 top-0 h-full z-20">
        {/* Logo */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-xl font-serif">M</span>
            </div>
            <div>
              <p className="text-white font-bold font-serif leading-none">Manuel's</p>
              <p className="text-brand-400 text-xs font-medium tracking-widest uppercase leading-none">Closet Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              id={`admin-nav-${key}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === key
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-dark-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Topbar */}
        <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-white font-bold text-xl capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h1>
        </header>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {STAT_CARDS.map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-dark-600 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium">{card.label}</p>
                        <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                          <Icon className={card.color} size={20} />
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${card.color}`}>
                        {loading ? '—' : card.format(card.value)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-left hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 transition-all group"
                >
                  <Package className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                  <p className="text-white font-bold">Manage Products</p>
                  <p className="text-gray-500 text-sm mt-1">Add, edit, or remove products from your store</p>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-left hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 transition-all group"
                >
                  <ShoppingBag className="text-brand-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                  <p className="text-white font-bold">View Orders</p>
                  <p className="text-gray-500 text-sm mt-1">Track and manage customer orders</p>
                </button>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <ProductsTab />
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <OrdersTab />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

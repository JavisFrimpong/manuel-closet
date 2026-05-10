import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';
import StoreFront from './pages/StoreFront';
import Checkout from './pages/Checkout';
import OrderReview from './pages/OrderReview';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import type { Session } from '@supabase/supabase-js';

function isPasswordRecoveryNavigation(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  return hash.includes('type=recovery') || search.includes('type=recovery');
}

const AdminRoute = () => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [passwordRecoveryEvent, setPasswordRecoveryEvent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryEvent(true);
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecoveryEvent(false);
      }
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (session === null && isPasswordRecoveryNavigation()) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm max-w-sm">Finishing password reset link… If this hangs, open the link again from your email.</p>
        </div>
      </div>
    );
  }

  const showPasswordReset =
    Boolean(session) && (passwordRecoveryEvent || isPasswordRecoveryNavigation());

  if (showPasswordReset) {
    return (
      <AdminLogin
        passwordRecoveryFlow
        onPasswordRecoveryFinished={() => {
          setPasswordRecoveryEvent(false);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/admin');
          }
        }}
      />
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<StoreFront />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-review" element={<OrderReview />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

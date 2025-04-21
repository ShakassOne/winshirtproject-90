
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { syncProductsAndLotteries } from '@/lib/linkSynchronizer';

// Import page components
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import LotteriesPage from '@/pages/LotteriesPage';
import LotteryDetailPage from '@/pages/LotteryDetailPage';
import AccountPage from '@/pages/AccountPage';
import ContactPage from '@/pages/ContactPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import PreviousWinnersPage from '@/pages/PreviousWinnersPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsAndConditionsPage from '@/pages/TermsAndConditionsPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import AdminPlaceholder from '@/pages/admin/AdminPlaceholder';

// Import layout components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarBackground from '@/components/StarBackground';
import AdminNavigationHandler from '@/components/AdminNavigationHandler';

// Import authentication components
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    syncProductsAndLotteries();
  }, []);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <StarBackground />
        <Navbar />
        <Toaster />
        <div className="w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/lottery/:id" element={<LotteryDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/winners" element={<PreviousWinnersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            
            {/* Admin routes with placeholder page */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminNavigationHandler>
                  <AdminPlaceholder />
                </AdminNavigationHandler>
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly={true}>
                <AdminNavigationHandler>
                  <AdminPlaceholder />
                </AdminNavigationHandler>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </Suspense>
    </Router>
  );
}

export default App;

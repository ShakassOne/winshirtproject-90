
import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
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
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminProductsPage from '@/pages/AdminProductsPage';
import AdminLotteriesPage from '@/pages/AdminLotteriesPage';
import AdminClientsPage from '@/pages/AdminClientsPage';
import AdminCommandesPage from '@/pages/AdminCommandesPage';

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
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminDashboardPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminDashboardPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminSettingsPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          {/* Routes manquantes ajoutées ici */}
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminProductsPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/lotteries" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminLotteriesPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/clients" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminClientsPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/commandes" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminCommandesPage />
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/filters" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                <AdminNavigationHandler>
                  {/* Ajout d'un import pour cette page quand elle sera créée */}
                  <div className="pt-32 pb-16">
                    <div className="container mx-auto px-4">
                      <h1 className="text-3xl font-bold text-white mb-6">Gestion des filtres</h1>
                      <p className="text-gray-400">Cette fonctionnalité sera disponible prochainement.</p>
                    </div>
                  </div>
                </AdminNavigationHandler>
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          <Route path="/admin/visuals" element={
            <ProtectedRoute adminOnly={true}>
              <AdminNavigationHandler>
                {/* Ajout d'un import pour cette page quand elle sera créée */}
                <div className="pt-32 pb-16">
                  <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-6">Gestion des visuels</h1>
                    <p className="text-gray-400">Cette fonctionnalité sera disponible prochainement.</p>
                  </div>
                </div>
              </AdminNavigationHandler>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;

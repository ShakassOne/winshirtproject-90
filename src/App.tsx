
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailPage from './pages/LotteryDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PreviousWinnersPage from './pages/PreviousWinnersPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
import AdminFiltersPage from './pages/AdminFiltersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminCommandesPage from './pages/AdminCommandesPage';
import AdminClientsPage from './pages/AdminClientsPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import AdminNavigationHandler from './components/AdminNavigationHandler';

// ScrollToTop component to reset scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  // Effect for setting theme colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Winshirt color palette
    root.style.setProperty('--winshirt-space', '#0c1019');
    root.style.setProperty('--winshirt-space-light', '#151b27');
    root.style.setProperty('--winshirt-space-dark', '#080c12');
    
    root.style.setProperty('--winshirt-purple', '#7c3aed');
    root.style.setProperty('--winshirt-purple-light', '#9869f5');
    root.style.setProperty('--winshirt-purple-dark', '#6026c5');
    
    root.style.setProperty('--winshirt-blue', '#3a86ff');
    root.style.setProperty('--winshirt-blue-light', '#66a3ff');
    root.style.setProperty('--winshirt-blue-dark', '#2e6acd');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Navbar />
        <main className="bg-winshirt-space min-h-screen relative">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/lottery/:id" element={<LotteryDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/previous-winners" element={<PreviousWinnersPage />} />
            <Route path="/terms-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/faq" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<AccountPage />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/lotteries" element={<ProtectedRoute adminOnly={true}><AdminLotteriesPage /></ProtectedRoute>} />
            <Route path="/admin/visuals" element={<ProtectedRoute adminOnly={true}><AdminVisualsPage /></ProtectedRoute>} />
            <Route path="/admin/filters" element={<ProtectedRoute adminOnly={true}><AdminFiltersPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly={true}><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/commandes" element={<ProtectedRoute adminOnly={true}><AdminCommandesPage /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute adminOnly={true}><AdminClientsPage /></ProtectedRoute>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
        <AdminNavigationHandler />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

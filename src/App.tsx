
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
// Import only existing pages and use proper import syntax
import AccountPage from './pages/AccountPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailPage from './pages/LotteryDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
// Remove react-toastify - we'll use shadcn/ui toast instead
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AdminSetupPage from './pages/AdminSetupPage';

// We'll create temporary placeholder pages for missing ones
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <AuthProvider>
          {/* Remove VisualCategoryProvider and ToastContainer references */}
          <Toaster /> {/* Use shadcn/ui toaster instead */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Use placeholder for missing RegisterPage */}
            <Route path="/register" element={<PlaceholderPage title="Register" />} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            {/* Use placeholder for missing ShopPage */}
            <Route path="/shop" element={<PlaceholderPage title="Shop" />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/lottery/:lotteryId" element={<LotteryDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/lotteries" element={<ProtectedRoute adminOnly><AdminLotteriesPage /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute adminOnly><AdminClientsPage /></ProtectedRoute>} />
            {/* Use placeholder for missing AdminOrdersPage */}
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><PlaceholderPage title="Admin Orders" /></ProtectedRoute>} />
            <Route path="/admin/visuals" element={<ProtectedRoute adminOnly><AdminVisualsPage /></ProtectedRoute>} />
            <Route path="/admin/setup" element={<AdminSetupPage />} />
            {/* Use placeholder for missing TermsOfServicePage */}
            <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            {/* Use placeholder for missing CookiePolicyPage */}
            <Route path="/cookies" element={<PlaceholderPage title="Cookie Policy" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;

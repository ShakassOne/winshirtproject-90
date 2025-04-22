
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import ContactPage from '@/pages/ContactPage';
import LotteriesPage from '@/pages/LotteriesPage';
import LotteryDetailPage from '@/pages/LotteryDetailPage';
import PreviousWinnersPage from '@/pages/PreviousWinnersPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminProductsPage from '@/pages/AdminProductsPage';
import AdminFiltersPage from '@/pages/AdminFiltersPage';
import ThemeToggle from '@/components/ThemeToggle';
import AccountPage from '@/pages/AccountPage'; // Using existing AccountPage instead of ProfilePage

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/account" element={<AccountPage />} /> {/* Using AccountPage instead of the missing ProfilePage */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/lotteries" element={<LotteriesPage />} />
                <Route path="/lottery/:id" element={<LotteryDetailPage />} />
                <Route path="/previous-winners" element={<PreviousWinnersPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/filters" element={<AdminFiltersPage />} />
              </Routes>
              <Footer />
            </div>
            <Toaster />
          </QueryClientProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

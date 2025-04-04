
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailPage from './pages/LotteryDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TicketsPage from './pages/TicketsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
import AdminFiltersPage from './pages/AdminFiltersPage'; // Nouvelle page de gestion des filtres

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";

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
        <Navbar />
        <main className="bg-winshirt-space min-h-screen relative">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/lottery/:id" element={<LotteryDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/orders" element={<ProtectedRoute element={<OrdersPage />} />} />
            <Route path="/order/:id" element={<ProtectedRoute element={<OrderDetailPage />} />} />
            <Route path="/tickets" element={<ProtectedRoute element={<TicketsPage />} />} />
            <Route path="/checkout" element={<ProtectedRoute element={<CheckoutPage />} />} />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} isAdmin />} />
            <Route path="/admin/products" element={<ProtectedRoute element={<AdminProductsPage />} isAdmin />} />
            <Route path="/admin/lotteries" element={<ProtectedRoute element={<AdminLotteriesPage />} isAdmin />} />
            <Route path="/admin/visuals" element={<ProtectedRoute element={<AdminVisualsPage />} isAdmin />} />
            <Route path="/admin/filters" element={<ProtectedRoute element={<AdminFiltersPage />} isAdmin />} /> {/* Nouvelle route */}
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

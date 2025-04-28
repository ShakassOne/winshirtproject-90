
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailPage from './pages/LotteryDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminSyncPage from './pages/AdminSyncPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductCustomizationPage from './pages/ProductCustomizationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="products/:productId/customize" element={<ProductCustomizationPage />} />
        <Route path="lotteries" element={<LotteriesPage />} />
        <Route path="lotteries/:lotteryId" element={<LotteryDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/lotteries" element={<AdminLotteriesPage />} />
        <Route path="admin/products" element={<AdminProductsPage />} />
        <Route path="admin/visuals" element={<AdminVisualsPage />} />
        <Route path="admin/orders" element={<AdminOrdersPage />} />
        <Route path="admin/clients" element={<AdminClientsPage />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />
        <Route path="admin/sync" element={<AdminSyncPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

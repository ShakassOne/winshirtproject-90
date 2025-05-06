
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './HomePage';
import Contact from './Contact';
import ShopPage from './ShopPage';
import ProductDetailPage from './ProductDetailPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import LotteriesPage from './LotteriesPage';
import AdminProductsPage from './AdminProductsPage';
import AdminLotteriesPage from './AdminLotteriesPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="lotteries" element={<LotteriesPage />} />
        <Route path="admin/products" element={<AdminProductsPage />} />
        <Route path="admin/lotteries" element={<AdminLotteriesPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;

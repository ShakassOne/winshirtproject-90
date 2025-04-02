
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LotteriesPage from "./pages/LotteriesPage";
import LotteryDetailPage from "./pages/LotteryDetailPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminLotteriesPage from "./pages/AdminLotteriesPage";
import AdminClientsPage from "./pages/AdminClientsPage";
import AdminCommandesPage from "./pages/AdminCommandesPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Composant pour remonter en haut de la page à chaque changement de route
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/lotteries" element={<LotteriesPage />} />
                <Route path="/lotteries/:id" element={<LotteryDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                
                {/* Routes protégées */}
                <Route path="/account" element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } />
                
                {/* Routes Admin protégées */}
                <Route path="/admin/products" element={
                  <ProtectedRoute adminOnly>
                    <AdminProductsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/lotteries" element={
                  <ProtectedRoute adminOnly>
                    <AdminLotteriesPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/clients" element={
                  <ProtectedRoute adminOnly>
                    <AdminClientsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/commandes" element={
                  <ProtectedRoute adminOnly>
                    <AdminCommandesPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute adminOnly>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

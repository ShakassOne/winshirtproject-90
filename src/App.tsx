
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { StarBackground } from '@/components/StarBackground';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { checkSupabaseConnection } from '@/lib/supabase';
import ConstructionMode from '@/components/ConstructionMode';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const LotteriesPage = lazy(() => import('@/pages/LotteriesPage'));
const LotteryDetailPage = lazy(() => import('@/pages/LotteryDetailPage'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminLotteriesPage = lazy(() => import('@/pages/admin/AdminLotteriesPage'));
const AdminProductEditor = lazy(() => import('@/pages/admin/AdminProductEditor'));
const AdminLotteryEditor = lazy(() => import('@/pages/admin/AdminLotteryEditor'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [constructionMode, setConstructionMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Check Supabase connection and construction mode setting
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    
    checkConnection();
    
    // Check construction mode setting
    const savedConstructionPref = localStorage.getItem('constructionMode');
    if (savedConstructionPref !== null) {
      setConstructionMode(savedConstructionPref === 'true');
    }
    
    // Listen for changes to construction mode
    const handleStorageChange = () => {
      const currentSetting = localStorage.getItem('constructionMode');
      if (currentSetting !== null) {
        setConstructionMode(currentSetting === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // For same-tab changes
    const interval = setInterval(() => {
      const currentSetting = localStorage.getItem('constructionMode');
      if (currentSetting !== null && (currentSetting === 'true') !== constructionMode) {
        setConstructionMode(currentSetting === 'true');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <StarBackground />
            <Suspense fallback={<LoadingSpinner />}>
              <Layout>
                <ConstructionMode enabled={constructionMode} />
                
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/lotteries" element={<LotteriesPage />} />
                  <Route path="/lotteries/:id" element={<LotteryDetailPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminProductsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products/:id" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminProductEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/lotteries" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLotteriesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/lotteries/:id" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLotteryEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminSettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Layout>
            </Suspense>
            <Toaster position="bottom-right" />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

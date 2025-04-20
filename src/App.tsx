
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

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
import AdminNavigationHandler from './components/AdminNavigationHandler';
import StarBackground from '@/components/StarBackground';

// Supabase initialization
import { initializeSupabase, forceSupabaseConnection } from './lib/initSupabase';

// ScrollToTop component to reset scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);

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
    
    // Charger les variables CSS personnalisées
    try {
      const savedSettings = localStorage.getItem('winshirt-css-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        Object.entries(settings).forEach(([name, value]) => {
          root.style.setProperty(name, value as string);
        });
      }
      
      // Appliquer le CSS personnalisé
      const customCss = localStorage.getItem('winshirt-custom-css');
      if (customCss) {
        const styleEl = document.createElement('style');
        styleEl.id = 'winshirt-custom-css';
        styleEl.textContent = customCss;
        document.head.appendChild(styleEl);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des styles personnalisés:', error);
    }
  }, []);
  
  // Initialize Supabase with retry logic
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Attempting to initialize Supabase...");
        const success = await initializeSupabase();
        console.log("Supabase initialization result:", success);
        setIsSupabaseInitialized(success);
        
        // Force connection if successful
        if (success) {
          await forceSupabaseConnection();
        }
      } catch (error) {
        console.error("Error during Supabase initialization:", error);
      } finally {
        setInitAttempted(true);
      }
    };
    
    init();
    
    // Retry Supabase initialization every 30 seconds if it failed
    const intervalId = setInterval(() => {
      if (!isSupabaseInitialized) {
        console.log("Retrying Supabase initialization...");
        init();
      } else {
        clearInterval(intervalId);
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isSupabaseInitialized]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <StarBackground />
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
        <Toaster position="top-center" richColors />
        <AdminNavigationHandler />
        
        {/* Supabase Status Indicator for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            className="fixed bottom-4 right-4 p-2 rounded-md text-xs"
            style={{ 
              backgroundColor: isSupabaseInitialized ? 'rgba(0, 128, 0, 0.2)' : 'rgba(128, 0, 0, 0.2)',
              border: `1px solid ${isSupabaseInitialized ? 'rgba(0, 128, 0, 0.5)' : 'rgba(128, 0, 0, 0.5)'}`,
              color: isSupabaseInitialized ? 'rgb(0, 200, 0)' : 'rgb(255, 100, 100)',
              zIndex: 1000
            }}
          >
            Supabase: {initAttempted ? (isSupabaseInitialized ? 'Connected' : 'Offline') : 'Connecting...'}
          </div>
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

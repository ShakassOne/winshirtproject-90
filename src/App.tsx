
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Layouts
import Layout from './pages/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailPage from './pages/LotteryDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/admin/AdminPlaceholder';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminVisualsPage from './pages/AdminVisualsPage';
import AdminOrdersPage from './pages/AdminCommandesPage'; // Renamed from AdminOrdersPage
import AdminClientsPage from './pages/AdminClientsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminSyncPage from './pages/AdminSyncPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import NotFoundPage from './pages/NotFoundPage';
import PreviousWinnersPage from './pages/PreviousWinnersPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  // Add code to initialize the T-Shirt 3D product with print areas to localStorage if it doesn't exist
  React.useEffect(() => {
    const initializeProductWithPrintAreas = () => {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        const tshirt3D = products.find((p: any) => p.name === "T-Shirt 3D" || p.id === 1);
        
        if (tshirt3D && (!tshirt3D.printAreas || tshirt3D.printAreas.length === 0)) {
          // Add print areas to the T-Shirt 3D product
          tshirt3D.allowCustomization = true;
          tshirt3D.printAreas = [
            {
              id: Date.now(),
              name: "Recto",
              position: "front",
              format: "custom",
              bounds: {
                x: 100,
                y: 100,
                width: 200,
                height: 250
              },
              allowCustomPosition: true
            },
            {
              id: Date.now() + 1,
              name: "Verso",
              position: "back",
              format: "custom",
              bounds: {
                x: 100,
                y: 100,
                width: 200,
                height: 250
              },
              allowCustomPosition: true
            }
          ];
          
          // Save the updated product back to localStorage
          localStorage.setItem('products', JSON.stringify(products));
          
          console.log('Customization enabled for T-Shirt 3D product');
        }
      }
    };
    
    initializeProductWithPrintAreas();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ProductsPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="lotteries" element={<LotteriesPage />} />
        <Route path="lotteries/:lotteryId" element={<LotteryDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        
        {/* Protected account page */}
        <Route 
          path="account" 
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected admin routes */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/lotteries" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLotteriesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/products" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProductsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/visuals" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminVisualsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/orders" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/clients" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminClientsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/settings" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/sync" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminSyncPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public routes */}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="winners" element={<PreviousWinnersPage />} />
        <Route path="terms" element={<TermsAndConditionsPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

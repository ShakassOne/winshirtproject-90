
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
        <Route path="winners" element={<PreviousWinnersPage />} />
        <Route path="terms" element={<TermsAndConditionsPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

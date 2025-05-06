
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StarBackground from './components/StarBackground';
import AdminNavigationHandler from './components/AdminNavigationHandler';
import AuthHandler from './components/AuthHandler';

// Import your pages
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLotteriesPage from './pages/AdminLotteriesPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCustomizationPage from './pages/AdminCustomizationPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ProductPage from './pages/ProductPage';
import NotFoundPage from './pages/NotFoundPage';
import LotteriesPage from './pages/LotteriesPage';
import LotteryDetailsPage from './pages/LotteryDetailsPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import WinnerPage from './pages/WinnerPage';

function App() {
  return (
    <ThemeContextProvider>
      <Router>
        <AuthHandler />
        <AdminNavigationHandler>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/lotteries" element={<AdminLotteriesPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/customization" element={<AdminCustomizationPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/lottery/:id" element={<LotteryDetailsPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/winner/:lotteryId" element={<WinnerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AdminNavigationHandler>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
      </Router>
    </ThemeContextProvider>
  );
}

export default App;

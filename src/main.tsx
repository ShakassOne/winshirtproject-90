
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { preloadAllData } from '@/utils/dataLoader';

// Create DataLoader component to preload data before rendering the app
const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Load data when app starts
    preloadAllData().catch(console.error);
  }, []);
  
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <DataLoader>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </DataLoader>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

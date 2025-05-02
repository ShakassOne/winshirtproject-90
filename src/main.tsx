
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { initializeLotteryData } from './data/mockData';
import { AuthProvider } from './contexts/AuthContext';
import { checkSupabaseConnection } from './lib/supabase';
import { preloadAllData } from './services/preloadService';

// Initialize mock data
initializeLotteryData();

// Préchargement des données
preloadAllData().catch(console.error);

// Check Supabase connection and store status
checkSupabaseConnection().then(connected => {
  localStorage.setItem('supabase_connected', connected ? 'true' : 'false');
  console.log("Supabase connection initialized:", connected ? "Connected" : "Not connected");
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

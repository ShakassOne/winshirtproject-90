
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicBackground from '@/components/backgrounds/DynamicBackground';
import { Toaster } from '@/components/ui/toaster';
import { forceSupabaseConnection, checkRequiredTables } from '@/lib/supabase';
import { toast } from '@/lib/toast';

const Layout = () => {
  // Try to establish Supabase connection and synchronize necessary data when app loads
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check theme from localStorage and apply it
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
        
        // Try to establish Supabase connection
        const isConnected = await forceSupabaseConnection();
        
        if (isConnected) {
          // Check required tables
          const tablesStatus = await checkRequiredTables();
          if (!tablesStatus.exists) {
            console.warn("Missing required tables:", tablesStatus.missing);
          }
          
          // Remove sync attempt since syncLocalDataToSupabase might not be fully implemented
          console.log("Supabase connected successfully");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    
    initializeApp();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicBackground />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ThemeToggle />
      <Toaster />
    </div>
  );
};

export default Layout;

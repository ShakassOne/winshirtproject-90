
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicBackground from '@/components/backgrounds/DynamicBackground';
import { Toaster } from '@/components/ui/toaster';
import { forceSupabaseConnection } from '@/lib/supabase';

const Layout = () => {
  // Try to establish Supabase connection when app loads
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await forceSupabaseConnection();
      } catch (error) {
        console.error("Error checking Supabase connection:", error);
      }
    };
    
    checkConnection();
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

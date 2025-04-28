
import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
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

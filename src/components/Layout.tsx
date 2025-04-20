
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

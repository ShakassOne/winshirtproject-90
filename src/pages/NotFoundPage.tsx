
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // If the user was redirected to a 404 page from a missing URL like '/confirmation',
  // we'll check if there's a way to recover by redirecting them to an expected page
  useEffect(() => {
    // If we're hitting this from a redirection from '/confirmation', and we have an order confirmation
    // in the session, redirect back to the correct URL
    if (location.pathname === '/confirmation') {
      const lastOrderInfo = sessionStorage.getItem('last_order_info');
      if (lastOrderInfo) {
        // The order exists so redirect to the confirmation page (should now be registered in the routes)
        navigate('/confirmation');
      } else {
        // No order but trying to access confirmation, send to cart instead
        navigate('/cart');
      }
    }
  }, [location, navigate]);

  return (
    <>
      <StarBackground />
      
      <section className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-8xl font-bold text-winshirt-purple-light mb-4">404</h1>
          <h2 className="text-4xl font-semibold text-white mb-6">Page introuvable</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-winshirt-purple hover:bg-winshirt-purple-dark rounded-full px-8">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;

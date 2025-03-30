
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';

const NotFoundPage: React.FC = () => {
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

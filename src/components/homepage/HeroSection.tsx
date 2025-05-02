
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-b from-winshirt-space-dark to-winshirt-space py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
            Tentez votre chance avec WinShirt
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Participez à nos loteries exclusives et gagnez des articles uniques de notre collection
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/lotteries')} 
              size="lg"
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white"
            >
              Voir les loteries
            </Button>
            <Button 
              onClick={() => navigate('/shop')} 
              size="lg"
              variant="outline"
              className="border-winshirt-blue text-winshirt-blue hover:bg-winshirt-blue/10"
            >
              Découvrir nos produits
            </Button>
          </div>
        </div>
      </div>
      
      {/* Décoration en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-winshirt-purple rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-winshirt-blue rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-48 left-1/4 w-96 h-96 bg-winshirt-purple-light rounded-full blur-[100px]"></div>
      </div>
    </section>
  );
};

export default HeroSection;

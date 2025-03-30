
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarBackground from '@/components/StarBackground';
import RotatingLottery from '@/components/RotatingLottery';
import ProductCard from '@/components/ProductCard';
import { mockLotteries, mockProducts } from '@/data/mockData';

const HomePage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight animate-float">
              <span className="text-winshirt-purple-light">Portez</span> Votre Style,<br />
              <span className="text-winshirt-blue-light">Tentez</span> Votre Chance!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl">
              Un concept innovant qui allie mode et loterie.
              Achetez un t-shirt, obtenez vos tickets de participation,
              et gagnez des lots exceptionnels!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full px-8">
                  Voir les T-shirts
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-winshirt-blue-light text-winshirt-blue-light hover:bg-winshirt-blue/10 rounded-full px-8">
                  Comment ça marche
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rotating Lotteries */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Lots Exceptionnels à Gagner</h2>
            <p className="text-xl text-gray-300">Des lots de rêve vous attendent. À vous de jouer!</p>
          </div>
          
          <RotatingLottery lotteries={mockLotteries} />
          
          <div className="text-center mt-10">
            <Link to="/lotteries">
              <Button className="bg-winshirt-blue hover:bg-winshirt-blue-dark text-white rounded-full px-8">
                Voir toutes les loteries
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-winshirt-space-light/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">T-shirts Tendance</h2>
            <p className="text-xl text-gray-300">Style unique, qualité premium, et chance de gagner</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/products">
              <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full px-8">
                Voir tous les T-shirts
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Comment Ça Marche</h2>
            <p className="text-xl text-gray-300">Simple, transparent et fun!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="winshirt-card p-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-winshirt-purple/30 flex items-center justify-center mb-4 text-winshirt-purple-light text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Choisissez un T-shirt</h3>
              <p className="text-gray-300">Parcourez notre collection et choisissez le T-shirt qui vous plaît le plus.</p>
            </div>
            
            <div className="winshirt-card p-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-winshirt-blue/30 flex items-center justify-center mb-4 text-winshirt-blue-light text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Sélectionnez une Loterie</h3>
              <p className="text-gray-300">Chaque T-shirt vous donne droit à une participation à la loterie de votre choix.</p>
            </div>
            
            <div className="winshirt-card p-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-winshirt-purple/30 flex items-center justify-center mb-4 text-winshirt-purple-light text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Tentez Votre Chance</h3>
              <p className="text-gray-300">Recevez votre ticket de participation et attendez le tirage au sort!</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" className="border-winshirt-blue-light text-winshirt-blue-light hover:bg-winshirt-blue/10 rounded-full px-8">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-winshirt-space-light/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="winshirt-card p-6">
              <h3 className="text-4xl font-bold text-winshirt-purple-light mb-2">3000+</h3>
              <p className="text-gray-300">T-shirts vendus</p>
            </div>
            
            <div className="winshirt-card p-6">
              <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">24</h3>
              <p className="text-gray-300">Loteries terminées</p>
            </div>
            
            <div className="winshirt-card p-6">
              <h3 className="text-4xl font-bold text-winshirt-purple-light mb-2">18</h3>
              <p className="text-gray-300">Gagnants heureux</p>
            </div>
            
            <div className="winshirt-card p-6">
              <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">100K+</h3>
              <p className="text-gray-300">Valeur des lots distribués</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="winshirt-card p-8 md:p-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Prêt à Tenter Votre Chance?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Rejoignez des milliers de participants et tentez de remporter des lots exceptionnels.
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full px-10">
                  Acheter Maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

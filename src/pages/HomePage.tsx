
import React from 'react';
import { Link } from 'react-router-dom';
import LotteryCard from '../components/LotteryCard';
import ProductCard from '../components/ProductCard';
import RotatingLottery from '../components/RotatingLottery';
import StarBackground from '../components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { mockLotteries, mockProducts } from '../data/mockData';

// Show only active lotteries
const activeLotteries = mockLotteries.filter(lottery => lottery.status === 'active');

// Get popular products
const popularProducts = [...mockProducts]
  .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  .slice(0, 4);

const HomePage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Achetez des vêtements, <br />Gagnez des cadeaux incroyables
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            WinShirt révolutionne le shopping en ligne. Achetez nos vêtements de qualité et participez automatiquement à nos loteries exclusives pour gagner des prix exceptionnels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir les produits
              </button>
            </Link>
            <Link to="/lotteries">
              <button className="bg-winshirt-blue hover:bg-winshirt-blue-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir les loteries
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <svg 
            className="animate-bounce w-6 h-6 text-winshirt-purple-light" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>
      
      {/* Featured Lottery Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue text-center">
            Loteries en vedette
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Découvrez nos loteries exclusives. Chaque achat vous rapproche d'un gain exceptionnel.
          </p>
          
          {/* Rotating lottery display */}
          <div className="max-w-4xl mx-auto">
            <RotatingLottery lotteries={activeLotteries} />
          </div>
          
          <div className="text-center mt-12">
            <Link to="/lotteries">
              <button className="bg-winshirt-blue hover:bg-winshirt-blue-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir toutes les loteries
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Popular Products Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue text-center">
            Produits populaires
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Découvrez nos vêtements tendance qui vous permettent de participer à nos loteries.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir tous les produits
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 relative bg-winshirt-space-light/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue text-center">
            Comment ça marche
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Un concept unique qui révolutionne votre expérience shopping.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="winshirt-card p-6 text-center">
              <div className="w-16 h-16 bg-winshirt-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-winshirt-purple-light">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Achetez un produit</h3>
              <p className="text-gray-400">
                Parcourez notre collection de vêtements et trouvez celui qui vous plaît.
              </p>
            </div>
            
            <div className="winshirt-card p-6 text-center">
              <div className="w-16 h-16 bg-winshirt-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-winshirt-blue-light">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Participez automatiquement</h3>
              <p className="text-gray-400">
                Chaque achat vous inscrit automatiquement à la loterie liée au produit.
              </p>
            </div>
            
            <div className="winshirt-card p-6 text-center">
              <div className="w-16 h-16 bg-winshirt-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-winshirt-purple-light">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Gagnez des prix incroyables</h3>
              <p className="text-gray-400">
                Une fois le seuil de participants atteint, un gagnant est tiré au sort.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <button className="bg-gradient-to-r from-winshirt-purple to-winshirt-blue hover:from-winshirt-purple-dark hover:to-winshirt-blue-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                En savoir plus
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

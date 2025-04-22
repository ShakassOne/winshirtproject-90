import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LotteryCard from '../components/LotteryCard';
import ProductCard from '../components/ProductCard';
import RotatingLottery from '../components/RotatingLottery';
import StarBackground from '../components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StatsSection from '@/components/home/StatsSection';
import WinnersCarousel from '@/components/home/WinnersCarousel';
import HomeIntroSlider from '@/components/home/HomeIntroSlider';
import { mockLotteries, mockProducts } from '../data/mockData';
import { mockWinners } from '@/data/mockWinners';
import { ExtendedLottery } from '@/types/lottery';

const HomePage: React.FC = () => {
  const [activeLotteries, setActiveLotteries] = useState<ExtendedLottery[]>([]);
  const [popularProducts, setPopularProducts] = useState([]);
  
  // Chargement des loteries et produits
  useEffect(() => {
    // Chargement des loteries
    const loadLotteries = () => {
      try {
        const storedLotteries = localStorage.getItem('lotteries');
        if (storedLotteries) {
          const parsedLotteries = JSON.parse(storedLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            const active = parsedLotteries.filter(lottery => lottery.status === 'active');
            setActiveLotteries(active);
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des loteries:", error);
      }
      
      // Fallback aux loteries mock
      setActiveLotteries(mockLotteries.filter(lottery => lottery.status === 'active'));
    };
    
    // Chargement des produits populaires
    const loadPopularProducts = () => {
      try {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            const popular = [...parsedProducts]
              .sort((a, b) => ((b.popularity || 0) - (a.popularity || 0)))
              .slice(0, 4);
            setPopularProducts(popular);
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
      
      // Fallback aux produits mock
      setPopularProducts([...mockProducts]
        .sort((a, b) => ((b.popularity || 0) - (a.popularity || 0)))
        .slice(0, 4));
    };
    
    loadLotteries();
    loadPopularProducts();
    
    // Écouter les changements dans localStorage
    window.addEventListener('storage', loadLotteries);
    window.addEventListener('storageUpdate', loadLotteries);
    
    return () => {
      window.removeEventListener('storage', loadLotteries);
      window.removeEventListener('storageUpdate', loadLotteries);
    };
  }, []);
  
  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigation />
      
      {/* Hero Section avec slider configurable */}
      <HomeIntroSlider />
      
      {/* Featured Lottery Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue text-center">
            Loteries en vedette
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Découvrez nos loteries exclusives. Chaque achat vous rapproche d'un gain exceptionnel.
          </p>
          
          {/* Rotating lottery display - 3D carousel */}
          <div className="w-full mt-16">
            <RotatingLottery lotteries={activeLotteries} />
          </div>
          
          <div className="text-center mt-4">
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
      
      {/* Stats Section - NOUVELLE SECTION */}
      <StatsSection />
      
      {/* Winners Carousel - NOUVELLE SECTION */}
      <section className="py-20 relative bg-winshirt-space/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue text-center">
            Nos heureux gagnants
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Découvrez les gagnants de nos précédentes loteries et les lots exceptionnels qu'ils ont remportés.
          </p>
          
          <WinnersCarousel winners={mockWinners} />
        </div>
      </section>
    </>
  );
};

export default HomePage;

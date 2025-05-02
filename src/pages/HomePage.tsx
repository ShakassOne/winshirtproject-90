
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/homepage/HeroSection';
import RotatingLottery from '@/components/RotatingLottery';
import ProductCard from '@/components/ProductCard';
import { fetchFeaturedLotteries } from '@/api/lotteryApi';
import { fetchFeaturedProducts } from '@/api/productApi';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [featuredLotteries, setFeaturedLotteries] = useState<ExtendedLottery[]>([]);
  const [popularProducts, setPopularProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Chargement des loteries en vedette
        const lotteries = await fetchFeaturedLotteries();
        setFeaturedLotteries(lotteries);
        
        // Chargement des produits populaires
        const products = await fetchFeaturedProducts();
        setPopularProducts(products);
      } catch (error) {
        console.error('Erreur lors du chargement des données de la page d\'accueil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Lotteries Section */}
      <section className="py-16 bg-gradient-to-b from-winshirt-space to-winshirt-space-light">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Loteries en vedette
            </h2>
            <Link to="/lotteries" className="text-winshirt-blue hover:text-winshirt-blue-light">
              Voir toutes les loteries
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-winshirt-purple"></div>
            </div>
          ) : featuredLotteries.length > 0 ? (
            <RotatingLottery lotteries={featuredLotteries} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Aucune loterie en vedette pour le moment</p>
              <Button onClick={() => navigate('/lotteries')} className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                Découvrir toutes les loteries
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Popular Products Section */}
      <section className="py-16 bg-winshirt-space">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Produits populaires
            </h2>
            <Link to="/shop" className="text-winshirt-blue hover:text-winshirt-blue-light">
              Voir tous les produits
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-winshirt-purple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-winshirt-purple/20 to-winshirt-blue/20 border-y border-winshirt-purple/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à gagner des prix exclusifs ?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Rejoignez nos loteries aujourd'hui et courez la chance de remporter des articles uniques tout en soutenant notre marque.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/lotteries')}
              size="lg"
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white"
            >
              Participer aux loteries
            </Button>
            <Button 
              onClick={() => navigate('/shop')}
              variant="outline"
              size="lg"
              className="border-winshirt-blue text-winshirt-blue hover:bg-winshirt-blue/10"
            >
              Découvrir nos produits
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

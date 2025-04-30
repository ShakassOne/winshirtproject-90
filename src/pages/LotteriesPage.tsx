
import React from 'react';
import { useLotteries } from '@/services/lotteryService';
import LotteryGrid from '@/components/lottery/LotteryGrid';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';
import LoadingSpinner from '@/components/LoadingSpinner';

const LotteriesPage: React.FC = () => {
  const { lotteries, loading, error, refreshLotteries } = useLotteries();
  
  // Filtrer les loteries en vedette pour le slider
  const featuredLotteries = lotteries.filter(lottery => lottery.featured === true);

  return (
    <section className="min-h-screen">
      {/* Afficher le slider des loteries en vedette seulement s'il y en a */}
      {featuredLotteries.length > 0 && (
        <FeaturedLotterySlider lotteries={featuredLotteries} />
      )}

      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Nos Loteries</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Participez à nos loteries pour tenter de remporter des produits exclusifs WinShirt.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              Une erreur est survenue lors du chargement des loteries.
              <button 
                onClick={() => refreshLotteries()}
                className="mt-4 bg-winshirt-pink hover:bg-winshirt-pink-dark text-black font-bold py-2 px-4 rounded"
              >
                Réessayer
              </button>
            </div>
          ) : lotteries.length > 0 ? (
            <LotteryGrid lotteries={lotteries} />
          ) : (
            <div className="text-center text-gray-300 py-10">
              Aucune loterie n'est disponible pour le moment.
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default LotteriesPage;

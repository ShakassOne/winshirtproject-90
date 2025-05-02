
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExtendedLottery } from '@/types/lottery';
import { Button } from '@/components/ui/button';
import { fetchLotteries } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';

const LotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLotteries = async () => {
      setLoading(true);
      try {
        console.log('Fetching lotteries...');
        const lotteriesData = await fetchLotteries();
        console.log('Lotteries fetched:', lotteriesData);
        setLotteries(lotteriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching lotteries:', err);
        setError('Erreur lors du chargement des loteries.');
        toast.error('Erreur lors du chargement des loteries.');
      } finally {
        setLoading(false);
      }
    };

    getLotteries();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Nos loteries</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-winshirt-purple"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8">
          <p className="text-red-400">{error}</p>
          <Button 
            onClick={() => fetchLotteries().then(data => setLotteries(data)).catch(err => console.error(err))}
            className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
          >
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.filter(lottery => lottery.status === 'active').map((lottery) => (
            <Link to={`/lotteries/${lottery.id}`} key={lottery.id} className="block">
              <div className="relative bg-winshirt-space/60 backdrop-blur-lg rounded-lg overflow-hidden border border-winshirt-purple/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-winshirt-purple/20">
                {lottery.featured && (
                  <div className="absolute top-0 right-0 bg-winshirt-blue-light text-white px-3 py-1 rounded-bl-lg text-sm font-medium z-10">
                    Vedette
                  </div>
                )}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={lottery.image} 
                    alt={lottery.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="text-xl font-bold text-white">{lottery.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-300 line-clamp-2 h-12">{lottery.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-winshirt-purple-light">{lottery.currentParticipants}</span>
                      <span className="text-gray-400">/{lottery.targetParticipants} participants</span>
                    </div>
                    <div className="text-winshirt-blue-light font-bold">{lottery.value}€</div>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-winshirt-purple" 
                      style={{ width: `${Math.min((lottery.currentParticipants / lottery.targetParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 text-center">
                    <Button className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark">
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && !error && lotteries.filter(lottery => lottery.status === 'active').length === 0 && (
        <div className="text-center p-8">
          <p className="text-gray-400">Aucune loterie active pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default LotteriesPage;

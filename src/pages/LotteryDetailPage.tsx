
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchLotteryById } from '@/api/lotteryApi';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';

const LotteryDetailPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const [lottery, setLottery] = useState<ExtendedLottery | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getLotteryDetails = async () => {
      if (!lotteryId) return;
      
      setLoading(true);
      try {
        const id = parseInt(lotteryId, 10);
        if (isNaN(id)) {
          throw new Error('ID de loterie invalide');
        }
        
        const data = await fetchLotteryById(id);
        if (!data) {
          throw new Error('Loterie non trouvée');
        }
        
        setLottery(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la loterie:", error);
        toast.error("Impossible de charger les détails de la loterie");
      } finally {
        setLoading(false);
      }
    };

    getLotteryDetails();
  }, [lotteryId]);

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-winshirt-purple"></div>
      </div>
    );
  }

  if (!lottery) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Loterie non trouvée</h2>
        <p className="text-gray-300 mb-6">
          Nous n'avons pas pu trouver la loterie que vous recherchez.
        </p>
        <Button 
          onClick={() => navigate('/lotteries')}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
        >
          Retour aux loteries
        </Button>
      </div>
    );
  }

  // Calculez le pourcentage de progression
  const progressPercentage = Math.min(
    (lottery.currentParticipants / lottery.targetParticipants) * 100,
    100
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-winshirt-space/60 backdrop-blur-lg rounded-lg overflow-hidden border border-winshirt-purple/30">
          <div className="relative aspect-[4/3]">
            <img 
              src={lottery.image} 
              alt={lottery.title} 
              className="w-full h-full object-cover"
            />
            {lottery.featured && (
              <div className="absolute top-0 right-0 bg-winshirt-blue-light text-white px-3 py-1 rounded-bl-lg text-sm font-medium z-10">
                Vedette
              </div>
            )}
            {lottery.status !== 'active' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="bg-red-600/90 text-white px-6 py-3 rounded-md text-xl font-bold uppercase">
                  {lottery.status === 'completed' ? 'Terminée' : 
                   lottery.status === 'relaunched' ? 'Relancée' : 'Annulée'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">{lottery.title}</h1>
            <p className="text-gray-300 mb-6">{lottery.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valeur du prix:</span>
                <span className="text-winshirt-blue-light font-bold text-xl">{lottery.value}€</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Participants:</span>
                <span className="text-white">
                  <span className="text-winshirt-purple-light">{lottery.currentParticipants}</span>
                  /{lottery.targetParticipants}
                </span>
              </div>
              
              {lottery.drawDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date du tirage:</span>
                  <span className="text-white">
                    {new Date(lottery.drawDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              
              {lottery.endDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date de fin:</span>
                  <span className="text-white">
                    {new Date(lottery.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              
              <div className="pt-2">
                <div className="text-gray-400 mb-2">Progression:</div>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-winshirt-purple transition-all duration-700 ease-in-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-gray-400">0%</span>
                  <span className="text-gray-400">100%</span>
                </div>
              </div>
            </div>
          </div>
          
          {lottery.status === 'active' && (
            <div className="mt-4">
              <Button 
                className="w-full py-6 text-lg bg-winshirt-blue hover:bg-winshirt-blue-dark"
                onClick={() => navigate('/shop')}
              >
                Participer en achetant un produit
              </Button>
              <p className="text-gray-400 text-sm mt-2 text-center">
                Achetez un produit lié à cette loterie pour participer au tirage
              </p>
            </div>
          )}
          
          {lottery.status !== 'active' && (
            <Button 
              className="w-full py-6 text-lg bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
              disabled
            >
              Cette loterie n'est plus disponible
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryDetailPage;

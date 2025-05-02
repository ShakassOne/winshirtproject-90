import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExtendedLottery, Participant } from "@/types/lottery";
import StarBackground from "@/components/StarBackground";
import { ArrowLeft, Calendar, Gift, Trophy, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { fetchLotteryById } from "@/api/lotteryApi";

const LotteryDetailPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const [lottery, setLottery] = useState<ExtendedLottery | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadLottery = async () => {
      setIsLoading(true);
      try {
        if (!lotteryId) {
          throw new Error("ID de loterie manquant");
        }
        
        const lotteryIdNum = Number(lotteryId);
        const fetchedLottery = await fetchLotteryById(lotteryIdNum);
        
        if (fetchedLottery) {
          console.log("Lottery loaded:", fetchedLottery);
          setLottery(fetchedLottery);
        } else {
          toast.error("Loterie non trouvée");
          navigate("/lotteries");
        }
      } catch (error) {
        console.error("Error fetching lottery:", error);
        toast.error("Erreur lors du chargement de la loterie");
        navigate("/lotteries");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLottery();
  }, [lotteryId, navigate]);
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const progressPercent = lottery
    ? Math.min((lottery.currentParticipants / lottery.targetParticipants) * 100, 100)
    : 0;
  
  if (isLoading) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-24 container mx-auto px-4">
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-pulse text-xl text-white">Chargement...</div>
          </div>
        </div>
      </>
    );
  }
  
  if (!lottery) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-24 container mx-auto px-4">
          <div className="text-center py-16">
            <h3 className="text-xl text-gray-400 mb-2">Loterie non trouvée</h3>
            <p className="text-gray-500 mb-8">
              La loterie que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button 
              variant="default"
              className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
              onClick={() => navigate('/lotteries')}
            >
              Retour aux loteries
            </Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to="/lotteries" className="text-gray-400 hover:text-white flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Retour aux loteries</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image et info rapide */}
            <div>
              <div className="relative rounded-lg overflow-hidden mb-6 border border-winshirt-space-light">
                <img
                  src={lottery.image}
                  alt={lottery.title}
                  className="w-full object-cover"
                  style={{ height: "400px" }}
                />
                <div className="absolute top-4 right-4 bg-winshirt-blue-dark/90 text-white px-4 py-2 rounded-lg">
                  <span className="font-semibold">Valeur: {lottery.value.toFixed(2)} €</span>
                </div>
                {lottery.status !== 'active' && (
                  <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg ${
                    lottery.status === 'completed' 
                      ? 'bg-green-600/90' 
                      : lottery.status === 'cancelled'
                        ? 'bg-red-600/90'
                        : 'bg-winshirt-purple-dark/90'
                  }`}>
                    <span className="font-semibold">
                      {lottery.status === 'completed' ? 'Terminée' : 
                      lottery.status === 'cancelled' ? 'Annulée' : 'Relancée'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Informations de participation */}
              <Card className="winshirt-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Participation</h3>
                <div className="space-y-4">
                  {lottery.winner ? (
                    <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white flex items-center gap-2 mb-2">
                        <Trophy className="text-green-400" size={20} />
                        Loterie terminée
                      </h4>
                      <p className="text-gray-300 mb-2">
                        Cette loterie a été remportée par <span className="font-medium text-white">{lottery.winner.name}</span>
                        {lottery.drawDate && (
                          <span> le {formatDate(lottery.drawDate)}</span>
                        )}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Félicitations au gagnant !
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-winshirt-blue-light flex items-center gap-2">
                          <Users size={16} />
                          {lottery.currentParticipants} participants
                        </span>
                        <span className="text-gray-400">
                          Objectif: {lottery.targetParticipants}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2 bg-winshirt-space-light" />
                      
                      <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <Calendar size={16} className="text-winshirt-purple-light" />
                        <span>
                          Date de tirage: <span className="text-white">{formatDate(lottery.endDate)}</span>
                        </span>
                      </div>
                      
                      {lottery.status === 'active' && (
                        <div className="mt-6">
                          <Link to={`/products?lottery=${lottery.id}`} className="w-full">
                            <Button className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark flex items-center gap-2">
                              <Gift size={16} />
                              Participer à cette loterie
                            </Button>
                          </Link>
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Achetez un produit associé à cette loterie pour participer
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Description et autres infos */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">{lottery.title}</h1>
              
              <div className="bg-gradient-to-r from-winshirt-purple/20 to-winshirt-blue/20 p-6 rounded-lg mb-8 border border-winshirt-space-light">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 whitespace-pre-line">
                  {lottery.description}
                </p>
              </div>
              
              {/* Produits associés */}
              <div className="winshirt-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Comment participer</h2>
                <p className="text-gray-300 mb-4">
                  Pour participer à cette loterie, achetez un des produits associés. Chaque produit permet d'obtenir un ou plusieurs tickets de participation.
                </p>
                <Link to={`/products?lottery=${lottery.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-winshirt-purple/30 hover:bg-winshirt-purple/20">
                    Voir les produits associés à cette loterie
                  </Button>
                </Link>
              </div>
              
              {/* Conditions de participation */}
              <div className="winshirt-card p-6 mt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Conditions</h2>
                <ul className="text-gray-300 space-y-2 list-disc pl-5">
                  <li>Le tirage au sort aura lieu dès que l'objectif de participation sera atteint ou à la date indiquée si l'objectif n'est pas atteint.</li>
                  <li>Le gagnant sera contacté par email pour recevoir son lot.</li>
                  <li>Aucun échange ou remboursement ne sera possible.</li>
                  <li>Loterie réservée aux personnes majeures.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LotteryDetailPage;

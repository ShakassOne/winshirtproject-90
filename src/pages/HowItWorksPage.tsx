
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';

const HowItWorksPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Comment Ça Marche</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              WinShirt est un concept unique qui allie mode et loterie.
              Voici tout ce que vous devez savoir sur notre fonctionnement.
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="winshirt-card p-6">
              <div className="mb-4 w-16 h-16 rounded-full bg-winshirt-purple/30 flex items-center justify-center text-winshirt-purple-light text-2xl font-bold">
                1
              </div>
              <h2 className="text-xl font-semibold mb-3 text-white">Choisissez un T-shirt</h2>
              <p className="text-gray-300 mb-4">
                Parcourez notre collection et choisissez le T-shirt qui vous plaît le plus.
                Nos T-shirts sont fabriqués avec des matériaux de qualité et arborent des designs uniques.
              </p>
              <Link to="/products">
                <Button className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
                  Voir les T-shirts
                </Button>
              </Link>
            </div>
            
            <div className="winshirt-card p-6">
              <div className="mb-4 w-16 h-16 rounded-full bg-winshirt-blue/30 flex items-center justify-center text-winshirt-blue-light text-2xl font-bold">
                2
              </div>
              <h2 className="text-xl font-semibold mb-3 text-white">Sélectionnez une Loterie</h2>
              <p className="text-gray-300 mb-4">
                Au moment de l'achat, choisissez la loterie à laquelle vous souhaitez participer.
                Chaque T-shirt acheté = 1 participation à la loterie de votre choix.
                Vous pouvez voir les lots en jeu pour chaque loterie.
              </p>
              <Link to="/lotteries">
                <Button className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark">
                  Voir les loteries
                </Button>
              </Link>
            </div>
            
            <div className="winshirt-card p-6">
              <div className="mb-4 w-16 h-16 rounded-full bg-winshirt-purple/30 flex items-center justify-center text-winshirt-purple-light text-2xl font-bold">
                3
              </div>
              <h2 className="text-xl font-semibold mb-3 text-white">Tentez Votre Chance</h2>
              <p className="text-gray-300 mb-4">
                Après votre achat, vous recevez automatiquement un ticket de participation
                à la loterie sélectionnée. Suivez l'avancement dans votre espace client
                et attendez le tirage au sort!
              </p>
              <Link to="/account">
                <Button className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
                  Voir mes participations
                </Button>
              </Link>
            </div>
          </div>
          
          {/* FAQ */}
          <div className="winshirt-card p-8 mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">Questions Fréquentes</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">
                  Comment se déroule le tirage au sort?
                </h3>
                <p className="text-gray-300">
                  Le tirage au sort est effectué automatiquement lorsque le seuil minimum
                  de participations est atteint. Un algorithme sélectionne aléatoirement
                  un gagnant parmi tous les participants. Le résultat est annoncé sur le site et
                  le gagnant est notifié par email.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">
                  Que se passe-t-il si le seuil n'est pas atteint?
                </h3>
                <p className="text-gray-300">
                  Si le seuil minimum de participations n'est pas atteint dans le délai estimé,
                  la loterie est mise en pause puis relancée automatiquement avec les mêmes conditions.
                  Toutes les participations précédentes sont conservées. Il n'y a pas de remboursement ni de
                  limite de relances.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">
                  Comment puis-je augmenter mes chances de gagner?
                </h3>
                <p className="text-gray-300">
                  Chaque T-shirt acheté correspond à une participation. Vous pouvez donc augmenter
                  vos chances en achetant plusieurs T-shirts liés à la même loterie. Vous pouvez également
                  participer à plusieurs loteries différentes pour tenter de gagner divers lots.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">
                  Comment sont livrés les lots?
                </h3>
                <p className="text-gray-300">
                  Les lots sont expédiés au gagnant dans un délai de 15 jours après l'annonce des résultats.
                  Les frais de livraison sont entièrement pris en charge par WinShirt. Pour les lots
                  de grande valeur ou volumineux, nous prenons contact avec le gagnant pour organiser
                  la livraison ou la remise du lot.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-winshirt-purple-light mb-2">
                  Puis-je participer sans acheter de T-shirt?
                </h3>
                <p className="text-gray-300">
                  Non, la participation aux loteries est exclusivement liée à l'achat d'un T-shirt.
                  Chaque T-shirt de notre collection donne droit à une participation à la loterie de votre choix.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6 text-white">Prêt à tenter votre chance?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-winshirt-purple hover:bg-winshirt-purple-dark rounded-full px-8">
                  Voir les T-shirts
                </Button>
              </Link>
              <Link to="/lotteries">
                <Button size="lg" className="bg-winshirt-blue hover:bg-winshirt-blue-dark rounded-full px-8">
                  Voir les loteries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorksPage;

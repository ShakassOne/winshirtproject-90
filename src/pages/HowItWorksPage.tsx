
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          
          <Tabs defaultValue="howItWorks" className="w-full mb-8">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
              <TabsTrigger value="howItWorks">Comment ça marche</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="howItWorks">
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
            </TabsContent>
            
            <TabsContent value="faq">
              <div className="winshirt-card p-8 mb-16">
                <h2 className="text-2xl font-semibold mb-6 text-white text-center">Questions Fréquentes</h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Comment se déroule le tirage au sort?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Le tirage au sort est effectué automatiquement lorsque le seuil minimum
                      de participations est atteint. Un algorithme sélectionne aléatoirement
                      un gagnant parmi tous les participants. Le résultat est annoncé sur le site et
                      le gagnant est notifié par email.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Que se passe-t-il si le seuil n'est pas atteint?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Si le seuil minimum de participations n'est pas atteint dans le délai estimé,
                      la loterie est mise en pause puis relancée automatiquement avec les mêmes conditions.
                      Toutes les participations précédentes sont conservées. Il n'y a pas de remboursement ni de
                      limite de relances.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Comment puis-je augmenter mes chances de gagner?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Chaque T-shirt acheté correspond à une participation. Vous pouvez donc augmenter
                      vos chances en achetant plusieurs T-shirts liés à la même loterie. Vous pouvez également
                      participer à plusieurs loteries différentes pour tenter de gagner divers lots.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Comment sont livrés les lots?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Les lots sont expédiés au gagnant dans un délai de 15 jours après l'annonce des résultats.
                      Les frais de livraison sont entièrement pris en charge par WinShirt. Pour les lots
                      de grande valeur ou volumineux, nous prenons contact avec le gagnant pour organiser
                      la livraison ou la remise du lot.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Puis-je participer sans acheter de T-shirt?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Non, la participation aux loteries est exclusivement liée à l'achat d'un T-shirt.
                      Chaque T-shirt de notre collection donne droit à une participation à la loterie de votre choix.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Quels types de lots puis-je gagner?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Notre catalogue de lots est très varié : des produits high-tech (smartphones, consoles de jeux, etc.), 
                      des voyages, des cartes cadeaux, des véhicules, et même des crypto-monnaies. 
                      Chaque loterie propose un lot différent dont la valeur est clairement indiquée.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7" className="border-b border-winshirt-purple/20">
                    <AccordionTrigger className="text-lg font-medium text-winshirt-purple-light py-4">
                      Comment personnaliser mon T-shirt?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      Pour les T-shirts personnalisables, vous pouvez ajouter un visuel parmi notre catalogue 
                      de designs. Sur la page du produit, cliquez sur l'onglet "Personnaliser" puis choisissez 
                      le design qui vous plaît. Vous pouvez ensuite ajuster sa position et sa taille.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
          
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

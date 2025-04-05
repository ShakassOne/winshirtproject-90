
import React from 'react';
import StarBackground from '@/components/StarBackground';
import { mockWinners } from '@/data/mockWinners';

const PreviousWinnersPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Gagnants précédents</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez tous les chanceux qui ont remporté nos loteries. Pourquoi pas vous la prochaine fois ?
            </p>
          </div>
          
          <div className="winshirt-card p-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-winshirt-purple/20 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-winshirt-purple-light">Gagnant</th>
                    <th className="px-4 py-3 text-sm font-medium text-winshirt-purple-light">Loterie</th>
                    <th className="px-4 py-3 text-sm font-medium text-winshirt-purple-light">Lot remporté</th>
                    <th className="px-4 py-3 text-sm font-medium text-winshirt-purple-light">Date du tirage</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWinners.map((winner, index) => (
                    <tr key={index} className="border-b border-winshirt-purple/10">
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.lotteryTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.lotteryValue}€</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.drawDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PreviousWinnersPage;

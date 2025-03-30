
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import LotteryCard from '@/components/LotteryCard';
import { mockLotteries } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';

const LotteriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter lotteries by status and search term
  const activeLotteries = mockLotteries
    .filter(lottery => 
      lottery.status === 'active' && 
      lottery.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const completedLotteries = mockLotteries
    .filter(lottery => 
      lottery.status === 'completed' && 
      lottery.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const relaunchedLotteries = mockLotteries
    .filter(lottery => 
      lottery.status === 'relaunched' && 
      lottery.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Nos Loteries</h1>
          <p className="text-xl text-gray-300 mb-8">
            Découvrez les lots exceptionnels que vous pouvez gagner
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mb-8">
            <Input
              type="text"
              placeholder="Rechercher une loterie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-winshirt-space-light border-winshirt-purple/30 focus:border-winshirt-purple"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Separator className="mb-8 bg-winshirt-purple/20" />
          
          {/* Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-8 bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="active" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Loteries Actives
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-winshirt-blue data-[state=active]:text-white">
                Loteries Terminées
              </TabsTrigger>
              <TabsTrigger value="relaunched" className="data-[state=active]:bg-winshirt-purple-dark data-[state=active]:text-white">
                Loteries Relancées
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activeLotteries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {activeLotteries.map((lottery) => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl text-gray-300">Aucune loterie active ne correspond à votre recherche</h3>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedLotteries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {completedLotteries.map((lottery) => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl text-gray-300">Aucune loterie terminée ne correspond à votre recherche</h3>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="relaunched">
              {relaunchedLotteries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {relaunchedLotteries.map((lottery) => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl text-gray-300">Aucune loterie relancée ne correspond à votre recherche</h3>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default LotteriesPage;

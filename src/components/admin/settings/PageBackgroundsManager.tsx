
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackgroundSelector from './BackgroundSelector';

const PageBackgroundsManager: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('home');
  
  const pages = [
    { id: 'home', title: 'Accueil' },
    { id: 'products', title: 'Produits' },
    { id: 'lotteries', title: 'Loteries' },
    { id: 'cart', title: 'Panier' },
    { id: 'checkout', title: 'Paiement' },
    { id: 'account', title: 'Compte' },
    { id: 'admin', title: 'Admin' }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Arrière-plans de pages</h2>
      <p className="text-gray-400">Personnalisez l'arrière-plan de chaque page de votre site.</p>
      
      <Tabs value={selectedPage} onValueChange={setSelectedPage} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6">
          {pages.map(page => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {pages.map(page => (
          <TabsContent key={page.id} value={page.id}>
            <BackgroundSelector pageId={page.id} pageTitle={page.title} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PageBackgroundsManager;

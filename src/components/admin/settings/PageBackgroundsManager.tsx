
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackgroundSelector from './BackgroundSelector';
import { Card } from '@/components/ui/card';
import { getBackgroundSetting } from '@/services/backgroundService';
import { Info } from 'lucide-react';

const PageBackgroundsManager: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('all');
  
  const pages = [
    { id: 'all', title: 'Toutes les pages' },
    { id: 'home', title: 'Accueil' },
    { id: 'products', title: 'Produits' },
    { id: 'lotteries', title: 'Loteries' },
    { id: 'cart', title: 'Panier' },
    { id: 'checkout', title: 'Paiement' },
    { id: 'account', title: 'Compte' },
    { id: 'admin', title: 'Admin' }
  ];
  
  // Vérifier si un arrière-plan global est défini
  const globalBackground = getBackgroundSetting('all');
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Arrière-plans de pages</h2>
      <p className="text-gray-400">Personnalisez l'arrière-plan de chaque page de votre site.</p>
      
      {globalBackground && (
        <Card className="p-4 bg-winshirt-space-light/30 border-winshirt-purple/30">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-winshirt-blue mt-1" />
            <div>
              <h3 className="font-medium text-white">Arrière-plan global actif</h3>
              <p className="text-sm text-gray-400">
                Un arrière-plan global est actuellement appliqué à toutes les pages.
                Les paramètres spécifiques à une page ne seront pas appliqués tant que
                l'arrière-plan global est actif.
              </p>
            </div>
          </div>
        </Card>
      )}
      
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
            <BackgroundSelector 
              pageId={page.id} 
              pageTitle={page.title} 
              isGlobal={page.id === 'all'} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PageBackgroundsManager;

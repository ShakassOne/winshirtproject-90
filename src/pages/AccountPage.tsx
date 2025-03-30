
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockParticipations, mockLotteries, mockProducts } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';

const AccountPage: React.FC = () => {
  // Mock user data
  const user = {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    joined: "15/08/2023",
  };
  
  // Prepare participation data with related info
  const participationsWithDetails = mockParticipations.map(participation => {
    const lottery = mockLotteries.find(l => l.id === participation.lotteryId);
    const product = mockProducts.find(p => p.id === participation.productId);
    
    return {
      ...participation,
      lottery,
      product,
    };
  });
  
  // Mock orders
  const orders = [
    {
      id: "ORD-12345",
      date: "2023-10-15",
      status: "Livrée",
      total: 29.99,
      items: 1
    },
    {
      id: "ORD-67890",
      date: "2023-11-02",
      status: "En cours",
      total: 62.98,
      items: 2
    }
  ];
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-300">Membre depuis {user.joined}</p>
            </div>
            <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
              Modifier mon profil
            </Button>
          </div>
          
          <Tabs defaultValue="participations" className="w-full">
            <TabsList className="mb-8 bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="participations" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Mes Participations
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Mes Commandes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Paramètres du compte
              </TabsTrigger>
            </TabsList>
            
            {/* Participations Tab */}
            <TabsContent value="participations">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Vos tickets de loterie</h2>
                
                {participationsWithDetails.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {participationsWithDetails.map((participation) => (
                      <Card key={participation.id} className="winshirt-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">
                            Ticket #{participation.ticketNumber}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-md overflow-hidden">
                              <img 
                                src={participation.lottery?.image} 
                                alt={participation.lottery?.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-winshirt-blue-light font-medium">
                                {participation.lottery?.title}
                              </h3>
                              <p className="text-sm text-gray-300 mb-1">
                                Produit: {participation.product?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Date de participation: {participation.date}
                              </p>
                              
                              <div className="mt-2 flex items-center">
                                <span className="text-xs bg-winshirt-space-light text-winshirt-purple-light py-1 px-2 rounded-full">
                                  {participation.lottery?.status === 'active' 
                                    ? 'En cours' 
                                    : participation.lottery?.status === 'completed' 
                                      ? 'Terminée'
                                      : 'Relancée'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="winshirt-card p-6 text-center">
                    <p className="text-gray-300 mb-4">Vous n'avez pas encore de participation à une loterie.</p>
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Découvrir nos loteries
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">Historique des commandes</h2>
                
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="winshirt-card">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-medium text-white mb-1">{order.id}</h3>
                              <p className="text-sm text-gray-300">Date: {order.date}</p>
                              <p className="text-sm text-gray-300">{order.items} article(s)</p>
                            </div>
                            
                            <div className="flex flex-col md:items-end justify-between">
                              <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm 
                                  ${order.status === 'Livrée' 
                                    ? 'bg-green-900/30 text-green-400' 
                                    : 'bg-winshirt-blue/20 text-winshirt-blue-light'
                                  }`}>
                                  {order.status}
                                </span>
                                <p className="mt-1 text-winshirt-purple-light font-medium">
                                  {order.total.toFixed(2)} €
                                </p>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                className="text-winshirt-blue-light hover:bg-winshirt-blue/10 mt-2 md:mt-0"
                              >
                                Voir les détails
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="winshirt-card p-6 text-center">
                    <p className="text-gray-300 mb-4">Vous n'avez pas encore passé de commande.</p>
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Découvrir nos T-shirts
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Nom</p>
                        <p className="text-gray-300">{user.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-gray-300">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Modifier mes informations
                    </Button>
                  </div>
                  
                  <Separator className="my-6 bg-winshirt-purple/20" />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Sécurité</h3>
                    <p className="text-gray-300">Modifiez votre mot de passe ou les paramètres de sécurité</p>
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Changer de mot de passe
                    </Button>
                  </div>
                  
                  <Separator className="my-6 bg-winshirt-purple/20" />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Préférences de notification</h3>
                    <p className="text-gray-300">Gérez vos préférences d'email et de notifications</p>
                    <Button variant="outline" className="mt-4 border-winshirt-purple text-winshirt-purple-light">
                      Gérer les notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AccountPage;

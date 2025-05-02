
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { mockProducts } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DynamicBackground from '@/components/backgrounds/DynamicBackground';

const AccountPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
        toast.error('Erreur lors de la récupération des informations utilisateur');
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };
  
  return (
    <>
      <DynamicBackground />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-white text-center">Mon Compte</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-winshirt-purple border-t-transparent"></div>
            </div>
          ) : user ? (
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="orders">Mes commandes</TabsTrigger>
                  <TabsTrigger value="participations">Mes participations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <Card className="p-6 winshirt-card">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-gray-400 text-sm">Email</h3>
                          <p className="text-white font-medium">{user.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-gray-400 text-sm">ID Utilisateur</h3>
                          <p className="text-white font-medium">{user.id.substring(0, 8)}...</p>
                        </div>
                        
                        <div>
                          <h3 className="text-gray-400 text-sm">Dernière connexion</h3>
                          <p className="text-white font-medium">{new Date(user.last_sign_in_at).toLocaleDateString()}</p>
                        </div>
                        
                        {user.user_metadata?.isAdmin && (
                          <div>
                            <h3 className="text-gray-400 text-sm">Rôle</h3>
                            <p className="text-winshirt-blue font-medium">Administrateur</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        {user.user_metadata?.isAdmin && (
                          <Link to="/admin">
                            <Button variant="outline">
                              Accéder à l'administration
                            </Button>
                          </Link>
                        )}
                        
                        <Button
                          onClick={handleSignOut}
                          variant="destructive"
                          className="ml-auto"
                        >
                          Se déconnecter
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-6">
                  <Card className="p-6 winshirt-card">
                    <h2 className="text-xl font-semibold text-white mb-4">Historique des commandes</h2>
                    
                    <div className="text-center py-8 text-gray-400">
                      <p>Vous n'avez pas encore passé de commande.</p>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="participations" className="space-y-6">
                  <Card className="p-6 winshirt-card">
                    <h2 className="text-xl font-semibold text-white mb-4">Mes participations aux loteries</h2>
                    
                    <div className="text-center py-8 text-gray-400">
                      <p>Vous n'avez pas encore participé à une loterie.</p>
                      <Link to="/lotteries" className="mt-4 inline-block">
                        <Button>
                          Voir les loteries en cours
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="p-8 max-w-md mx-auto winshirt-card text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Vous n'êtes pas connecté</h2>
              <p className="text-gray-400 mb-6">
                Connectez-vous pour accéder à votre compte, gérer vos commandes et participer à nos loteries.
              </p>
              <div className="flex justify-center">
                <Link to="/login">
                  <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </section>
    </>
  );
};

export default AccountPage;

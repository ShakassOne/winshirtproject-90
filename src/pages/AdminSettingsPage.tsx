
import React from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeIcon, Settings, Database, Image, BellDot, RefreshCw } from 'lucide-react';
import AdminHomeIntroSettings from '@/components/admin/settings/AdminHomeIntroSettings';
import DatabaseControls from '@/components/admin/settings/DatabaseControls';
import SyncSettingsManager from '@/components/admin/settings/SyncSettingsManager';

const AdminSettingsPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Paramètres</h1>
          
          <Tabs defaultValue="sync">
            <TabsList className="mb-8">
              <TabsTrigger value="sync" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Synchronisation
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Base de données
              </TabsTrigger>
              <TabsTrigger value="home-intro" className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" /> Page d'accueil
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Médias
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellDot className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Général
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sync">
              <SyncSettingsManager />
            </TabsContent>
            
            <TabsContent value="database">
              <div className="grid grid-cols-1 gap-6">
                <DatabaseControls />
              </div>
            </TabsContent>
            
            <TabsContent value="home-intro">
              <AdminHomeIntroSettings />
            </TabsContent>
            
            <TabsContent value="media">
              <div className="winshirt-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Gestion des médias</h2>
                <p className="text-gray-400">
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="winshirt-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Paramètres de notifications</h2>
                <p className="text-gray-400">
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="general">
              <div className="winshirt-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Paramètres généraux</h2>
                <p className="text-gray-400">
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AdminSettingsPage;

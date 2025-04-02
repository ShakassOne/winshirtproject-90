
import React, { useState } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import NotificationEmailsManager from '@/components/admin/settings/NotificationEmailsManager';
import ShippingSettingsManager from '@/components/admin/settings/ShippingSettingsManager';
import TestEmailButton from '@/components/admin/settings/TestEmailButton';
import HomeIntroManager from '@/components/admin/settings/HomeIntroManager';
import FtpSettingsManager from '@/components/admin/settings/FtpSettingsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, ShieldCheck, Database, Truck, Home, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettingsPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Paramètres d'administration
          </h1>
          <p className="text-gray-400 text-center mb-4">
            Configurez les paramètres de votre boutique et gérez les notifications
          </p>
          
          <div className="mb-6 text-center">
            <TestEmailButton 
              className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
            />
          </div>
          
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="mb-8 bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="home" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Home className="h-4 w-4 mr-2" />
                Page d'accueil
              </TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Upload className="h-4 w-4 mr-2" />
                Gestion uploads
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Truck className="h-4 w-4 mr-2" />
                Livraison
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Système
              </TabsTrigger>
              <TabsTrigger value="database" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                <Database className="h-4 w-4 mr-2" />
                Base de données
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="home" className="space-y-6">
              <HomeIntroManager />
            </TabsContent>
            
            <TabsContent value="uploads" className="space-y-6">
              <FtpSettingsManager />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationEmailsManager />
              
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Préférences de notification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Configuration des paramètres de notification pour différents événements.
                    Dans une version future, vous pourrez personnaliser quels types d'événements 
                    déclenchent des notifications et définir des modèles d'emails.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="space-y-6">
              <ShippingSettingsManager />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres de sécurité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Configuration des paramètres de sécurité pour l'administration.
                    Dans une version future, vous pourrez gérer les accès administrateurs,
                    configurer l'authentification à deux facteurs et définir des politiques de sécurité.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres système</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Configuration des paramètres système de la boutique.
                    Dans une version future, vous pourrez configurer les paramètres généraux
                    comme les devises, les langues et les options d'affichage.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-6">
              <Card className="winshirt-card">
                <CardHeader>
                  <CardTitle className="text-white">Gestion de base de données</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Outils de gestion de la base de données.
                    Dans une version future, vous pourrez exporter et importer des données,
                    effectuer des sauvegardes et gérer les migrations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <AdminNavigation />
    </>
  );
};

export default AdminSettingsPage;

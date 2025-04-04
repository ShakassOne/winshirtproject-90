
import React from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigationHandler from '@/components/AdminNavigationHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Tableau de bord d'administration
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Bienvenue dans l'espace d'administration
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="winshirt-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Le tableau de bord sera disponible prochainement avec des statistiques détaillées.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <AdminNavigationHandler />
    </>
  );
};

export default AdminDashboardPage;

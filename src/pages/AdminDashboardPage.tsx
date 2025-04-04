
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigationHandler from '@/components/AdminNavigationHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Ticket, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { mockProducts, mockLotteries } from '@/data/mockData';
import { mockWinners } from '@/data/mockWinners';

// Type pour les statistiques
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: number;
  interval?: string;
}

// Composant pour afficher une carte de statistique
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  change, 
  interval = "depuis le mois dernier" 
}) => {
  return (
    <Card className="winshirt-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-md font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            change >= 0 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {description && (
          <p className="text-sm text-gray-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Page principale du dashboard administrateur
const AdminDashboardPage: React.FC = () => {
  // État pour stocker les statistiques
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeLotteries: 0,
    totalClients: 0,
    totalOrders: 0,
    totalTickets: 0,
    revenue: 0
  });
  
  // Charger les statistiques depuis les données mock
  useEffect(() => {
    // Statistiques de base (normalement chargées depuis l'API)
    const activeLotteries = mockLotteries.filter(lottery => lottery.status === 'active').length;
    const totalProducts = mockProducts.length;
    
    // Autres valeurs simulées pour la démo
    const totalClients = 124;
    const totalOrders = 67;
    const totalTickets = 842;
    const revenue = 12850;
    
    setStats({
      totalProducts,
      activeLotteries,
      totalClients,
      totalOrders,
      totalTickets,
      revenue
    });
  }, []);
  
  // Récupérer la date actuelle
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('fr-FR', { 
    dateStyle: 'full'
  }).format(currentDate);
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
                Tableau de bord d'administration
              </h1>
              <p className="text-gray-400">
                {formattedDate}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <select className="bg-winshirt-space-light border border-winshirt-purple/20 rounded px-3 py-2 text-sm text-gray-300">
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month" selected>Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
          
          {/* Grille de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Ventes" 
              value={`${stats.revenue.toLocaleString('fr-FR')} €`}
              icon={<TrendingUp className="h-5 w-5" />}
              change={12}
            />
            
            <StatCard 
              title="Commandes" 
              value={stats.totalOrders}
              icon={<ShoppingBag className="h-5 w-5" />}
              change={-3}
            />
            
            <StatCard 
              title="Clients" 
              value={stats.totalClients}
              icon={<Users className="h-5 w-5" />}
              change={8}
            />
            
            <StatCard 
              title="Produits" 
              value={stats.totalProducts}
              icon={<LayoutDashboard className="h-5 w-5" />}
              description="Produits en catalogue"
            />
            
            <StatCard 
              title="Loteries actives" 
              value={stats.activeLotteries}
              icon={<Ticket className="h-5 w-5" />}
              description="Loteries en cours"
            />
            
            <StatCard 
              title="Tickets vendus" 
              value={stats.totalTickets}
              icon={<Calendar className="h-5 w-5" />}
              change={15}
            />
          </div>
          
          {/* Derniers gagnants */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Derniers gagnants</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-winshirt-space-light border border-winshirt-purple/20 rounded-lg">
                <thead>
                  <tr className="border-b border-winshirt-purple/20">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Loterie</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Produit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWinners.slice(0, 5).map((winner, index) => (
                    <tr key={index} className="border-b border-winshirt-purple/10">
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.lotteryTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.lotteryTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{winner.drawDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Cartes d'informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="winshirt-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Dernières commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Les informations des dernières commandes seront disponibles prochainement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="winshirt-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Loteries populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Les statistiques des loteries les plus populaires seront disponibles prochainement.
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

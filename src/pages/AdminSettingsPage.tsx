
import React from 'react';
import StarBackground from '@/components/StarBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Database, Trash, FileJson, Download, Upload } from 'lucide-react';
import { toast } from '@/lib/toast';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminSettingsPage: React.FC = () => {
  const exportData = () => {
    try {
      const data = {
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        lotteries: JSON.parse(localStorage.getItem('lotteries') || '[]'),
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        orders: JSON.parse(localStorage.getItem('orders') || '[]')
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `winshirt-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Données exportées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation des données");
    }
  };
  
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
          if (data.lotteries) localStorage.setItem('lotteries', JSON.stringify(data.lotteries));
          if (data.clients) localStorage.setItem('clients', JSON.stringify(data.clients));
          if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
          
          toast.success("Données importées avec succès");
          
          // Reload page to refresh data
          window.location.reload();
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          toast.error("Fichier invalide ou corrompu");
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  const clearAllData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.")) {
      localStorage.removeItem('products');
      localStorage.removeItem('lotteries');
      localStorage.removeItem('clients');
      localStorage.removeItem('orders');
      toast.success("Toutes les données ont été supprimées");
      
      // Reload page to refresh data
      window.location.reload();
    }
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Paramètres d'Administration
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Gérez les paramètres et les données de l'application
          </p>
          
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="database" className="w-full">
              <TabsList className="mb-6 w-full bg-winshirt-space-light">
                <TabsTrigger value="database" className="flex-1">Données</TabsTrigger>
                <TabsTrigger value="system" className="flex-1">Système</TabsTrigger>
                <TabsTrigger value="backup" className="flex-1">Sauvegarde</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database">
                <Card className="winshirt-card p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Gestion des données</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-winshirt-space-light rounded-lg">
                        <div className="flex items-center mb-2">
                          <Database className="mr-2 text-winshirt-purple" size={20} />
                          <h3 className="text-lg font-medium text-white">Produits</h3>
                        </div>
                        <p className="text-gray-400 mb-2">
                          {localStorage.getItem('products') 
                            ? JSON.parse(localStorage.getItem('products') || '[]').length + " produits enregistrés" 
                            : "Aucun produit"}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-winshirt-space-light rounded-lg">
                        <div className="flex items-center mb-2">
                          <Database className="mr-2 text-winshirt-blue" size={20} />
                          <h3 className="text-lg font-medium text-white">Loteries</h3>
                        </div>
                        <p className="text-gray-400 mb-2">
                          {localStorage.getItem('lotteries') 
                            ? JSON.parse(localStorage.getItem('lotteries') || '[]').length + " loteries enregistrées" 
                            : "Aucune loterie"}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-winshirt-space-light rounded-lg">
                        <div className="flex items-center mb-2">
                          <Database className="mr-2 text-green-500" size={20} />
                          <h3 className="text-lg font-medium text-white">Clients</h3>
                        </div>
                        <p className="text-gray-400 mb-2">
                          {localStorage.getItem('clients') 
                            ? JSON.parse(localStorage.getItem('clients') || '[]').length + " clients enregistrés" 
                            : "Aucun client"}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-winshirt-space-light rounded-lg">
                        <div className="flex items-center mb-2">
                          <Database className="mr-2 text-orange-500" size={20} />
                          <h3 className="text-lg font-medium text-white">Commandes</h3>
                        </div>
                        <p className="text-gray-400 mb-2">
                          {localStorage.getItem('orders') 
                            ? JSON.parse(localStorage.getItem('orders') || '[]').length + " commandes enregistrées" 
                            : "Aucune commande"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        variant="destructive" 
                        className="mr-2"
                        onClick={clearAllData}
                      >
                        <Trash size={16} className="mr-2" />
                        Effacer toutes les données
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="system">
                <Card className="winshirt-card p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Paramètres système</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-winshirt-space-light rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Stockage local</h3>
                      <p className="text-gray-400 mb-4">
                        L'application utilise le stockage local de votre navigateur pour sauvegarder les données.
                        Assurez-vous de ne pas vider le cache de votre navigateur si vous souhaitez conserver vos données.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-winshirt-space-light rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Version de l'application</h3>
                      <p className="text-gray-400">Version: 1.0.0</p>
                      <p className="text-gray-400">Date de déploiement: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="backup">
                <Card className="winshirt-card p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Sauvegarde et restauration</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-winshirt-space-light rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileJson className="mr-2 text-winshirt-purple" size={20} />
                        <h3 className="text-lg font-medium text-white">Exporter les données</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Exportez toutes les données de l'application dans un fichier JSON pour les sauvegarder.
                      </p>
                      <Button onClick={exportData}>
                        <Download size={16} className="mr-2" />
                        Exporter les données
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-winshirt-space-light rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileJson className="mr-2 text-winshirt-blue" size={20} />
                        <h3 className="text-lg font-medium text-white">Importer des données</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Importez des données à partir d'un fichier JSON exporté précédemment.
                        <b className="block mt-2 text-yellow-400">Attention: Cette action remplacera toutes les données existantes.</b>
                      </p>
                      <Button variant="outline" onClick={importData}>
                        <Upload size={16} className="mr-2" />
                        Importer des données
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      <AdminNavigation />
    </>
  );
};

export default AdminSettingsPage;

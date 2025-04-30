
import React, { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StarBackground from '@/components/StarBackground';
import { Order } from '@/types/order';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, Package } from 'lucide-react';
import { toast } from '@/lib/toast';
import OrderDetails from '@/components/admin/orders/OrderDetails';
import { pushDataToSupabase, pullDataFromSupabase } from '@/lib/syncManager';
import { Client } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les commandes depuis localStorage et créer les clients si nécessaire
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersStr = localStorage.getItem('orders');
        let parsedOrders: Order[] = [];
        
        if (ordersStr) {
          parsedOrders = JSON.parse(ordersStr);
          setOrders(parsedOrders);
          
          // Traiter les clients à partir des commandes
          await processClientsFromOrders(parsedOrders);
        } else {
          // Si aucune commande n'existe, créer un tableau vide
          localStorage.setItem('orders', JSON.stringify([]));
          setOrders([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        toast.error("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    
    // Écouter les mises à jour du stockage
    const handleStorageUpdate = () => loadOrders();
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, []);

  // Fonction pour traiter les clients à partir des commandes
  const processClientsFromOrders = async (orders: Order[]) => {
    try {
      // Récupérer les clients existants
      const clientsStr = localStorage.getItem('clients');
      let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      
      // Ensemble pour suivre les emails déjà traités
      const processedEmails = new Set(clients.map(client => client.email));
      let clientsChanged = false;
      
      // Pour chaque commande, créer un client s'il n'existe pas déjà
      for (const order of orders) {
        if (order.clientEmail && !processedEmails.has(order.clientEmail)) {
          // Ajouter un nouveau client
          const newClient: Client = {
            id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
            name: order.clientName || 'Client',
            email: order.clientEmail,
            phone: '',
            address: order.shipping?.address || '',
            city: order.shipping?.city || '',
            postalCode: order.shipping?.postalCode || '',
            country: order.shipping?.country || '',
            registrationDate: new Date().toISOString(),
            orderCount: 1,
            totalSpent: order.total || 0
          };
          
          clients.push(newClient);
          processedEmails.add(order.clientEmail);
          clientsChanged = true;
          
          console.log(`Nouveau client créé: ${newClient.name} (${newClient.email})`);
        } else if (order.clientEmail) {
          // Mettre à jour les statistiques du client existant
          const existingClient = clients.find(client => client.email === order.clientEmail);
          if (existingClient) {
            existingClient.orderCount = (existingClient.orderCount || 0) + 1;
            existingClient.totalSpent = (existingClient.totalSpent || 0) + (order.total || 0);
            clientsChanged = true;
          }
        }
      }
      
      // Si des clients ont été ajoutés ou modifiés, mettre à jour localStorage
      if (clientsChanged) {
        localStorage.setItem('clients', JSON.stringify(clients));
        console.log(`${clients.length} clients sauvegardés dans localStorage`);
        
        // Synchroniser avec Supabase si possible
        try {
          await pushDataToSupabase('clients');
          console.log('Clients synchronisés avec Supabase');
        } catch (error) {
          console.error('Erreur lors de la synchronisation des clients avec Supabase:', error);
        }
        
        // Déclencher un événement pour informer les autres composants
        const event = new Event('storageUpdate');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Erreur lors du traitement des clients:", error);
    }
  };

  const syncOrders = async () => {
    setLoading(true);
    try {
      // Synchroniser les commandes avec Supabase
      const result = await pushDataToSupabase('orders');
      if (result.success) {
        toast.success(`${result.localCount} commandes synchronisées avec Supabase`);
      } else {
        toast.error(`Erreur lors de la synchronisation: ${result.error || 'Erreur inconnue'}`);
      }
      
      // Synchroniser les éléments de commande
      const itemsResult = await pushDataToSupabase('order_items');
      if (itemsResult.success) {
        toast.success(`${itemsResult.localCount} articles de commande synchronisés`);
      }
      
      // Synchroniser les clients
      const clientsResult = await pushDataToSupabase('clients');
      if (clientsResult.success) {
        toast.success(`${clientsResult.localCount} clients synchronisés`);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error("Erreur lors de la synchronisation des commandes");
    } finally {
      setLoading(false);
    }
  };

  const pullOrders = async () => {
    setLoading(true);
    try {
      // Récupérer les commandes depuis Supabase
      const result = await pullDataFromSupabase('orders');
      if (result.success) {
        toast.success(`${result.remoteCount} commandes récupérées depuis Supabase`);
        
        // Récupérer également les éléments de commande
        await pullDataFromSupabase('order_items');
        
        // Récupérer également les clients
        await pullDataFromSupabase('clients');
        
        // Mettre à jour les commandes affichées
        const ordersStr = localStorage.getItem('orders');
        if (ordersStr) {
          const parsedOrders = JSON.parse(ordersStr);
          setOrders(parsedOrders);
        }
      } else {
        toast.error(`Erreur lors de la récupération: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération:", error);
      toast.error("Erreur lors de la récupération des commandes");
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="winshirt-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
                Gestion des Commandes
              </h1>
              
              <div className="space-x-2 flex">
                <Button 
                  variant="outline" 
                  className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
                  onClick={pullOrders}
                  disabled={loading}
                >
                  <Package className="mr-2 h-4 w-4" /> Récupérer
                </Button>
                <Button 
                  className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  onClick={syncOrders}
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4" /> Synchroniser
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-winshirt-purple"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Liste des commandes</TableCaption>
                  <TableHeader>
                    <TableRow className="bg-winshirt-space-light">
                      <TableHead className="text-white">ID</TableHead>
                      <TableHead className="text-white">Client</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Statut</TableHead>
                      <TableHead className="text-white">Articles</TableHead>
                      <TableHead className="text-white">Total</TableHead>
                      <TableHead className="text-white">Livraison</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-b border-winshirt-space-light/30 hover:bg-winshirt-space-light/20">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell>{order.total.toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge className="bg-winshirt-blue">
                            {order.delivery?.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => viewOrderDetails(order)}
                            className="hover:bg-winshirt-purple/20"
                          >
                            <Eye size={16} className="mr-1" /> Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  Aucune commande trouvée. Les commandes passées par les clients apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Popup glassmorphism pour les détails de commande */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl bg-winshirt-space/30 backdrop-blur-md border border-winshirt-purple/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-winshirt-purple">Détails de la commande</DialogTitle>
            <DialogDescription>
              Commande #{selectedOrder?.id} - {selectedOrder?.clientName}
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminOrdersPage;

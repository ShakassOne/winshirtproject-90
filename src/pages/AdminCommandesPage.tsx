
import React, { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StarBackground from '@/components/StarBackground';
import { Order } from '@/types/order';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, Package } from 'lucide-react';
import { toast } from '@/lib/toast';
import OrderDetails from '@/components/admin/orders/OrderDetails';
import { pushDataToSupabase, pullDataFromSupabase } from '@/lib/syncManager';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les commandes depuis localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        const ordersStr = localStorage.getItem('orders');
        if (ordersStr) {
          const parsedOrders = JSON.parse(ordersStr);
          setOrders(parsedOrders);
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
      
      {/* Modal de détails de commande */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto bg-winshirt-space border-l border-winshirt-purple/30">
          <SheetHeader>
            <SheetTitle className="text-winshirt-purple">Détails de la commande</SheetTitle>
            <SheetDescription>
              Commande #{selectedOrder?.id} - {selectedOrder?.clientName}
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminOrdersPage;

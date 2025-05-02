import React, { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import StarBackground from '@/components/StarBackground';
import { Order } from '@/types/order';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, Package, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import OrderDetails from '@/components/admin/orders/OrderDetails';
import { pushDataToSupabase, pullDataFromSupabase } from '@/lib/syncManager';
import { Client } from '@/types/client';
import { EmailService } from '@/lib/emailService';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-render

  // Load orders from localStorage and create clients if needed
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersStr = localStorage.getItem('orders');
        let parsedOrders: Order[] = [];
        
        if (ordersStr) {
          parsedOrders = JSON.parse(ordersStr);
          setOrders(parsedOrders);
          
          // Process clients from orders
          await processClientsFromOrders(parsedOrders);
        } else {
          // If no orders exist, create an empty array
          localStorage.setItem('orders', JSON.stringify([]));
          setOrders([]);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Error loading orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    
    // Listen for storage updates
    const handleStorageUpdate = () => {
      loadOrders();
      // Force re-render
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, [refreshKey]); // Add refreshKey to the dependency array

  // Function to manually refresh orders
  const refreshOrders = () => {
    setRefreshKey(prev => prev + 1);
    toast.info("Rafraîchissement des commandes en cours...");
  };

  // Process clients from orders
  const processClientsFromOrders = async (orders: Order[]) => {
    try {
      // Get existing clients
      const clientsStr = localStorage.getItem('clients');
      let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      
      // Set to track processed emails
      const processedEmails = new Set(clients.map(client => client.email));
      let clientsChanged = false;
      
      // For each order, create a client if it doesn't exist
      for (const order of orders) {
        if (order.clientEmail && !processedEmails.has(order.clientEmail)) {
          // Add new client
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
          
          console.log(`New client created: ${newClient.name} (${newClient.email})`);
          
          // Create an auth account with this email so the user can log in
          try {
            // Store the user keyed by email for login purposes
            const newUser = {
              id: Math.floor(Math.random() * 1000) + 2,
              name: newClient.name,
              email: newClient.email,
              role: 'user',
              registrationDate: new Date().toISOString(),
              clientId: newClient.id
            };
            localStorage.setItem(`user_${newClient.email}`, JSON.stringify(newUser));
            console.log(`User account created for client: ${newClient.name} (${newClient.email})`);
            
            // Send welcome email
            try {
              await EmailService.sendAccountCreationEmail(newClient.email, newClient.name);
              console.log(`Welcome email sent to ${newClient.email}`);
            } catch (error) {
              console.error("Error sending welcome email:", error);
            }
          } catch (error) {
            console.error("Error creating user account:", error);
          }
        } else if (order.clientEmail) {
          // Update existing client stats
          const existingClient = clients.find(client => client.email === order.clientEmail);
          if (existingClient) {
            existingClient.orderCount = (existingClient.orderCount || 0) + 1;
            existingClient.totalSpent = (existingClient.totalSpent || 0) + (order.total || 0);
            clientsChanged = true;
          }
        }
      }
      
      // If clients have been added or modified, update localStorage
      if (clientsChanged) {
        localStorage.setItem('clients', JSON.stringify(clients));
        console.log(`${clients.length} clients saved to localStorage`);
        
        // Try to sync with Supabase
        try {
          // Map client data to match the Supabase schema
          const supabaseClients = clients.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            address: {
              address: client.address,
              city: client.city,
              postal_code: client.postalCode,
              country: client.country
            },
            created_at: client.registrationDate,
            updated_at: new Date().toISOString(),
            user_id: null, // We don't have auth user IDs yet
          }));
          
          // Save to localStorage with the correct structure before syncing
          localStorage.setItem('clients', JSON.stringify(supabaseClients));
          
          // Sync to Supabase
          await pushDataToSupabase('clients');
          console.log('Clients synchronized with Supabase');
        } catch (error) {
          console.error('Error syncing clients with Supabase:', error);
        }
        
        // Trigger event to inform other components
        const event = new Event('storageUpdate');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error processing clients:", error);
    }
  };

  const syncOrders = async () => {
    setLoading(true);
    try {
      // Sync orders with Supabase
      const result = await pushDataToSupabase('orders');
      if (result.success) {
        toast.success(`${result.localCount} orders synchronized with Supabase`);
      } else {
        // Use either error or message property, whichever is available
        const errorMessage = result.error || result.message || 'Unknown error';
        toast.error(`Sync error: ${errorMessage}`);
      }
      
      // Sync order items
      const itemsResult = await pushDataToSupabase('order_items');
      if (itemsResult.success) {
        toast.success(`${itemsResult.localCount} order items synchronized`);
      }
      
      // Sync clients
      const clientsResult = await pushDataToSupabase('clients');
      if (clientsResult.success) {
        toast.success(`${clientsResult.localCount} clients synchronized`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Error syncing orders");
    } finally {
      setLoading(false);
    }
  };

  const pullOrders = async () => {
    setLoading(true);
    try {
      // Get orders from Supabase
      const result = await pullDataFromSupabase('orders');
      if (result.success) {
        toast.success(`${result.remoteCount} orders retrieved from Supabase`);
        
        // Also get order items
        await pullDataFromSupabase('order_items');
        
        // Also get clients
        await pullDataFromSupabase('clients');
        
        // Update displayed orders
        const ordersStr = localStorage.getItem('orders');
        if (ordersStr) {
          const parsedOrders = JSON.parse(ordersStr);
          setOrders(parsedOrders);
        }
      } else {
        toast.error(`Retrieval error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Retrieval error:", error);
      toast.error("Error retrieving orders");
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
                  onClick={refreshOrders}
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
                </Button>
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
      
      {/* Glassmorphism dialog for order details */}
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

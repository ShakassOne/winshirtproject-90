
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { Order, OrderStatus, DeliveryStatus, DeliveryHistoryEntry } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter,
  Eye,
  FileText,
  Truck,
  ShoppingBag,
  Calendar,
  ArrowUpDown,
  CreditCard,
  PackageCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNavigation from '@/components/admin/AdminNavigation';
import OrderDetails from '@/components/admin/orders/OrderDetails';
import { toast } from '@/lib/toast';

// Exemple de commandes pour démo
const mockOrders: Order[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "Jean Dupont",
    clientEmail: "jean.dupont@example.com",
    orderDate: "2023-09-15T10:30:00.000Z",
    status: "shipped",
    items: [
      {
        id: 1,
        productId: 1,
        productName: "T-shirt Cosmique",
        productImage: "https://placehold.co/400x300",
        quantity: 2,
        price: 29.99,
        size: "M",
        color: "Bleu",
        lotteriesEntries: [1]
      },
      {
        id: 2,
        productId: 3,
        productName: "Hoodie Étoile",
        productImage: "https://placehold.co/400x300",
        quantity: 1,
        price: 49.99,
        size: "L",
        color: "Noir",
        lotteriesEntries: [1, 3]
      }
    ],
    shipping: {
      address: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      method: "Standard",
      cost: 5.99
    },
    delivery: {
      status: "in_transit",
      carrier: "Chronopost",
      trackingNumber: "CP123456789FR",
      trackingUrl: "https://www.chronopost.fr/tracking",
      estimatedDeliveryDate: "2023-09-20T18:00:00.000Z",
      signatureRequired: true,
      lastUpdate: "2023-09-17T14:30:00.000Z",
      history: [
        {
          date: "2023-09-16T10:45:00.000Z",
          status: "preparing",
          location: "Entrepôt Paris Nord",
          description: "Commande en cours de préparation"
        },
        {
          date: "2023-09-17T09:30:00.000Z",
          status: "ready_to_ship",
          location: "Entrepôt Paris Nord",
          description: "Commande prête à être expédiée"
        },
        {
          date: "2023-09-17T14:30:00.000Z",
          status: "in_transit",
          location: "Centre de tri Roissy",
          description: "Colis en transit vers le centre de distribution"
        }
      ]
    },
    payment: {
      method: "Carte bancaire",
      transactionId: "TR123456789",
      status: "completed"
    },
    subtotal: 109.97,
    total: 115.96,
    trackingNumber: "FR123456789",
    notes: "Livraison en bas de l'immeuble"
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Marie Martin",
    clientEmail: "marie.martin@example.com",
    orderDate: "2023-09-18T14:45:00.000Z",
    status: "delivered",
    items: [
      {
        id: 3,
        productId: 2,
        productName: "Sweatshirt Galaxy",
        productImage: "https://placehold.co/400x300",
        quantity: 1,
        price: 39.99,
        size: "S",
        color: "Violet",
        lotteriesEntries: [2]
      }
    ],
    shipping: {
      address: "45 Avenue des Champs",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      method: "Express",
      cost: 9.99
    },
    delivery: {
      status: "delivered",
      carrier: "DHL",
      trackingNumber: "DHL987654321",
      trackingUrl: "https://www.dhl.fr/tracking",
      estimatedDeliveryDate: "2023-09-20T18:00:00.000Z",
      actualDeliveryDate: "2023-09-20T14:25:00.000Z",
      signatureRequired: true,
      lastUpdate: "2023-09-20T14:25:00.000Z",
      history: [
        {
          date: "2023-09-18T16:30:00.000Z",
          status: "preparing",
          location: "Entrepôt Lyon",
          description: "Commande en cours de préparation"
        },
        {
          date: "2023-09-19T08:45:00.000Z",
          status: "ready_to_ship",
          location: "Entrepôt Lyon",
          description: "Commande prête à être expédiée"
        },
        {
          date: "2023-09-19T12:30:00.000Z",
          status: "in_transit",
          location: "Centre de tri Lyon",
          description: "Colis en transit"
        },
        {
          date: "2023-09-20T08:15:00.000Z",
          status: "out_for_delivery",
          location: "Lyon",
          description: "Colis en cours de livraison"
        },
        {
          date: "2023-09-20T14:25:00.000Z",
          status: "delivered",
          location: "Lyon",
          description: "Colis livré et signé par le destinataire"
        }
      ]
    },
    payment: {
      method: "PayPal",
      transactionId: "PP987654321",
      status: "completed"
    },
    subtotal: 39.99,
    total: 49.98,
    trackingNumber: "FR987654321"
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Pierre Dubois",
    clientEmail: "pierre.dubois@example.com",
    orderDate: "2023-09-20T09:15:00.000Z",
    status: "processing",
    items: [
      {
        id: 4,
        productId: 4,
        productName: "Débardeur Spatial",
        productImage: "https://placehold.co/400x300",
        quantity: 3,
        price: 19.99,
        size: "M",
        color: "Blanc",
        lotteriesEntries: [3]
      }
    ],
    shipping: {
      address: "87 Boulevard Saint-Michel",
      city: "Marseille",
      postalCode: "13000",
      country: "France",
      method: "Standard",
      cost: 5.99
    },
    delivery: {
      status: "preparing",
      estimatedDeliveryDate: "2023-09-25T18:00:00.000Z",
      lastUpdate: "2023-09-20T10:30:00.000Z",
      history: [
        {
          date: "2023-09-20T10:30:00.000Z",
          status: "preparing",
          location: "Entrepôt Marseille",
          description: "Commande reçue et en cours de préparation"
        }
      ]
    },
    payment: {
      method: "Carte bancaire",
      transactionId: "TR567891234",
      status: "completed"
    },
    subtotal: 59.97,
    total: 65.96
  },
  {
    id: 4,
    clientId: 4,
    clientName: "Sophie Lefebvre",
    clientEmail: "sophie.lefebvre@example.com",
    orderDate: "2023-09-22T16:20:00.000Z",
    status: "pending",
    items: [
      {
        id: 5,
        productId: 5,
        productName: "Casquette Astrale",
        productImage: "https://placehold.co/400x300",
        quantity: 1,
        price: 24.99,
        color: "Noir",
        lotteriesEntries: [4]
      },
      {
        id: 6,
        productId: 1,
        productName: "T-shirt Cosmique",
        productImage: "https://placehold.co/400x300",
        quantity: 2,
        price: 29.99,
        size: "L",
        color: "Rouge",
        lotteriesEntries: [1]
      }
    ],
    shipping: {
      address: "32 Rue de la République",
      city: "Bordeaux",
      postalCode: "33000",
      country: "France",
      method: "Express",
      cost: 9.99
    },
    delivery: {
      status: "preparing",
      lastUpdate: "2023-09-22T16:20:00.000Z"
    },
    payment: {
      method: "Virement bancaire",
      status: "pending"
    },
    subtotal: 84.97,
    total: 94.96
  }
];

const AdminCommandesPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Charger les commandes depuis localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          // S'assurer que chaque commande a une propriété delivery
          const ordersWithDelivery = parsedOrders.map(order => ({
            ...order,
            delivery: order.delivery || {
              status: 'preparing',
              lastUpdate: order.orderDate,
              history: []
            }
          }));
          setOrders(ordersWithDelivery);
          setFilteredOrders(ordersWithDelivery);
        } else {
          // Si pas de commandes en localStorage, utiliser les mockOrders
          setOrders(mockOrders);
          setFilteredOrders(mockOrders);
          localStorage.setItem('orders', JSON.stringify(mockOrders));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        // Utiliser les mockOrders en cas d'erreur
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        localStorage.setItem('orders', JSON.stringify(mockOrders));
      }
    } else {
      // Si pas de commandes en localStorage, utiliser les mockOrders
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      localStorage.setItem('orders', JSON.stringify(mockOrders));
    }
  }, []);
  
  // Filtrer et trier les commandes
  useEffect(() => {
    let result = [...orders];
    
    // Filtre par status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filtre par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        order => order.clientName.toLowerCase().includes(term) || 
                order.clientEmail.toLowerCase().includes(term) || 
                order.id.toString().includes(term) ||
                (order.delivery?.trackingNumber && order.delivery.trackingNumber.toLowerCase().includes(term))
      );
    }
    
    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'client') {
        comparison = a.clientName.localeCompare(b.clientName);
      } else if (sortBy === 'delivery') {
        const aStatus = a.delivery?.status || 'preparing';
        const bStatus = b.delivery?.status || 'preparing';
        comparison = aStatus.localeCompare(bStatus);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);
  
  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        // Mise à jour automatique du statut de livraison en fonction du statut de commande
        let deliveryStatus: DeliveryStatus = order.delivery?.status || 'preparing';
        
        if (newStatus === 'processing') {
          deliveryStatus = 'preparing';
        } else if (newStatus === 'shipped') {
          deliveryStatus = 'in_transit';
        } else if (newStatus === 'delivered') {
          deliveryStatus = 'delivered';
        }
        
        return { 
          ...order, 
          status: newStatus,
          delivery: {
            ...order.delivery,
            status: deliveryStatus,
            lastUpdate: new Date().toISOString(),
            history: [
              ...(order.delivery?.history || []),
              {
                date: new Date().toISOString(),
                status: deliveryStatus,
                description: `Statut de la commande mis à jour: ${getStatusLabel(newStatus)}`
              }
            ]
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Si la commande est actuellement sélectionnée, mettre à jour également
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = updatedOrders.find(order => order.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  };
  
  const updateDeliveryInfo = (orderId: number, deliveryData: Partial<Order['delivery']>) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        // Mettre à jour le statut de la commande en fonction du statut de livraison
        let orderStatus: OrderStatus = order.status;
        
        if (deliveryData.status === 'ready_to_ship' && order.status === 'pending') {
          orderStatus = 'processing';
        } else if (deliveryData.status === 'in_transit' && order.status !== 'shipped') {
          orderStatus = 'shipped';
        } else if (deliveryData.status === 'delivered' && order.status !== 'delivered') {
          orderStatus = 'delivered';
        }
        
        return { 
          ...order,
          status: orderStatus,
          delivery: {
            ...order.delivery,
            ...deliveryData
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Si la commande est actuellement sélectionnée, mettre à jour également
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = updatedOrders.find(order => order.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
    
    toast.success("Informations de livraison mises à jour");
  };
  
  const addDeliveryHistoryEntry = (orderId: number, entry: DeliveryHistoryEntry) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { 
          ...order,
          delivery: {
            ...order.delivery,
            history: [
              ...(order.delivery?.history || []),
              entry
            ],
            lastUpdate: entry.date
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Si la commande est actuellement sélectionnée, mettre à jour également
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = updatedOrders.find(order => order.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
    
    toast.success("Point d'historique de livraison ajouté");
  };
  
  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    
    return statusMap[status] || status;
  };
  
  const getDeliveryStatusLabel = (status: DeliveryStatus): string => {
    const statusMap: Record<DeliveryStatus, string> = {
      preparing: 'En préparation',
      ready_to_ship: 'Prêt à expédier',
      in_transit: 'En transit',
      out_for_delivery: 'En cours de livraison',
      delivered: 'Livré',
      failed: 'Échec de livraison',
      returned: 'Retourné'
    };
    
    return statusMap[status] || status;
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    let color;
    let label;
    
    switch (status) {
      case 'pending':
        color = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        label = "En attente";
        break;
      case 'processing':
        color = "bg-blue-500/20 text-blue-500 border-blue-500/30";
        label = "En traitement";
        break;
      case 'shipped':
        color = "bg-purple-500/20 text-purple-500 border-purple-500/30";
        label = "Expédiée";
        break;
      case 'delivered':
        color = "bg-green-500/20 text-green-500 border-green-500/30";
        label = "Livrée";
        break;
      case 'cancelled':
        color = "bg-red-500/20 text-red-500 border-red-500/30";
        label = "Annulée";
        break;
      case 'refunded':
        color = "bg-orange-500/20 text-orange-500 border-orange-500/30";
        label = "Remboursée";
        break;
      default:
        color = "bg-gray-500/20 text-gray-500 border-gray-500/30";
        label = status;
    }
    
    return <Badge className={`${color} border`}>{label}</Badge>;
  };
  
  const getDeliveryStatusBadge = (status: DeliveryStatus) => {
    let color;
    let label = getDeliveryStatusLabel(status);
    
    switch (status) {
      case 'preparing':
        color = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        break;
      case 'ready_to_ship':
        color = "bg-blue-500/20 text-blue-500 border-blue-500/30";
        break;
      case 'in_transit':
        color = "bg-purple-500/20 text-purple-500 border-purple-500/30";
        break;
      case 'out_for_delivery':
        color = "bg-indigo-500/20 text-indigo-500 border-indigo-500/30";
        break;
      case 'delivered':
        color = "bg-green-500/20 text-green-500 border-green-500/30";
        break;
      case 'failed':
        color = "bg-red-500/20 text-red-500 border-red-500/30";
        break;
      case 'returned':
        color = "bg-orange-500/20 text-orange-500 border-orange-500/30";
        break;
      default:
        color = "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
    
    return <Badge className={`${color} border`}>{label}</Badge>;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion des Commandes
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Suivez, gérez et mettez à jour les commandes de vos clients
          </p>
          
          {selectedOrder ? (
            <OrderDetails 
              order={selectedOrder} 
              onBack={() => setSelectedOrder(null)} 
              onStatusChange={updateOrderStatus}
              onUpdateDelivery={updateDeliveryInfo}
              onAddDeliveryHistoryEntry={addDeliveryHistoryEntry}
            />
          ) : (
            <div className="space-y-6">
              {/* Filtres et recherche */}
              <div className="winshirt-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher une commande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-winshirt-space-light border-winshirt-purple/30">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En traitement</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                      <SelectItem value="refunded">Remboursée</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="border-winshirt-purple/30 text-white">
                    <Filter size={16} className="mr-2" />
                    Plus de filtres
                  </Button>
                </div>
              </div>
              
              {/* Liste des commandes */}
              <div className="winshirt-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-winshirt-space-light">
                      <TableRow>
                        <TableHead className="text-white">
                          <button 
                            className="flex items-center gap-1"
                            onClick={() => handleSortToggle('date')}
                          >
                            <Calendar size={14} />
                            <span>Date</span>
                            {sortBy === 'date' && <ArrowUpDown size={14} />}
                          </button>
                        </TableHead>
                        <TableHead className="text-white">
                          <button 
                            className="flex items-center gap-1"
                            onClick={() => handleSortToggle('client')}
                          >
                            <span>Client</span>
                            {sortBy === 'client' && <ArrowUpDown size={14} />}
                          </button>
                        </TableHead>
                        <TableHead className="text-white">
                          <div className="flex items-center gap-1">
                            <ShoppingBag size={14} />
                            <span>Articles</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white">
                          <button 
                            className="flex items-center gap-1"
                            onClick={() => handleSortToggle('delivery')}
                          >
                            <Truck size={14} />
                            <span>Livraison</span>
                            {sortBy === 'delivery' && <ArrowUpDown size={14} />}
                          </button>
                        </TableHead>
                        <TableHead className="text-white">
                          <button 
                            className="flex items-center gap-1"
                            onClick={() => handleSortToggle('status')}
                          >
                            <PackageCheck size={14} />
                            <span>Statut</span>
                            {sortBy === 'status' && <ArrowUpDown size={14} />}
                          </button>
                        </TableHead>
                        <TableHead className="text-white">
                          <button 
                            className="flex items-center gap-1"
                            onClick={() => handleSortToggle('total')}
                          >
                            <CreditCard size={14} />
                            <span>Total</span>
                            {sortBy === 'total' && <ArrowUpDown size={14} />}
                          </button>
                        </TableHead>
                        <TableHead className="text-white text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id} className="border-b border-winshirt-purple/10">
                          <TableCell className="whitespace-nowrap text-gray-300">
                            <div className="font-medium text-winshirt-purple-light">#{order.id}</div>
                            <div className="text-sm">{formatDate(order.orderDate)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-white">{order.clientName}</div>
                            <div className="text-gray-400 text-sm">{order.clientEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-winshirt-blue-light">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.items.map(item => item.productName).join(', ').slice(0, 25)}
                              {order.items.map(item => item.productName).join(', ').length > 25 ? '...' : ''}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex flex-col gap-1">
                              <div>
                                {order.shipping.city}, {order.shipping.country}
                              </div>
                              <div className="text-xs text-gray-400">{order.shipping.method}</div>
                              {order.delivery?.trackingNumber && (
                                <div className="text-xs text-winshirt-blue-light">
                                  {order.delivery.trackingNumber}
                                </div>
                              )}
                              {order.delivery && (
                                <div className="mt-1">
                                  {getDeliveryStatusBadge(order.delivery.status)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-white">
                            {order.total.toFixed(2)} €
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-winshirt-blue hover:text-winshirt-blue-light h-8 w-8 p-0"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                                <FileText size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                            Aucune commande trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <AdminNavigation />
    </>
  );
};

export default AdminCommandesPage;


import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShoppingBag, Eye, Trash, Check, X, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Commande {
  id: number;
  clientName: string;
  clientEmail: string;
  date: string;
  montant: number;
  status: 'pending' | 'completed' | 'cancelled';
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Données de commandes fictives
const mockCommandes: Commande[] = [
  {
    id: 1001,
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@example.com',
    date: '2023-10-15T10:30:00Z',
    montant: 89.97,
    status: 'completed',
    products: [
      { id: 1, name: 'T-shirt Space Galaxy', quantity: 2, price: 29.99 },
      { id: 3, name: 'Casquette Étoilée', quantity: 1, price: 29.99 }
    ]
  },
  {
    id: 1002,
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@example.com',
    date: '2023-11-22T14:45:00Z',
    montant: 45.00,
    status: 'pending',
    products: [
      { id: 2, name: 'Hoodie Cosmic', quantity: 1, price: 45.00 }
    ]
  },
  {
    id: 1003,
    clientName: 'Pierre Dubois',
    clientEmail: 'pierre.dubois@example.com',
    date: '2023-12-10T09:15:00Z',
    montant: 119.96,
    status: 'cancelled',
    products: [
      { id: 4, name: 'Sweatshirt Astronaute', quantity: 2, price: 59.98 }
    ]
  },
  {
    id: 1004,
    clientName: 'Sophie Lefevre',
    clientEmail: 'sophie.lefevre@example.com',
    date: '2024-01-05T16:20:00Z',
    montant: 87.25,
    status: 'completed',
    products: [
      { id: 1, name: 'T-shirt Space Galaxy', quantity: 1, price: 29.99 },
      { id: 5, name: 'Pantalon Constellation', quantity: 1, price: 57.26 }
    ]
  }
];

const AdminCommandesPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    // Charger les commandes depuis localStorage ou utiliser les commandes par défaut
    const savedCommandes = localStorage.getItem('commandes');
    if (savedCommandes) {
      try {
        const parsedCommandes = JSON.parse(savedCommandes);
        if (Array.isArray(parsedCommandes) && parsedCommandes.length > 0) {
          setCommandes(parsedCommandes);
        } else {
          setCommandes(mockCommandes);
          localStorage.setItem('commandes', JSON.stringify(mockCommandes));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        setCommandes(mockCommandes);
        localStorage.setItem('commandes', JSON.stringify(mockCommandes));
      }
    } else {
      setCommandes(mockCommandes);
      localStorage.setItem('commandes', JSON.stringify(mockCommandes));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-yellow-500', icon: <Clock size={14} /> };
      case 'completed':
        return { label: 'Complétée', color: 'bg-green-500', icon: <Check size={14} /> };
      case 'cancelled':
        return { label: 'Annulée', color: 'bg-red-500', icon: <X size={14} /> };
      default:
        return { label: 'Inconnu', color: 'bg-gray-500', icon: null };
    }
  };

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = 
      commande.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || commande.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCommande = (id: number) => {
    const updatedCommandes = commandes.filter(commande => commande.id !== id);
    setCommandes(updatedCommandes);
    localStorage.setItem('commandes', JSON.stringify(updatedCommandes));
  };

  const handleUpdateStatus = (id: number, newStatus: 'pending' | 'completed' | 'cancelled') => {
    const updatedCommandes = commandes.map(commande => 
      commande.id === id ? { ...commande, status: newStatus } : commande
    );
    setCommandes(updatedCommandes);
    localStorage.setItem('commandes', JSON.stringify(updatedCommandes));
  };

  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigation />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-blue to-orange-500">
            Gestion des Commandes
          </h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Suivez et gérez toutes les commandes de votre boutique.
          </p>
          
          {/* Search and Filter Bar */}
          <div className="winshirt-card p-6 mb-10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-winshirt-space-light border-winshirt-purple/30 pl-10"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Complétées</SelectItem>
                    <SelectItem value="cancelled">Annulées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Commandes Table */}
          <div className="winshirt-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-winshirt-purple/30">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Client</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white text-right">Montant</TableHead>
                    <TableHead className="text-white">Statut</TableHead>
                    <TableHead className="text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommandes.map((commande) => {
                    const status = getStatusLabel(commande.status);
                    
                    return (
                      <TableRow key={commande.id} className="border-b border-winshirt-space-light">
                        <TableCell className="text-gray-300">#{commande.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white font-medium">{commande.clientName}</div>
                            <div className="text-winshirt-blue-light text-sm">{commande.clientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{formatDate(commande.date)}</TableCell>
                        <TableCell className="text-gray-300 text-right">{commande.montant.toFixed(2)} €</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full ${status.color}/20 border border-${status.color}/30 inline-flex items-center gap-1`}>
                            {status.icon}
                            <span className="text-white text-sm">{status.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-winshirt-blue hover:text-winshirt-blue-light hover:bg-winshirt-blue/10"
                            >
                              <Eye size={16} />
                            </Button>
                            {commande.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                onClick={() => handleUpdateStatus(commande.id, 'completed')}
                              >
                                <Check size={16} />
                              </Button>
                            )}
                            {commande.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => handleUpdateStatus(commande.id, 'cancelled')}
                              >
                                <X size={16} />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDeleteCommande(commande.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredCommandes.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl text-gray-400 mb-2">Aucune commande trouvée</h3>
                <p className="text-gray-500">Modifiez vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminCommandesPage;


import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Mail, Trash, Edit } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

// Données de clients fictives
const mockClients: Client[] = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    createdAt: '2023-05-15T10:30:00Z',
    ordersCount: 3,
    totalSpent: 125.75
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    createdAt: '2023-06-22T14:45:00Z',
    ordersCount: 1,
    totalSpent: 45.00
  },
  {
    id: 3,
    name: 'Pierre Dubois',
    email: 'pierre.dubois@example.com',
    createdAt: '2023-07-10T09:15:00Z',
    ordersCount: 5,
    totalSpent: 230.50
  },
  {
    id: 4,
    name: 'Sophie Lefevre',
    email: 'sophie.lefevre@example.com',
    createdAt: '2023-08-05T16:20:00Z',
    ordersCount: 2,
    totalSpent: 87.25
  }
];

const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Charger les clients depuis localStorage ou utiliser les clients par défaut
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        if (Array.isArray(parsedClients) && parsedClients.length > 0) {
          setClients(parsedClients);
        } else {
          setClients(mockClients);
          localStorage.setItem('clients', JSON.stringify(mockClients));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        setClients(mockClients);
        localStorage.setItem('clients', JSON.stringify(mockClients));
      }
    } else {
      setClients(mockClients);
      localStorage.setItem('clients', JSON.stringify(mockClients));
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

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClient = (id: number) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleContactClient = (email: string) => {
    window.open(`mailto:${email}`);
  };

  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigation />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-green-500">
            Gestion des Clients
          </h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Visualisez et gérez tous vos clients depuis cette interface.
          </p>
          
          {/* Search and Add Bar */}
          <div className="winshirt-card p-6 mb-10">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-winshirt-space-light border-winshirt-purple/30 pl-10"
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                <UserPlus size={16} className="mr-2" />
                Ajouter un client
              </Button>
            </div>
          </div>
          
          {/* Clients Table */}
          <div className="winshirt-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-winshirt-purple/30">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Nom</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Date d'inscription</TableHead>
                    <TableHead className="text-white text-right">Commandes</TableHead>
                    <TableHead className="text-white text-right">Total dépensé</TableHead>
                    <TableHead className="text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-b border-winshirt-space-light">
                      <TableCell className="text-gray-300">{client.id}</TableCell>
                      <TableCell className="text-white font-medium">{client.name}</TableCell>
                      <TableCell className="text-winshirt-blue-light">{client.email}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(client.createdAt)}</TableCell>
                      <TableCell className="text-gray-300 text-right">{client.ordersCount}</TableCell>
                      <TableCell className="text-gray-300 text-right">{client.totalSpent.toFixed(2)} €</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => handleContactClient(client.email)}
                          >
                            <Mail size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-winshirt-blue hover:text-winshirt-blue-light hover:bg-winshirt-blue/10"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl text-gray-400 mb-2">Aucun client trouvé</h3>
                <p className="text-gray-500">Modifiez vos critères de recherche ou ajoutez de nouveaux clients</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminClientsPage;

import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries } from '@/data/mockData';
import { Client } from '@/types/client';
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
  UserPlus,
  Filter,
  Award,
  ShoppingBag,
  Eye,
  Edit,
  Trash
} from 'lucide-react';
import { toast } from '@/lib/toast';
import AdminNavigation from '@/components/admin/AdminNavigation';
import ClientForm from '@/components/admin/clients/ClientForm';

// Exemple de clients pour démo
const mockClients: Client[] = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "0601020304",
    address: "123 Rue de Paris",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    registrationDate: "2023-01-15T10:30:00.000Z",
    lastLogin: "2023-09-20T14:15:00.000Z",
    orderCount: 5,
    totalSpent: 349.97,
    participatedLotteries: [1, 3],
    wonLotteries: [1]
  },
  {
    id: 2,
    name: "Marie Martin",
    email: "marie.martin@example.com",
    phone: "0607080910",
    address: "45 Avenue des Champs",
    city: "Lyon",
    postalCode: "69000",
    country: "France",
    registrationDate: "2023-02-20T09:45:00.000Z",
    lastLogin: "2023-09-22T11:05:00.000Z",
    orderCount: 3,
    totalSpent: 178.50,
    participatedLotteries: [2, 4, 5],
    wonLotteries: []
  },
  {
    id: 3,
    name: "Pierre Dubois",
    email: "pierre.dubois@example.com",
    phone: "0612131415",
    address: "87 Boulevard Saint-Michel",
    city: "Marseille",
    postalCode: "13000",
    country: "France",
    registrationDate: "2023-03-10T15:20:00.000Z",
    lastLogin: "2023-09-18T16:30:00.000Z",
    orderCount: 2,
    totalSpent: 99.99,
    participatedLotteries: [1, 2, 3],
    wonLotteries: [3]
  },
  {
    id: 4,
    name: "Sophie Lefebvre",
    email: "sophie.lefebvre@example.com",
    phone: "0617181920",
    address: "32 Rue de la République",
    city: "Bordeaux",
    postalCode: "33000",
    country: "France",
    registrationDate: "2023-04-05T11:10:00.000Z",
    lastLogin: "2023-09-21T10:45:00.000Z",
    orderCount: 7,
    totalSpent: 499.95,
    participatedLotteries: [4, 5],
    wonLotteries: [5]
  }
];

const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Charger les clients depuis localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        if (Array.isArray(parsedClients) && parsedClients.length > 0) {
          setClients(parsedClients);
          setFilteredClients(parsedClients);
        } else {
          // Si pas de clients en localStorage, utiliser les mockClients
          setClients(mockClients);
          setFilteredClients(mockClients);
          localStorage.setItem('clients', JSON.stringify(mockClients));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        // Utiliser les mockClients en cas d'erreur
        setClients(mockClients);
        setFilteredClients(mockClients);
        localStorage.setItem('clients', JSON.stringify(mockClients));
      }
    } else {
      // Si pas de clients en localStorage, utiliser les mockClients
      setClients(mockClients);
      setFilteredClients(mockClients);
      localStorage.setItem('clients', JSON.stringify(mockClients));
    }
  }, []);
  
  // Filtrer les clients selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(term) || 
        client.email.toLowerCase().includes(term) ||
        (client.phone && client.phone.includes(term)) ||
        (client.city && client.city.toLowerCase().includes(term))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);
  
  const handleDeleteClient = (clientId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      toast.success("Client supprimé avec succès");
    }
  };
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };
  
  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };
  
  // Send welcome email simulation
  const sendWelcomeEmail = (client: Client) => {
    // This is a simulation of sending an email
    console.info(`[SIMULATION EMAIL] À: ${client.email}, Sujet: Bienvenue sur WinShirt`);
    console.info(`[SIMULATION EMAIL] Corps du message: Bonjour ${client.name},

Merci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.

Bien cordialement,
L'équipe WinShirt`);

    // In a real application, you would call an API to send the email
  };
  
  const handleSaveClient = (clientData: Client) => {
    let updatedClients: Client[];
    
    if (editingClient) {
      // Mise à jour d'un client existant
      updatedClients = clients.map(c => 
        c.id === clientData.id ? clientData : c
      );
      toast.success("Client mis à jour avec succès");
    } else {
      // Ajout d'un nouveau client
      const newClient = {
        ...clientData,
        id: Math.max(0, ...clients.map(c => c.id)) + 1,
        registrationDate: new Date().toISOString(),
        orderCount: 0,
        totalSpent: 0,
        participatedLotteries: [],
        wonLotteries: []
      };
      updatedClients = [...clients, newClient];
      
      // Send welcome email for new clients
      sendWelcomeEmail(newClient);
      
      toast.success("Client ajouté avec succès");
    }
    
    // Update clients state
    setClients(updatedClients);
    setFilteredClients(updatedClients); // Update filtered clients too
    
    // Save to localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    
    // Close form
    setShowForm(false);
    setEditingClient(null);
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
            Gestion des Clients
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Gérez les informations de vos clients
          </p>
          
          {showForm ? (
            <div className="max-w-4xl mx-auto">
              <ClientForm 
                client={editingClient} 
                onSave={handleSaveClient} 
                onCancel={() => {
                  setShowForm(false);
                  setEditingClient(null);
                }} 
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtres et recherche */}
              <div className="winshirt-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="border-winshirt-purple/30 text-white">
                    <Filter size={16} className="mr-2" />
                    Filtres
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddClient}>
                    <UserPlus size={16} className="mr-2" />
                    Ajouter un client
                  </Button>
                </div>
              </div>
              
              {/* Liste des clients */}
              <div className="winshirt-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-winshirt-space-light">
                      <TableRow>
                        <TableHead className="text-white">Nom</TableHead>
                        <TableHead className="text-white">Inscription</TableHead>
                        <TableHead className="text-white">Contact</TableHead>
                        <TableHead className="text-white">Localisation</TableHead>
                        <TableHead className="text-white">
                          <div className="flex items-center gap-1">
                            <ShoppingBag size={14} />
                            <span>Commandes</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white">
                          <div className="flex items-center gap-1">
                            <Award size={14} />
                            <span>Loteries</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map(client => (
                        <TableRow key={client.id} className="border-b border-winshirt-purple/10">
                          <TableCell className="font-medium text-white">
                            {client.name}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {formatDate(client.registrationDate)}
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-300">{client.email}</div>
                            <div className="text-gray-400">{client.phone}</div>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {client.city}, {client.country}
                          </TableCell>
                          <TableCell>
                            <div className="text-winshirt-purple-light font-semibold">{client.orderCount}</div>
                            <div className="text-gray-400">{client.totalSpent.toFixed(2)} €</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-winshirt-blue-light">
                              {client.participatedLotteries?.length || 0} participations
                            </div>
                            <div className="text-green-400">
                              {client.wonLotteries?.length || 0} gagnées
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                                <Eye size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-winshirt-blue hover:text-winshirt-blue-light h-8 w-8 p-0"
                                onClick={() => handleEditClient(client)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-400 h-8 w-8 p-0"
                                onClick={() => handleDeleteClient(client.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredClients.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                            Aucun client trouvé
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

export default AdminClientsPage;

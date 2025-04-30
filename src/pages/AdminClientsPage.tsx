
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
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
import ClientDetail from '@/components/admin/clients/ClientDetail';
import { supabase } from '@/integrations/supabase/client';
import { pushDataToSupabase, pullDataFromSupabase } from '@/lib/syncManager';

const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les clients depuis localStorage sans données fake
  useEffect(() => {
    const loadClients = () => {
      setIsLoading(true);
      try {
        const savedClients = localStorage.getItem('clients');
        if (savedClients) {
          const parsedClients = JSON.parse(savedClients);
          if (Array.isArray(parsedClients)) {
            setClients(parsedClients);
            setFilteredClients(parsedClients);
          } else {
            // Initialiser avec un tableau vide si format incorrect
            setClients([]);
            setFilteredClients([]);
            localStorage.setItem('clients', JSON.stringify([]));
          }
        } else {
          // Initialiser avec un tableau vide si pas de données
          setClients([]);
          setFilteredClients([]);
          localStorage.setItem('clients', JSON.stringify([]));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        setClients([]);
        setFilteredClients([]);
        localStorage.setItem('clients', JSON.stringify([]));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClients();
    
    // Écouter les mises à jour du stockage
    const handleStorageUpdate = () => loadClients();
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, []);
  
  // Synchroniser les clients avec Supabase
  const syncClients = async () => {
    setIsLoading(true);
    try {
      const result = await pushDataToSupabase('clients');
      if (result.success) {
        toast.success(`${result.localCount} clients synchronisés avec Supabase`);
      } else {
        toast.error(`Erreur lors de la synchronisation: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error("Erreur lors de la synchronisation des clients");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Récupérer les clients depuis Supabase
  const pullClients = async () => {
    setIsLoading(true);
    try {
      const result = await pullDataFromSupabase('clients');
      if (result.success) {
        toast.success(`${result.remoteCount} clients récupérés depuis Supabase`);
      } else {
        toast.error(`Erreur lors de la récupération: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération:", error);
      toast.error("Erreur lors de la récupération des clients");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrer les clients selon le terme de recherche avec debounce
  useEffect(() => {
    const filterClients = () => {
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
    };
    
    // Utiliser un debounce pour améliorer les performances lors de la recherche
    const timeoutId = setTimeout(filterClients, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, clients]);
  
  const handleDeleteClient = (clientId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      toast.success("Client supprimé avec succès");
    }
  };
  
  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setShowDetail(true);
    setShowForm(false);
  };
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
    setShowDetail(false);
  };
  
  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
    setShowDetail(false);
  };
  
  // Send welcome email simulation
  const sendWelcomeEmail = (client: Client) => {
    // This is a simulation of sending an email
    console.info(`[SIMULATION EMAIL] À: ${client.email}, Sujet: Bienvenue sur WinShirt`);
    console.info(`[SIMULATION EMAIL] Corps du message: Bonjour ${client.name},

Merci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.

Bien cordialement,
L'équipe WinShirt`);
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
  
  if (isLoading) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-16 flex justify-center items-center">
          <div className="text-white text-xl">Chargement des clients...</div>
        </div>
        <AdminNavigation />
      </>
    );
  }
  
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
          ) : showDetail ? (
            <div className="max-w-5xl mx-auto">
              <ClientDetail 
                client={viewingClient!} 
                onClose={() => {
                  setShowDetail(false);
                  setViewingClient(null);
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
                  <Button variant="outline" className="border-winshirt-purple/30 text-white" onClick={pullClients}>
                    <Filter size={16} className="mr-2" />
                    Récupérer
                  </Button>
                  <Button variant="outline" className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10" onClick={syncClients}>
                    <ShoppingBag size={16} className="mr-2" />
                    Synchroniser
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                onClick={() => handleViewClient(client)}
                              >
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
                            Aucun client trouvé. Attendez qu'un client passe une commande ou créez-en un manuellement.
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

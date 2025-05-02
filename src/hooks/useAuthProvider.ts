import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { toast } from '@/lib/toast';
import { Client } from '@/types/client';
import { EmailService } from '@/lib/emailService';
import { Order } from '@/types/order';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Initialize auth on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser?.role === 'admin' || parsedUser?.isAdmin === true);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear invalid user data
        localStorage.removeItem('user');
      }
    }

    // Check if we need to auto-create accounts from client data
    tryCreateUserAccountsFromClients();
  }, []);

  // Function to try and create user accounts from existing clients
  const tryCreateUserAccountsFromClients = () => {
    try {
      // Get all clients from localStorage
      const clientsStr = localStorage.getItem('clients');
      if (clientsStr) {
        const clients: Client[] = JSON.parse(clientsStr);
        
        if (clients.length > 0) {
          console.log(`Found ${clients.length} clients that could be converted to user accounts`);
          
          // For each client, create a user object if it doesn't exist
          clients.forEach(client => {
            if (client.email) {
              // Create a simple user account for this client
              // Real apps would use proper auth, but this is for demo/dev purposes
              const clientUser: User = {
                id: Math.floor(Math.random() * 1000) + 2,
                name: client.name || client.email.split('@')[0],
                email: client.email,
                role: 'user',
                registrationDate: client.registrationDate || new Date().toISOString(),
                clientId: client.id // Link to the actual client record
              };
              
              // Store in localStorage with email as key for demo purposes
              localStorage.setItem(`user_${client.email}`, JSON.stringify(clientUser));
              console.log(`Created user account for client: ${client.name || client.email}`);
            }
          });
          
          // Let the user know accounts were created
          toast.success("Des comptes utilisateur ont été créés à partir des données clients", {
            position: "bottom-right",
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error("Error creating user accounts from clients:", error);
    }
  };
  
  const login = (email: string, password: string) => {
    // Admin account hardcoded for demo
    if (email === "admin@winshirt.fr" && password === "Chacha2@25!!") {
      const adminUser: User = {
        id: 1,
        name: "Administrateur",
        email: email,
        role: 'admin',
        registrationDate: new Date().toISOString(),
      };
      
      setUser(adminUser);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      toast.success("Connecté en tant qu'administrateur");
      return;
    }
    
    // Check if this is a client user
    const clientUserStr = localStorage.getItem(`user_${email}`);
    if (clientUserStr && password.length >= 1) { // Simple password check for demo
      try {
        const clientUser = JSON.parse(clientUserStr);
        setUser(clientUser);
        setIsAuthenticated(true);
        setIsAdmin(false);
        localStorage.setItem('user', JSON.stringify(clientUser));
        
        toast.success("Connexion réussie en tant que client");
        return;
      } catch (error) {
        console.error("Error parsing client user:", error);
      }
    }
    
    // Demo user account for other cases
    if (email && password.length >= 6) {
      const demoUser: User = {
        id: Math.floor(Math.random() * 1000) + 2,
        name: email.split('@')[0],
        email: email,
        role: 'user',
        registrationDate: new Date().toISOString(),
      };
      
      setUser(demoUser);
      setIsAuthenticated(true);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(demoUser));
      
      toast.success("Connexion réussie");
      return;
    }
    
    toast.error("Identifiants invalides. Essayez admin@winshirt.fr / admin123 pour un accès admin ou utilisez un email de client.");
  };
  
  const register = async (name: string, email: string, password: string): Promise<User> => {
    if (name && email && password.length >= 6) {
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 2,
        name: name,
        email: email,
        role: 'user',
        registrationDate: new Date().toISOString(),
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Also store this user as a client for demo purposes
      const clientsStr = localStorage.getItem('clients');
      let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      
      const newClient: Client = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        name: name,
        email: email,
        phone: '',
        registrationDate: new Date().toISOString(),
        orderCount: 0,
        totalSpent: 0
      };
      
      clients.push(newClient);
      localStorage.setItem('clients', JSON.stringify(clients));
      
      // Store the user keyed by email for login purposes
      localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      
      // Check if there's a pending order for this registration
      const pendingOrderStr = localStorage.getItem('pending_order');
      let order: Order | undefined = undefined;
      
      if (pendingOrderStr) {
        try {
          order = JSON.parse(pendingOrderStr);
          // Clear the pending order after using it
          localStorage.removeItem('pending_order');
        } catch (e) {
          console.error("Error parsing pending order:", e);
        }
      }
      
      // Send welcome email with order details if available
      try {
        await EmailService.sendAccountCreationEmail(email, name, order);
        console.log("Welcome email sent successfully", order ? "with order details" : "without order");
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
      
      toast.success("Inscription réussie");
      return newUser;
    }
    
    toast.error("Informations d'inscription invalides. Le mot de passe doit contenir au moins 6 caractères.");
    throw new Error("Invalid registration information");
  };
  
  const loginWithSocialMedia = (provider: 'facebook' | 'google') => {
    const socialUser: User = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: `Utilisateur ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      email: `user_${Math.floor(Math.random() * 1000)}@${provider}.com`,
      role: 'user',
      provider: provider,
      registrationDate: new Date().toISOString(),
      socialMediaDetails: {
        providerId: `${provider}_${Math.random().toString(36).substring(2, 15)}`,
        displayName: `Utilisateur ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      }
    };
    
    setUser(socialUser);
    setIsAuthenticated(true);
    setIsAdmin(false);
    localStorage.setItem('user', JSON.stringify(socialUser));
    
    toast.success(`Connexion via ${provider.charAt(0).toUpperCase() + provider.slice(1)} réussie`);
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    
    toast.success("Déconnexion réussie");
  };
  
  const getAllUsers = useCallback((): User[] => {
    // For demo purposes only - would fetch from an API in a real app
    const adminUser: User = {
      id: 1,
      name: "Administrateur",
      email: "admin@winshirt.fr",
      role: 'admin',
      registrationDate: "2023-01-01T00:00:00.000Z",
    };
    
    // Get client users too
    const clientUsers: User[] = [];
    try {
      const clientsStr = localStorage.getItem('clients');
      if (clientsStr) {
        const clients: Client[] = JSON.parse(clientsStr);
        clients.forEach(client => {
          if (client.email) {
            clientUsers.push({
              id: client.id + 1000, // Avoid ID collisions
              name: client.name || client.email.split('@')[0],
              email: client.email,
              role: 'user',
              registrationDate: client.registrationDate,
              clientId: client.id
            });
          }
        });
      }
    } catch (error) {
      console.error("Error getting client users:", error);
    }
    
    const demoUsers: User[] = [
      adminUser,
      {
        id: 2,
        name: "Jean Dupont",
        email: "jean@example.com",
        role: 'user',
        registrationDate: "2023-01-15T00:00:00.000Z",
      },
      {
        id: 3,
        name: "Marie Martin",
        email: "marie@example.com",
        role: 'user',
        registrationDate: "2023-02-10T00:00:00.000Z",
      },
      ...clientUsers
    ];
    
    return demoUsers;
  }, []);
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    loginWithSocialMedia,
    logout,
    getAllUsers
  };
};


import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { toast } from '@/lib/toast';

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
  }, []);
  
  const login = (email: string, password: string) => {
    // Admin account hardcoded for demo
    if (email === "admin@winshirt.com" && password === "admin123") {
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
    
    // Demo user account
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
    
    toast.error("Identifiants invalides. Essayez admin@winshirt.com / admin123 pour un accès admin.");
  };
  
  const register = (name: string, email: string, password: string) => {
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
      
      toast.success("Inscription réussie");
      return;
    }
    
    toast.error("Informations d'inscription invalides. Le mot de passe doit contenir au moins 6 caractères.");
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
  
  const getAllUsers = (): User[] => {
    // For demo purposes only - would fetch from an API in a real app
    const adminUser: User = {
      id: 1,
      name: "Administrateur",
      email: "admin@winshirt.com",
      role: 'admin',
      registrationDate: "2023-01-01T00:00:00.000Z",
    };
    
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
      }
    ];
    
    return demoUsers;
  };
  
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

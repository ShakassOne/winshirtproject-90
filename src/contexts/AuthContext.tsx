import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate?: string;
  provider?: 'email' | 'facebook' | 'google';
  profilePicture?: string;
  phoneNumber?: string;
  socialMediaDetails?: {
    providerId?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    isVerified?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => void;
  loginWithSocialMedia: (provider: 'facebook' | 'google') => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au démarrage
    const storedUser = localStorage.getItem('winshirt_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    }
    
    // Initialiser les utilisateurs si cette entrée n'existe pas
    if (!localStorage.getItem('winshirt_users')) {
      const initialUsers = [
        {
          id: 1,
          name: 'Admin',
          email: 'admin@winshirt.com',
          role: 'admin',
          registrationDate: new Date().toISOString(),
          provider: 'email'
        }
      ];
      localStorage.setItem('winshirt_users', JSON.stringify(initialUsers));
    }
  }, []);

  const getAllUsers = (): User[] => {
    const registeredUsers = localStorage.getItem('winshirt_users');
    if (registeredUsers) {
      try {
        return JSON.parse(registeredUsers);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    }
    return [];
  };

  const login = (email: string, password: string) => {
    // Simuler une vérification d'identifiants
    if (email === 'admin@winshirt.com' && password === 'admin123') {
      const adminUser: User = {
        id: 1,
        name: 'Admin',
        email: 'admin@winshirt.com',
        role: 'admin',
        registrationDate: new Date().toISOString(),
        provider: 'email'
      };
      setUser(adminUser);
      localStorage.setItem('winshirt_user', JSON.stringify(adminUser));
      toast.success("Connexion réussie en tant qu'administrateur!");
      return;
    }

    // Récupérer les utilisateurs enregistrés
    const registeredUsers = localStorage.getItem('winshirt_users');
    if (registeredUsers) {
      try {
        const users: User[] = JSON.parse(registeredUsers);
        const foundUser = users.find(u => u.email === email);
        
        if (foundUser) {
          // Dans un vrai système, on vérifierait le mot de passe hashé
          // Ici, on simule une connexion réussie
          setUser(foundUser);
          localStorage.setItem('winshirt_user', JSON.stringify(foundUser));
          toast.success("Connexion réussie!");
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    }
    
    toast.error("Email ou mot de passe incorrect");
  };

  const loginWithSocialMedia = (provider: 'facebook' | 'google') => {
    // Simuler une connexion avec un réseau social, mais de manière plus réaliste
    
    const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
    
    // Générer des données utilisateur plus réalistes
    const randomId = Math.floor(Math.random() * 10000);
    
    let userData: Partial<User> = {};
    
    if (provider === 'facebook') {
      // Simulation de données Facebook
      userData = {
        name: `Jean Dupont`, // Nom fictif pour la démo
        email: `jean.dupont${randomId}@facebook.com`,
        profilePicture: "https://i.pravatar.cc/150?u=facebook" + randomId,
        socialMediaDetails: {
          providerId: `facebook-${randomId}`,
          displayName: "Jean Dupont",
          firstName: "Jean",
          lastName: "Dupont",
          isVerified: true
        }
      };
    } else {
      // Simulation de données Google
      userData = {
        name: `Marie Martin`, // Nom fictif pour la démo
        email: `marie.martin${randomId}@gmail.com`,
        profilePicture: "https://i.pravatar.cc/150?u=google" + randomId,
        socialMediaDetails: {
          providerId: `google-${randomId}`,
          displayName: "Marie Martin",
          firstName: "Marie",
          lastName: "Martin",
          isVerified: true
        }
      };
    }
    
    // Vérifier si l'utilisateur existe déjà
    const registeredUsers = localStorage.getItem('winshirt_users');
    let users: User[] = [];
    
    if (registeredUsers) {
      try {
        users = JSON.parse(registeredUsers);
        
        // Vérifier avec l'email ou l'ID du provider
        const existingUserByEmail = users.find(u => u.email === userData.email);
        const existingUserByProviderId = users.find(
          u => u.socialMediaDetails?.providerId === userData.socialMediaDetails?.providerId
        );
        
        const existingUser = existingUserByEmail || existingUserByProviderId;
        
        if (existingUser) {
          // L'utilisateur existe déjà, connectez-le
          // Mettre à jour les informations si nécessaire
          const updatedUser = {
            ...existingUser,
            ...userData,
            id: existingUser.id // Conserver l'ID original
          };
          
          // Mettre à jour l'utilisateur dans la liste
          const updatedUsers = users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          
          localStorage.setItem('winshirt_users', JSON.stringify(updatedUsers));
          
          setUser(updatedUser);
          localStorage.setItem('winshirt_user', JSON.stringify(updatedUser));
          toast.success(`Connexion réussie avec ${providerName}!`);
          navigate('/account');
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    }
    
    // Créer un nouvel utilisateur
    const newUser: User = {
      id: users.length + 2, // +2 car id 1 est réservé pour l'admin
      ...userData as User,
      role: 'user',
      registrationDate: new Date().toISOString(),
      provider: provider
    };
    
    users.push(newUser);
    localStorage.setItem('winshirt_users', JSON.stringify(users));
    
    // Connecter l'utilisateur
    setUser(newUser);
    localStorage.setItem('winshirt_user', JSON.stringify(newUser));
    
    // Simuler l'envoi d'un e-mail de confirmation
    simulateSendEmail(
      newUser.email, 
      `Bienvenue sur WinShirt - Connexion avec ${providerName}`, 
      `Bonjour ${newUser.name},\n\nMerci de vous être inscrit sur WinShirt avec ${providerName}. Votre compte a été créé avec succès.\n\nBien cordialement,\nL'équipe WinShirt`
    );
    
    // Simuler la vérification en deux étapes pour Google
    if (provider === 'google') {
      // Afficher une notification pour simuler la 2FA
      toast.info(`Simulation: Google vous a envoyé un code de vérification sur votre téléphone.`, {
        duration: 5000
      });
      
      // Après un délai, simuler que l'utilisateur a entré le code correct
      setTimeout(() => {
        toast.success(`Vérification en deux étapes réussie!`, {
          duration: 3000
        });
      }, 3000);
    }
    
    toast.success(`Inscription réussie avec ${providerName}!`);
    navigate('/account');
  };

  const register = (name: string, email: string, password: string) => {
    // Vérifier si l'utilisateur existe déjà
    const registeredUsers = localStorage.getItem('winshirt_users');
    let users: User[] = [];
    
    if (registeredUsers) {
      try {
        users = JSON.parse(registeredUsers);
        if (users.some(u => u.email === email)) {
          toast.error("Un compte existe déjà avec cet email");
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    }
    
    // Créer un nouvel utilisateur
    const newUser: User = {
      id: users.length + 2, // +2 car id 1 est réservé pour l'admin
      name,
      email,
      role: 'user',
      registrationDate: new Date().toISOString(),
      provider: 'email'
    };
    
    users.push(newUser);
    localStorage.setItem('winshirt_users', JSON.stringify(users));
    
    // Connecter automatiquement l'utilisateur
    setUser(newUser);
    localStorage.setItem('winshirt_user', JSON.stringify(newUser));
    
    // Simuler l'envoi d'un e-mail de confirmation
    simulateSendEmail(
      newUser.email, 
      "Bienvenue sur WinShirt", 
      `Bonjour ${newUser.name},\n\nMerci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.\n\nBien cordialement,\nL'équipe WinShirt`
    );
    
    toast.success("Inscription réussie!");
    navigate('/account');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('winshirt_user');
    toast.info("Vous avez été déconnecté");
    navigate('/');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login, 
        loginWithSocialMedia,
        register, 
        logout,
        getAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Fonction pour simuler l'envoi d'un e-mail
export const simulateSendEmail = (to: string, subject: string, body: string) => {
  console.log(`[SIMULATION EMAIL] À: ${to}, Sujet: ${subject}`);
  console.log(`[SIMULATION EMAIL] Corps du message: ${body}`);
  
  // Dans une application réelle, on appellerait ici un service d'envoi d'e-mail
  return true;
};

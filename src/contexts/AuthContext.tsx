
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => void;
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
          registrationDate: new Date().toISOString()
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
        registrationDate: new Date().toISOString()
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
      registrationDate: new Date().toISOString()
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

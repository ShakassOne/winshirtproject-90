import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { EmailService } from '@/lib/emailService';
import { supabase } from '@/lib/supabase';

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
    // Charger l'utilisateur depuis localStorage au démarrage et vérifier Supabase
    const storedUser = localStorage.getItem('winshirt_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    }
    
    // Vérifier l'état de la session Supabase
    const checkSupabaseSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur lors de la récupération de la session Supabase:", error);
        return;
      }
      
      if (data.session) {
        const { user: supabaseUser } = data.session;
        
        // Convertir l'utilisateur Supabase en format User
        if (supabaseUser) {
          const userRole = supabaseUser.email === 'admin@winshirt.com' ? 'admin' : 'user';
          
          // Déterminer le provider
          let provider: 'email' | 'facebook' | 'google' = 'email';
          if (supabaseUser.app_metadata?.provider === 'facebook') {
            provider = 'facebook';
          } else if (supabaseUser.app_metadata?.provider === 'google') {
            provider = 'google';
          }
          
          const newUser: User = {
            id: parseInt(supabaseUser.id.substring(0, 8), 16), // Generate ID from UUID
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
            email: supabaseUser.email || '',
            role: userRole,
            registrationDate: supabaseUser.created_at,
            provider: provider,
            profilePicture: supabaseUser.user_metadata?.avatar_url,
            socialMediaDetails: {
              providerId: supabaseUser.id,
              displayName: supabaseUser.user_metadata?.name,
            }
          };
          
          setUser(newUser);
          localStorage.setItem('winshirt_user', JSON.stringify(newUser));
        }
      }
    };
    
    // Vérifier la session Supabase
    checkSupabaseSession();
    
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
    
    // S'abonner aux changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user: supabaseUser } = session;
          
          // Convertir l'utilisateur Supabase en format User
          if (supabaseUser) {
            const userRole = supabaseUser.email === 'admin@winshirt.com' ? 'admin' : 'user';
            
            // Déterminer le provider
            let provider: 'email' | 'facebook' | 'google' = 'email';
            if (supabaseUser.app_metadata?.provider === 'facebook') {
              provider = 'facebook';
            } else if (supabaseUser.app_metadata?.provider === 'google') {
              provider = 'google';
            }
            
            const newUser: User = {
              id: parseInt(supabaseUser.id.substring(0, 8), 16),
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
              email: supabaseUser.email || '',
              role: userRole,
              registrationDate: supabaseUser.created_at,
              provider: provider,
              profilePicture: supabaseUser.user_metadata?.avatar_url,
              socialMediaDetails: {
                providerId: supabaseUser.id,
                displayName: supabaseUser.user_metadata?.name,
              }
            };
            
            setUser(newUser);
            localStorage.setItem('winshirt_user', JSON.stringify(newUser));
            toast.success("Connexion réussie!");
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('winshirt_user');
          toast.info("Vous avez été déconnecté");
        }
      }
    );
    
    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
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

  const login = async (email: string, password: string) => {
    try {
      // Tenter de se connecter avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Si échec avec Supabase, essayer le mode simulation
        console.error("Erreur de connexion Supabase:", error);
        
        // Simulation pour admin@winshirt.com
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
          toast.success("Connexion réussie en tant qu'administrateur! (Mode simulation)");
          return;
        }
        
        // Récupérer les utilisateurs enregistrés en mode simulation
        const registeredUsers = localStorage.getItem('winshirt_users');
        if (registeredUsers) {
          try {
            const users: User[] = JSON.parse(registeredUsers);
            const foundUser = users.find(u => u.email === email);
            
            if (foundUser) {
              setUser(foundUser);
              localStorage.setItem('winshirt_user', JSON.stringify(foundUser));
              toast.success("Connexion réussie! (Mode simulation)");
              return;
            }
          } catch (parseError) {
            console.error("Erreur lors de la récupération des utilisateurs:", parseError);
          }
        }
        
        toast.error("Email ou mot de passe incorrect");
        return;
      }
      
      // Connexion Supabase réussie
      toast.success("Connexion réussie!");
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  const loginWithSocialMedia = async (provider: 'facebook' | 'google') => {
    try {
      // Tentative de connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/account'
        }
      });
      
      if (error) {
        console.error(`Erreur de connexion ${provider}:`, error);
        
        // Retomber sur la simulation si erreur Supabase
        const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
        
        // Générer des données utilisateur simulées
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
              toast.success(`Connexion réussie avec ${providerName}! (Mode simulation)`);
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
        
        // Envoyer un e-mail de confirmation
        EmailService.sendAccountCreationEmail(newUser.email, newUser.name);
        
        toast.success(`Inscription réussie avec ${providerName}! (Mode simulation)`);
        navigate('/account');
        return;
      }
      
      // Redirection Supabase gérée automatiquement
      if (data.url) {
        toast.info(`Redirection vers ${provider} pour authentification...`);
      }
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      toast.error(`Une erreur est survenue lors de la connexion avec ${provider}`);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Tentative d'inscription avec Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error("Erreur d'inscription Supabase:", error);
        
        // Retomber sur la simulation si erreur Supabase
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
          } catch (parseError) {
            console.error("Erreur lors de la récupération des utilisateurs:", parseError);
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
        
        // Envoyer un e-mail de confirmation
        EmailService.sendAccountCreationEmail(newUser.email, newUser.name);
        
        toast.success("Inscription réussie! (Mode simulation)");
        navigate('/account');
        return;
      }
      
      // Inscription Supabase réussie, mais peut nécessiter une confirmation d'email
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error("Un compte existe déjà avec cet email");
          return;
        }
        
        toast.success("Inscription réussie!");
        
        // Si l'inscription ne nécessite pas de confirmation, l'utilisateur est déjà connecté
        if (data.session) {
          navigate('/account');
        } else {
          toast.info("Veuillez vérifier votre email pour confirmer votre compte");
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Une erreur est survenue lors de l'inscription");
    }
  };

  const logout = async () => {
    try {
      // Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur lors de la déconnexion Supabase:", error);
        // Continuer avec la déconnexion locale même en cas d'erreur Supabase
      }
      
      // Déconnexion locale
      setUser(null);
      localStorage.removeItem('winshirt_user');
      toast.info("Vous avez été déconnecté");
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Forcer la déconnexion locale en cas d'erreur
      setUser(null);
      localStorage.removeItem('winshirt_user');
      navigate('/');
    }
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

// Fonction pour simuler l'envoi d'un e-mail - gardée pour compatibilité
export const simulateSendEmail = (to: string, subject: string, body: string) => {
  console.log(`[SIMULATION EMAIL] À: ${to}, Sujet: ${subject}`);
  console.log(`[SIMULATION EMAIL] Corps du message: ${body}`);
  
  // Notification dans la console pour vérifier le fonctionnement
  console.log(`[EMAIL ENVOYÉ] Un email a été envoyé à ${to}`);
  
  // Dans une application réelle, on appellerait ici un service d'envoi d'e-mail
  return true;
};

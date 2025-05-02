
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { AuthContextType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Create context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility function to send simulated emails (used by Stripe)
export const simulateSendEmail = (email: string, subject: string, body: string): boolean => {
  console.log(`Simulated email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialiser l'authentification au chargement
  useEffect(() => {
    // Configurer d'abord l'écouteur d'événements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          // Utilisateur connecté via Supabase Auth
          try {
            // Récupérer les informations utilisateur depuis notre table users
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single();
              
            if (error) {
              console.error('Erreur lors de la récupération des données utilisateur:', error);
              // Créer un nouvel utilisateur dans notre table si non existant
              const newUser: User = {
                id: parseInt(session.user.id, 10) || 0, // Convert string to number or use 0 as fallback
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
                email: session.user.email!,
                role: 'user',
                registrationDate: new Date().toISOString()
              };
              
              // Insérer le nouvel utilisateur
              const { error: insertError } = await supabase
                .from('users')
                .insert(newUser);
                
              if (insertError) {
                console.error('Erreur lors de la création de l\'utilisateur:', insertError);
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
              } else {
                setUser(newUser);
                setIsAuthenticated(true);
                setIsAdmin(newUser.role === 'admin');
              }
            } else {
              // Utilisateur existant
              const userData: User = {
                id: typeof data.id === 'string' ? parseInt(data.id, 10) || 0 : data.id,
                name: data.name,
                email: data.email,
                role: data.role || 'user',
                registrationDate: data.created_at
              };
              
              setUser(userData);
              setIsAuthenticated(true);
              setIsAdmin(data.role === 'admin');
              
              // Log pour débogage
              console.log("Utilisateur authentifié:", userData);
            }
          } catch (error) {
            console.error('Erreur d\'authentification:', error);
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          // Utilisateur déconnecté
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );
    
    // Vérifier s'il y a une session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Pas de session, vérifier s'il y a un utilisateur dans localStorage (compatibilité)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Convert id to number if it's a string
            if (typeof parsedUser.id === 'string') {
              parsedUser.id = parseInt(parsedUser.id, 10) || 0;
            }
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(parsedUser?.role === 'admin' || parsedUser?.isAdmin === true);
          } catch (error) {
            console.error("Erreur parsing stored user:", error);
            localStorage.removeItem('user');
          }
        }
        setIsLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      // Admin account hardcoded for compatibility
      if (email === "admin@winshirt.fr" && password === "Chacha2@25!!") {
        // Tenter de se connecter avec Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // Si échec avec Supabase, utiliser notre méthode de compatibilité
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
      } else {
        // Connexion standard via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(`Erreur lors de la connexion: ${error.message}`);
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      // Inscription via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) throw error;
      
      // Le reste sera géré par l'écouteur d'événements d'authentification
      toast.success("Inscription réussie !");
      
      // Retourner un nouvel objet utilisateur pour compatibilité
      const newUser: User = {
        id: data.user?.id || 0,
        name: name,
        email: email,
        role: 'user',
        registrationDate: new Date().toISOString(),
      };
      
      return newUser;
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast.error(`Erreur lors de l'inscription: ${error.message}`);
      throw error;
    }
  };
  
  const loginWithSocialMedia = async (provider: 'facebook' | 'google') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        toast.error(`Erreur de connexion avec ${provider}: ${error.message}`);
        return;
      }
      
      // Si signInWithOAuth a fonctionné, la page sera redirigée
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    }
  };
  
  const logout = async () => {
    try {
      // Déconnexion via Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Nettoyer localStorage pour compatibilité
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      toast.success("Déconnexion réussie");
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(`Erreur lors de la déconnexion: ${error.message}`);
    }
  };
  
  const getAllUsers = async (): Promise<User[]> => {
    try {
      // Récupérer tous les utilisateurs depuis Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) throw error;
      
      return data.map(user => ({
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role || 'user',
        registrationDate: user.created_at,
      }));
    } catch (error) {
      console.error("Error getting users:", error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      loginWithSocialMedia,
      logout,
      getAllUsers,
      isLoading
    }}>
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/lib/toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkIfAdmin: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  session: null,
  login: async () => false,
  logout: async () => {},
  checkIfAdmin: async () => false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Function to check if user is admin
  const checkIfAdmin = async (userId: string): Promise<boolean> => {
    try {
      // In development mode, always return true for testing
      if (process.env.NODE_ENV === 'development') {
        setIsAdmin(true);
        return true;
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.error("Erreur lors de la vérification du rôle admin:", error);
        setIsAdmin(false);
        return false;
      }
      
      if (data) {
        console.log("L'utilisateur est un administrateur");
        setIsAdmin(true);
        return true;
      } else {
        console.log("L'utilisateur n'est pas un administrateur");
        setIsAdmin(false);
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle admin:", error);
      setIsAdmin(false);
      return false;
    }
  };

  // Authenticate with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erreur lors de la connexion:", error);
        return false;
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        setIsAuthenticated(true);
        
        // Check if user is admin
        await checkIfAdmin(data.user.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Auto-sign in on load or refresh
  useEffect(() => {
    const autoSignIn = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          setUser(sessionData.session.user);
          setSession(sessionData.session);
          setIsAuthenticated(true);
          
          // Check if user is admin
          await checkIfAdmin(sessionData.session.user.id);
        } else {
          console.log("No authenticated session. Attempting to sign in...");
          
          // Try to sign in with default admin credentials (for development only)
          if (process.env.NODE_ENV === 'development') {
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: 'alan@shakass.com',
                password: 'admin123'
              });
              
              if (error) {
                console.log("Auto-sign in failed:", error);
              } else if (data?.user) {
                setUser(data.user);
                setSession(data.session);
                setIsAuthenticated(true);
                
                // Check if user is admin
                await checkIfAdmin(data.user.id);
              }
            } catch (error) {
              console.error("Error in auto-sign in:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    };
    
    autoSignIn();
    
    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        setUser(newSession.user);
        setSession(newSession);
        setIsAuthenticated(true);
        
        // Check admin status
        checkIfAdmin(newSession.user.id);
      } else {
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    isAuthenticated,
    isAdmin,
    user,
    session,
    login,
    logout,
    checkIfAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

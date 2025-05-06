
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/lib/toast';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ error: null, data: null }),
  logout: async () => {},
  register: async () => ({ error: null, data: null }),
  loginWithSocialMedia: async () => ({ error: null, data: null }),
  checkIfAdmin: async () => {},
  getAllUsers: () => [],
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Helper to convert Supabase user to our app User type
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: supabaseUser.user_metadata?.isAdmin ? 'admin' : 'user',
    registrationDate: supabaseUser.created_at,
    provider: supabaseUser.app_metadata?.provider || 'email'
  };
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Get session from storage and update state if exists
    const fetchSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const convertedUser = convertSupabaseUser(currentSession.user);
        setUser(convertedUser);
        
        // Check for admin role
        await checkIfAdmin(currentSession.user.id);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);

      if (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        const convertedUser = convertSupabaseUser(session.user);
        setUser(convertedUser);
        
        // Check for admin role using setTimeout to avoid deadlock
        setTimeout(() => {
          checkIfAdmin(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is admin
  const checkIfAdmin = async (userId: string) => {
    try {
      // Check user_roles table for admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.error('Error checking admin role:', error);
        // For development purposes, consider specific email as admin
        if (user?.email === 'alan@shakass.com') {
          setIsAdmin(true);
          return;
        }
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error in checkIfAdmin:', error);
      setIsAdmin(false);
    }
  };

  // Sign in handler
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(`Erreur de connexion: ${error.message}`);
        return { error, data: null };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erreur lors de la connexion');
      return { error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out handler
  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up handler
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin: false
          }
        }
      });
      
      if (error) {
        toast.error(`Erreur d'inscription: ${error.message}`);
        return { error, data: null };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erreur lors de l\'inscription');
      return { error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  // Social media login
  const loginWithSocialMedia = async (provider: 'facebook' | 'google') => {
    try {
      // In production, use the real Supabase OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) {
        toast.error(`Erreur de connexion ${provider}: ${error.message}`);
        return { error, data: null };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Erreur de connexion ${provider}`);
      return { error, data: null };
    }
  };

  // Get all users (admin function)
  const getAllUsers = () => {
    // Placeholder - in a real app, this would fetch from Supabase
    return [];
  };

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    signIn: login,
    login,
    logout,
    signOut: logout,
    signUp: register,
    register,
    loginWithSocialMedia,
    checkIfAdmin,
    getAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

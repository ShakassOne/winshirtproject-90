
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client"; // Fixed import

// Authentication state
let currentUser: User | null = null;
let currentSession: Session | null = null;

// Store authentication state to localStorage for persistence
export const storeAuthLocally = (user: User | null, session: Session | null) => {
  try {
    if (user && session) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
    }
  } catch (e) {
    console.error("Error storing auth locally:", e);
  }
};

// Get stored authentication from localStorage
export const getStoredAuth = (): { user: User | null, session: Session | null } => {
  try {
    const userStr = localStorage.getItem('auth_user');
    const sessionStr = localStorage.getItem('auth_session');
    
    const user = userStr ? JSON.parse(userStr) : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    
    return { user, session };
  } catch (e) {
    console.error("Error retrieving stored auth:", e);
    return { user: null, session: null };
  }
};

// User login with email and password
export const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(`Échec de connexion: ${error.message}`);
      return false;
    }
    
    if (data.user && data.session) {
      currentUser = data.user;
      currentSession = data.session;
      storeAuthLocally(data.user, data.session);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error("Error during login:", e);
    toast.error(`Erreur de connexion: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
    return false;
  }
};

// User signup with email and password
export const signupWithEmail = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      toast.error(`Échec d'inscription: ${error.message}`);
      return false;
    }
    
    if (data.user && data.session) {
      currentUser = data.user;
      currentSession = data.session;
      storeAuthLocally(data.user, data.session);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error("Error during signup:", e);
    toast.error(`Erreur d'inscription: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
    return false;
  }
};

// User logout
export const logout = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(`Échec de déconnexion: ${error.message}`);
      return false;
    }
    
    currentUser = null;
    currentSession = null;
    storeAuthLocally(null, null);
    return true;
  } catch (e) {
    console.error("Error during logout:", e);
    toast.error(`Erreur de déconnexion: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const { user } = getStoredAuth();
  currentUser = user;
  return user;
};

// Get current session
export const getCurrentSession = (): Session | null => {
  if (currentSession) return currentSession;
  
  const { session } = getStoredAuth();
  currentSession = session;
  return session;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getCurrentSession();
  return session !== null && new Date(session.expires_at * 1000) > new Date();
};

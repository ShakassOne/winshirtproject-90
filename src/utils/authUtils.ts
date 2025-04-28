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

// Convert Supabase user to our app's User type
export const convertSupabaseUser = (supabaseUser: User): any => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: supabaseUser.user_metadata?.role || 'user',
    registrationDate: supabaseUser.created_at,
    provider: supabaseUser.app_metadata?.provider || 'email'
  };
};

// Generate simulated social media user
export const generateSimulatedSocialUser = (provider: 'facebook' | 'google', randomId: number): any => {
  const isDemoProvider = provider === 'facebook' ? 'facebook' : 'google';
  const userName = isDemoProvider === 'facebook' ? `facebook_user_${randomId}` : `google_user_${randomId}`;
  const email = `${userName}@example.com`;
  
  return {
    name: userName.replace('_', ' '),
    email: email,
    socialMediaDetails: {
      providerId: `${isDemoProvider}_${randomId}`,
      provider: isDemoProvider
    }
  };
};

// Simulate sending email
export const simulateSendEmail = (email: string, subject: string, body: string): boolean => {
  console.log(`Simulated email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  return true;
};

// Load users from storage
export const loadUsersFromStorage = (): any[] => {
  try {
    const usersStr = localStorage.getItem('winshirt_users');
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (error) {
    console.error("Error loading users from storage:", error);
    return [];
  }
};

// Save users to storage
export const saveUsersToStorage = (users: any[]): void => {
  try {
    localStorage.setItem('winshirt_users', JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to storage:", error);
  }
};

// Initialize users if needed
export const initializeUsers = (): void => {
  try {
    const usersStr = localStorage.getItem('winshirt_users');
    if (!usersStr) {
      // Initialize with an empty array
      localStorage.setItem('winshirt_users', JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error initializing users:", error);
  }
};

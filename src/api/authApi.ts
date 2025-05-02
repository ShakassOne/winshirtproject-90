
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Register a new user
export const registerUser = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          isAdmin: false // New users are not admins by default
        }
      }
    });
    
    if (error) throw error;
    
    // Store user in localStorage for backward compatibility
    if (data?.user) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: fullName,
        isAdmin: false
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error registering user:', error);
    toast.error("Erreur lors de l'inscription");
    return { success: false, error };
  }
};

// Login a user
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Store user in localStorage for backward compatibility
    if (data?.user) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.full_name || data.user.email.split('@')[0],
        isAdmin: data.user.user_metadata.isAdmin || false
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error logging in:', error);
    toast.error("Erreur lors de la connexion");
    return { success: false, error };
  }
};

// Logout a user
export const logoutUser = async () => {
  try {
    // Remove user from localStorage first
    localStorage.removeItem('user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    toast.error("Erreur lors de la déconnexion");
    return { success: false, error };
  }
};

// Get the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error };
  }
};

// Check if a user is admin
export const isUserAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data?.user?.user_metadata?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

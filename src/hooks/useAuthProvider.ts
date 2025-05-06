
// Updating the useAuthProvider.ts to fix type issues

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  role: string;
}

interface AuthState {
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuthProvider = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    user: null,
    error: null,
    isAuthenticated: false,
    isAdmin: false
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          const user = sessionData.session.user;
          
          // Get user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          let userProfile: UserProfile;
            
          if (profileError || !profileData) {
            // If no profile exists, create one
            userProfile = {
              id: user.id,
              created_at: user.created_at || new Date().toISOString(),
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
              phone: user.phone || null,
              address: null,
              role: 'user'
            };
            
            // Insert new profile
            await supabase.from('profiles').insert([userProfile]);
          } else {
            userProfile = profileData;
          }
          
          // Check if user is admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();
            
          const isAdmin = !!roleData;
          
          setAuthState({
            isLoading: false,
            user: userProfile,
            error: null,
            isAuthenticated: true,
            isAdmin
          });
        } else {
          setAuthState({
            isLoading: false,
            user: null,
            error: null,
            isAuthenticated: false,
            isAdmin: false
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          isLoading: false,
          user: null,
          error: error instanceof Error ? error.message : 'Authentication check failed',
          isAuthenticated: false,
          isAdmin: false
        });
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        
        // Get or create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        let userProfile: UserProfile;
          
        if (profileError || !profileData) {
          // Create new profile
          userProfile = {
            id: user.id,
            created_at: user.created_at || new Date().toISOString(),
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            phone: user.phone || null,
            address: null,
            role: 'user'
          };
          
          await supabase.from('profiles').insert([userProfile]);
        } else {
          userProfile = profileData;
        }
        
        // Check admin status
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
          
        const isAdmin = !!roleData;
        
        setAuthState({
          isLoading: false,
          user: userProfile,
          error: null,
          isAuthenticated: true,
          isAdmin
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isLoading: false,
          user: null,
          error: null,
          isAuthenticated: false,
          isAdmin: false
        });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const signUp = async (email: string, password: string, name: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile for new user
        const userProfile = {
          id: data.user.id,
          created_at: data.user.created_at,
          email: email,
          name: name,
          phone: null,
          address: null,
          role: 'user'
        };
        
        await supabase.from('profiles').insert([userProfile]);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }));
      return { success: false, error };
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      return { success: false, error };
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }
  };
  
  const verifyAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (error) throw error;
      
      return { isAdmin: data && data.length > 0 };
    } catch (error) {
      console.error('Verify admin error:', error);
      return { isAdmin: false, error };
    }
  };
  
  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    verifyAdmin
  };
};

export default useAuthProvider;

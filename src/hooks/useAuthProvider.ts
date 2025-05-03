
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { EmailService } from '@/lib/emailService';
import { supabase } from '@/lib/supabase';  // Now correctly imported from our utility file
import { User } from '@/types/auth';
import { 
  convertSupabaseUser, 
  generateSimulatedSocialUser, 
  loadUsersFromStorage, 
  saveUsersToStorage, 
  initializeUsers 
} from '@/utils/authUtils';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage on startup and check Supabase
    const storedUser = localStorage.getItem('winshirt_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    }
    
    // Check Supabase session state
    const checkSupabaseSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur lors de la récupération de la session Supabase:", error);
        return;
      }
      
      if (data.session && data.session.user) {
        const newUser = convertSupabaseUser(data.session.user);
        setUser(newUser);
        localStorage.setItem('winshirt_user', JSON.stringify(newUser));
      }
    };
    
    // Check Supabase session
    checkSupabaseSession();
    
    // Initialize users if this entry doesn't exist
    initializeUsers();
    
    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const newUser = convertSupabaseUser(session.user);
          setUser(newUser);
          localStorage.setItem('winshirt_user', JSON.stringify(newUser));
          toast.success("Connexion réussie!");
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('winshirt_user');
          toast.info("Vous avez été déconnecté");
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getAllUsers = (): User[] => {
    return loadUsersFromStorage();
  };

  const login = async (email: string, password: string) => {
    try {
      // Try login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If Supabase fails, try simulation mode
        console.error("Erreur de connexion Supabase:", error);
        
        // Simulation for admin@winshirt.fr
        if (email === 'admin@winshirt.fr' && password === 'admin123') {
          const adminUser: User = {
            id: 1,
            name: 'Admin',
            email: 'admin@winshirt.fr',
            role: 'admin',
            registrationDate: new Date().toISOString(),
            provider: 'email'
          };
          setUser(adminUser);
          localStorage.setItem('winshirt_user', JSON.stringify(adminUser));
          toast.success("Connexion réussie en tant qu'administrateur! (Mode simulation)");
          return;
        }
        
        // Get registered users in simulation mode
        const users = loadUsersFromStorage();
        const foundUser = users.find(u => u.email === email);
            
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('winshirt_user', JSON.stringify(foundUser));
          toast.success("Connexion réussie! (Mode simulation)");
          return;
        }
        
        toast.error("Email ou mot de passe incorrect");
        return;
      }
      
      // Successful Supabase login
      toast.success("Connexion réussie!");
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  const loginWithSocialMedia = async (provider: 'facebook' | 'google') => {
    try {
      toast.info(`Connexion avec ${provider} en cours...`);

      // Tentative de connexion avec simulation immédiate pour éviter l'attente
      // si Supabase n'est pas configuré
      const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
      
      // Essai de connexion avec Supabase avec un timeout court
      const loginPromise = supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/account'
        }
      });
      
      // Définir un timeout pour abandonner après 2 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Délai d'attente dépassé")), 2000);
      });
      
      // Race entre la connexion et le timeout
      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise.then(() => ({ data: null, error: new Error("Délai d'attente dépassé") }))
      ]) as any;
      
      if (error) {
        console.error(`Erreur de connexion ${provider}:`, error);
        
        // Mode simulation en cas d'erreur Supabase
        // Génération de données utilisateur simulées
        const randomId = Math.floor(Math.random() * 10000);
        const userData = generateSimulatedSocialUser(provider, randomId);
        
        // Vérification si l'utilisateur existe déjà
        const users = loadUsersFromStorage();
        
        // Vérification par email ou ID de fournisseur
        const existingUserByEmail = users.find(u => u.email === userData.email);
        const existingUserByProviderId = users.find(
          u => u.socialMediaDetails?.providerId === userData.socialMediaDetails?.providerId
        );
        
        const existingUser = existingUserByEmail || existingUserByProviderId;
        
        if (existingUser) {
          // L'utilisateur existe déjà, connectez-le
          // Mise à jour des informations si nécessaire
          const updatedUser = {
            ...existingUser,
            ...userData,
            id: existingUser.id // Conserver l'ID original
          };
          
          // Mise à jour de l'utilisateur dans la liste
          const updatedUsers = users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          
          saveUsersToStorage(updatedUsers);
          
          setUser(updatedUser as User);
          localStorage.setItem('winshirt_user', JSON.stringify(updatedUser));
          toast.success(`Connexion réussie avec ${providerName}! (Mode simulation)`);
          navigate('/account');
          return;
        }
        
        // Création d'un nouvel utilisateur
        const newUser: User = {
          id: users.length + 2, // +2 car l'id 1 est réservé à l'admin
          ...userData as User,
          role: 'user',
          registrationDate: new Date().toISOString(),
          provider: provider
        };
        
        users.push(newUser);
        saveUsersToStorage(users);
        
        // Connexion de l'utilisateur
        setUser(newUser);
        localStorage.setItem('winshirt_user', JSON.stringify(newUser));
        
        // Envoi d'un email de confirmation
        EmailService.sendAccountCreationEmail(newUser.email, newUser.name);
        
        toast.success(`Inscription réussie avec ${providerName}! (Mode simulation)`);
        navigate('/account');
        return;
      }
      
      // Redirection Supabase gérée automatiquement
      if (data?.url) {
        toast.info(`Redirection vers ${provider} pour authentification...`);
      }
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      
      // Basculer automatiquement en mode simulation
      const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
      const randomId = Math.floor(Math.random() * 10000);
      const userData = generateSimulatedSocialUser(provider, randomId);
      
      // Créer un nouvel utilisateur simulé
      const users = loadUsersFromStorage();
      const newUser: User = {
        id: users.length + 2,
        ...userData as User,
        role: 'user',
        registrationDate: new Date().toISOString(),
        provider: provider
      };
      
      users.push(newUser);
      saveUsersToStorage(users);
      
      // Connecter l'utilisateur
      setUser(newUser);
      localStorage.setItem('winshirt_user', JSON.stringify(newUser));
      
      toast.success(`Connexion avec ${providerName} simulée avec succès!`);
      navigate('/account');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Try signup with Supabase
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
        
        // Fall back to simulation if Supabase error
        // Check if user already exists
        const users = loadUsersFromStorage();
        
        if (users.some(u => u.email === email)) {
          toast.error("Un compte existe déjà avec cet email");
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: users.length + 2, // +2 as id 1 is reserved for admin
          name,
          email,
          role: 'user',
          registrationDate: new Date().toISOString(),
          provider: 'email'
        };
        
        users.push(newUser);
        saveUsersToStorage(users);
        
        // Automatically log in the user
        setUser(newUser);
        localStorage.setItem('winshirt_user', JSON.stringify(newUser));
        
        // Send confirmation email
        EmailService.sendAccountCreationEmail(newUser.email, newUser.name);
        
        toast.success("Inscription réussie! (Mode simulation)");
        navigate('/account');
        return;
      }
      
      // Successful Supabase signup, but may require email confirmation
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error("Un compte existe déjà avec cet email");
          return;
        }
        
        toast.success("Inscription réussie!");
        
        // If signup doesn't require confirmation, user is already logged in
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
      // Supabase logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur lors de la déconnexion Supabase:", error);
        // Continue with local logout even in case of Supabase error
      }
      
      // Local logout
      setUser(null);
      localStorage.removeItem('winshirt_user');
      toast.info("Vous avez été déconnecté");
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Force local logout in case of error
      setUser(null);
      localStorage.removeItem('winshirt_user');
      navigate('/');
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginWithSocialMedia,
    register,
    logout,
    getAllUsers
  };
};

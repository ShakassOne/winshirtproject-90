
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabase';

// Simulate sending an email - for compatibility
export const simulateSendEmail = (to: string, subject: string, body: string) => {
  console.log(`[SIMULATION EMAIL] À: ${to}, Sujet: ${subject}`);
  console.log(`[SIMULATION EMAIL] Corps du message: ${body}`);
  
  // Notification in the console to verify functionality
  console.log(`[EMAIL ENVOYÉ] Un email a été envoyé à ${to}`);
  
  return true;
};

// Convert Supabase user to our User type
export const convertSupabaseUser = (supabaseUser: any): User => {
  const userRole = supabaseUser.email === 'admin@winshirt.com' ? 'admin' : 'user';
  
  // Determine provider
  let provider: 'email' | 'facebook' | 'google' = 'email';
  if (supabaseUser.app_metadata?.provider === 'facebook') {
    provider = 'facebook';
  } else if (supabaseUser.app_metadata?.provider === 'google') {
    provider = 'google';
  }
  
  return {
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
};

// Generate simulated user data for social media logins
export const generateSimulatedSocialUser = (provider: 'facebook' | 'google', randomId: number): Partial<User> => {
  if (provider === 'facebook') {
    // Facebook data simulation
    return {
      name: `Jean Dupont`, // Fictive name for demo
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
    // Google data simulation
    return {
      name: `Marie Martin`, // Fictive name for demo
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
};

// Load users from localStorage
export const loadUsersFromStorage = (): User[] => {
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

// Save users to localStorage
export const saveUsersToStorage = (users: User[]): void => {
  localStorage.setItem('winshirt_users', JSON.stringify(users));
};

// Initialize users if needed
export const initializeUsers = (): void => {
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
};

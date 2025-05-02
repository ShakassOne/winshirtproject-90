
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate?: string;
  provider?: 'email' | 'facebook' | 'google';
  profilePicture?: string;
  phoneNumber?: string;
  phone?: string;
  clientId?: number; // Add this field to fix the TypeScript error
  socialMediaDetails?: {
    providerId?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    isVerified?: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => void;
  loginWithSocialMedia: (provider: 'facebook' | 'google') => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  getAllUsers: () => User[];
}

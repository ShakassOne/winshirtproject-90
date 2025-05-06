
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate?: string;
  provider?: 'email' | 'facebook' | 'google';
  profilePicture?: string;
  phoneNumber?: string;
  phone?: string; 
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
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithSocialMedia: (provider: 'facebook' | 'google') => Promise<any>;
  checkIfAdmin: (userId: string) => Promise<void>;
  getAllUsers: () => User[];
}

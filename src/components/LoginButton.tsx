
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from './LoginDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LoginButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const LoginButton: React.FC<LoginButtonProps> = ({ className = "", variant = "default" }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [loginEnabled, setLoginEnabled] = useState(true);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleLogout = () => {
    // Clear admin credentials on logout to force re-authentication
    localStorage.removeItem('winshirt_admin');
    logout();
  };

  const toggleLogin = (checked: boolean) => {
    setLoginEnabled(checked);
    // Sauvegarder la préférence dans localStorage pour la persistance
    localStorage.setItem('loginEnabled', checked.toString());
  };

  // Listen for authentication needs from other components
  useEffect(() => {
    const handleNeedAuthentication = (event: CustomEvent) => {
      if (!isAuthenticated) {
        setIsDialogOpen(true);
      }
    };

    window.addEventListener('needAuthentication', handleNeedAuthentication as EventListener);
    
    return () => {
      window.removeEventListener('needAuthentication', handleNeedAuthentication as EventListener);
    };
  }, [isAuthenticated]);

  // Récupérer la préférence au chargement du composant
  React.useEffect(() => {
    const savedPref = localStorage.getItem('loginEnabled');
    if (savedPref !== null) {
      setLoginEnabled(savedPref === 'true');
    }
  }, []);

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Button 
          variant={variant} 
          className={`flex items-center gap-2 ${className}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
        
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="login-toggle" 
              checked={loginEnabled} 
              onCheckedChange={toggleLogin}
            />
            <Label htmlFor="login-toggle" className="text-white text-xs">
              {loginEnabled ? 'Login activé' : 'Login désactivé'}
            </Label>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Button 
        variant={variant} 
        className={`flex items-center gap-2 ${className}`}
        onClick={handleOpenDialog}
      >
        <User className="h-4 w-4" />
        <span>Connexion</span>
      </Button>
      
      <LoginDialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
    </>
  );
};

export default LoginButton;

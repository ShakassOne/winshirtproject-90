
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LoginButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ variant = 'default', className }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <Button 
      variant={variant} 
      className={className} 
      onClick={handleClick}
    >
      {isAuthenticated ? 'Mon compte' : 'Connexion'}
    </Button>
  );
};

export default LoginButton;


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Si déjà authentifié, rediriger vers la page d'accueil ou la page précédente
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // La redirection se fait dans le useEffect ci-dessus
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-winshirt-space/60 backdrop-blur-lg p-8 rounded-lg border border-winshirt-purple/30">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Accédez à votre compte WinShirt
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-200">Adresse email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="bg-winshirt-space/80 text-white border-winshirt-purple/50 focus:border-winshirt-purple"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-winshirt-space/80 text-white border-winshirt-purple/50 focus:border-winshirt-purple"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-gray-300">
              Administrateur de démo: admin@winshirt.fr / Chacha2@25!!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

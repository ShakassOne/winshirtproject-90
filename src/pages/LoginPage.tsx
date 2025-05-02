
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LoginPage: React.FC = () => {
  // États pour l'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour l'inscription
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Direct Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName,
            name: registerName,
            isAdmin: false // New users are not admins by default
          }
        }
      });
      
      if (error) {
        console.error('Erreur d\'inscription Supabase:', error);
        toast.error(`Erreur d'inscription: ${error.message}`);
        return;
      }
      
      if (data.user) {
        toast.success("Inscription réussie !");
        
        // If email confirmation is required
        if (!data.session) {
          toast.info("Veuillez vérifier votre email pour confirmer votre compte");
        } else {
          // Si pas besoin de confirmation, connecter automatiquement
          await login(registerEmail, registerPassword);
          // La redirection se fait dans le useEffect ci-dessus
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/account'
        }
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-winshirt-space/60 backdrop-blur-lg p-8 rounded-lg border border-winshirt-purple/30">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Bienvenue sur WinShirt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Connectez-vous ou créez un compte pour participer aux loteries
          </p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-winshirt-space-light border border-winshirt-purple/20">
            <TabsTrigger value="login" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
              Inscription
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <div className="space-y-4">
              {/* Social Media Login Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  onClick={() => handleSocialLogin('google')}
                  variant="outline"
                  className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                  </svg>
                  Google
                </Button>
                <Button 
                  onClick={() => handleSocialLogin('facebook')}
                  variant="outline"
                  className="bg-[#1877F2] text-white hover:bg-[#166FE5] flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-winshirt-space-light px-2 text-gray-400">Ou par email</span>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@winshirt.fr"
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </div>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <div className="space-y-4">
              {/* Social Media Register Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  onClick={() => handleSocialLogin('google')}
                  variant="outline"
                  className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                  </svg>
                  Google
                </Button>
                <Button 
                  onClick={() => handleSocialLogin('facebook')}
                  variant="outline"
                  className="bg-[#1877F2] text-white hover:bg-[#166FE5] flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-winshirt-space-light px-2 text-gray-400">Ou par email</span>
                </div>
              </div>
            
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="********"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-winshirt-space-light text-white border-winshirt-purple/50 focus:border-winshirt-purple"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;

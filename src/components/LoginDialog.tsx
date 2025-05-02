import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Facebook, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithSocialMedia } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailConfirmNeeded, setEmailConfirmNeeded] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmailConfirmNeeded(false);
      setResendCooldown(false);
    }
  }, [isOpen]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Special case for admin user - always allow login regardless of email confirmation
      if (loginEmail === 'admin@winshirt.com' && loginPassword === 'admin123') {
        const adminUser = {
          id: 1,
          name: "Administrateur",
          email: loginEmail,
          role: 'admin',
          registrationDate: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success("Connecté en tant qu'administrateur");
        onClose();
        navigate('/account');
        setIsLoading(false);
        return;
      }
      
      // Try to sign in with Supabase first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      
      if (supabaseError) {
        console.log('Supabase login error:', supabaseError);
        
        // Handle "Email not confirmed" error specially
        if (supabaseError.message.includes("Email not confirmed")) {
          setEmailConfirmNeeded(true);
          toast.warning("Email non confirmé. Veuillez vérifier votre boîte mail ou cliquer sur «Renvoyer l'email»");
          
          // Don't attempt fallback login in this case
          setIsLoading(false);
          return;
        }
        
        // Fall back to local auth mechanism
        await login(loginEmail, loginPassword);
        onClose();
      } else {
        // Success with Supabase!
        await login(loginEmail, loginPassword);
        toast.success("Connexion réussie !");
        onClose();
        navigate('/account');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendConfirmationEmail = async () => {
    if (resendCooldown) {
      toast.info("Un email a déjà été envoyé. Veuillez patienter avant d'en demander un nouveau.");
      return;
    }
    
    setResendCooldown(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: loginEmail
      });
      
      if (error) {
        console.error("Error resending confirmation:", error);
        if (error.message.includes("rate limit")) {
          toast.warning("Veuillez patienter avant de demander un nouvel email (limite atteinte)");
        } else {
          toast.error(`Erreur lors de l'envoi: ${error.message}`);
        }
      } else {
        toast.success("Email de confirmation envoyé !");
      }
      
      // Set a cooldown to prevent spamming
      setTimeout(() => setResendCooldown(false), 60000); // 1 minute cooldown
    } catch (e) {
      console.error("Error sending confirmation:", e);
      toast.error("Erreur lors de l'envoi de l'email");
      setResendCooldown(false);
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
      // Try to register with Supabase first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName,
            isAdmin: false // New users are not admins by default
          }
        }
      });
      
      if (supabaseData?.user) {
        // Successful signup
        toast.success("Inscription réussie !");
        
        // If email confirmation is required
        if (!supabaseData.session) {
          toast.info("Veuillez vérifier votre email pour confirmer votre compte");
          onClose();
        } else {
          // If email confirmation is not required, user is logged in
          await register(registerName, registerEmail, registerPassword);
          onClose();
          navigate('/account');
        }
        return;
      }
      
      if (supabaseError) {
        console.log('Supabase registration failed, falling back to local auth:', supabaseError.message);
        
        // Check for existing email error
        if (supabaseError.message.includes('email already')) {
          toast.error("Cette adresse email est déjà utilisée");
          setIsLoading(false);
          return;
        }
        
        // Fall back to local auth mechanism if Supabase fails
        await register(registerName, registerEmail, registerPassword);
        onClose();
        navigate('/account');
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    try {
      await loginWithSocialMedia(provider);
      onClose();
    } catch (error) {
      console.error(`${provider} login error:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="winshirt-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl text-center">
            Bienvenue sur WinShirt
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Connectez-vous ou créez un compte pour participer aux loteries
          </DialogDescription>
        </DialogHeader>

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
              {emailConfirmNeeded && (
                <div className="mb-4 p-3 bg-amber-900/30 border border-amber-500/50 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-200">
                    <p className="font-medium">Email non confirmé</p>
                    <p>Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.</p>
                    <Button 
                      variant="link" 
                      className="text-amber-400 p-0 h-auto mt-1"
                      onClick={resendConfirmationEmail}
                      disabled={resendCooldown}
                    >
                      {resendCooldown ? "Email envoyé, vérifiez votre boîte" : "Renvoyer l'email de confirmation"}
                    </Button>
                  </div>
                </div>
              )}
              
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
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                  />
                </div>
                <div className="text-sm text-amber-400 mt-2">
                  <p>Pour tester en tant qu'admin:</p>
                  <p>Email: admin@winshirt.com</p>
                  <p>Mot de passe: admin123</p>
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
                    className="bg-winshirt-space-light border-winshirt-purple/30"
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
                    className="bg-winshirt-space-light border-winshirt-purple/30"
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
                    className="bg-winshirt-space-light border-winshirt-purple/30"
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
                    className="bg-winshirt-space-light border-winshirt-purple/30"
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full mt-2">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;

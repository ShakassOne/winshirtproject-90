
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import StarBackground from '@/components/StarBackground';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  // Si déjà connecté, rediriger vers la page du compte
  if (isAuthenticated) {
    navigate('/account');
  }
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    login(loginEmail, loginPassword);
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    register(registerName, registerEmail, registerPassword);
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="winshirt-card">
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
                <CardHeader>
                  <CardTitle className="text-white text-center">Connectez-vous</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Entrez vos identifiants pour accéder à votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
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
                      <div className="flex justify-between">
                        <Label htmlFor="password" className="text-white">Mot de passe</Label>
                        <Link to="/forgot-password" className="text-sm text-winshirt-blue-light hover:underline">
                          Mot de passe oublié?
                        </Link>
                      </div>
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
                    <Button type="submit" className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      Se connecter
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle className="text-white text-center">Créez un compte</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Rejoignez WinShirt pour participer aux loteries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
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
                    <Button type="submit" className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      S'inscrire
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>
    </>
  );
};

export default LoginPage;

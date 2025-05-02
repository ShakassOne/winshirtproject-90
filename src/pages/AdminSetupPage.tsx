
import React, { useState } from 'react';
import { setupAdminUser } from '@/utils/setupAdmin';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

const AdminSetupPage: React.FC = () => {
  const [email, setEmail] = useState('admin@winshirt.fr');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetupAdmin = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setupAdminUser(email);
      
      if (result.success) {
        toast.success(result.message);
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(result.message);
        if (result.error) {
          console.error(result.error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la configuration admin:', error);
      toast.error(`Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-winshirt-space flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border border-winshirt-purple/30 bg-winshirt-space-dark/70 backdrop-blur-lg text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configuration Admin</CardTitle>
          <CardDescription className="text-gray-300">
            Configurez le premier utilisateur administrateur pour WinShirt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email de l'administrateur</label>
              <Input
                id="email"
                placeholder="admin@winshirt.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
              />
            </div>
            
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-md p-4 text-amber-200 text-sm">
              <p className="font-medium">Important:</p>
              <p>Cette page vous permet de configurer le premier utilisateur administrateur. Cet utilisateur aura tous les droits sur l'application.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSetupAdmin} 
            disabled={isLoading}
            className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Configuration en cours...
              </>
            ) : (
              "Configurer l'administrateur"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSetupPage;


import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

interface ConstructionModeProps {
  enabled: boolean;
}

const DEFAULT_ADMIN_EMAIL = 'admin@winshirt.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

const ConstructionMode: React.FC<ConstructionModeProps> = ({ enabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuth();

  // Check if we need to show the modal
  useEffect(() => {
    if (enabled && !isAuthenticated) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [enabled, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      await login(email, password);
      // The auth context will update isAuthenticated which will close the dialog
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if authenticated or disabled
      if (!enabled || isAuthenticated) {
        setIsOpen(open);
      }
    }}>
      <DialogContent className="winshirt-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-winshirt-purple text-xl text-center">
            <Lock className="h-5 w-5" /> 
            Site en mode construction
          </DialogTitle>
          <DialogDescription className="text-center">
            Ce site est actuellement en développement. Veuillez vous connecter pour y accéder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-winshirt-space-light border-winshirt-purple/30"
            />
          </div>
          
          <div className="flex items-center p-3 bg-winshirt-space/60 border border-amber-500/30 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-400 mr-2" />
            <div className="text-xs text-amber-400">
              <p>Pour tester en tant qu'admin:</p>
              <p>Email: {DEFAULT_ADMIN_EMAIL}</p>
              <p>Mot de passe: {DEFAULT_ADMIN_PASSWORD}</p>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
            Se connecter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConstructionMode;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createAdminUserWithSignup } from '@/scripts/createAdminUser';
import { toast } from '@/lib/toast';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateAdminUser = async () => {
    setIsCreating(true);
    try {
      const result = await createAdminUserWithSignup();
      
      if (result.success) {
        toast.success("L'utilisateur admin a été créé avec succès dans Supabase");
        
        // Store admin credentials for synchronization
        localStorage.setItem('winshirt_admin', JSON.stringify({
          email: 'admin@winshirt.com',
          password: 'admin123'
        }));
        
        toast.success("Identifiants admin stockés pour la synchronisation");
      } else {
        if (result.error?.message?.includes('email already')) {
          toast.info("L'utilisateur admin existe déjà. Connectez-vous avec admin@winshirt.com/admin123");
        } else {
          toast.error(`Erreur lors de la création: ${result.error?.message || 'Erreur inconnue'}`);
        }
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast.error("Erreur lors de la création de l'utilisateur admin");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuration Admin Supabase</CardTitle>
        <CardDescription>
          Créez un utilisateur admin pour activer la synchronisation avec Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">
          Cette opération va créer un utilisateur admin dans Supabase avec les identifiants suivants:
        </p>
        <ul className="list-disc pl-6 mb-4 text-sm">
          <li>Email: admin@winshirt.com</li>
          <li>Mot de passe: admin123</li>
        </ul>
        <p className="mb-4 text-amber-400 text-xs">
          Note: Si l'utilisateur existe déjà, vous pouvez simplement vous connecter avec ces identifiants.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateAdminUser} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Création en cours...' : 'Créer utilisateur admin'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminSetup;

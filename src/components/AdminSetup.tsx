
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createAdminUserWithSignup } from '@/scripts/createAdminUser';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Check, Loader2 } from 'lucide-react';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  
  const handleCreateAdminUser = async () => {
    setIsCreating(true);
    try {
      const result = await createAdminUserWithSignup();
      
      if (result.success) {
        toast.success("L'utilisateur admin a été créé avec succès dans Supabase");
        setCreated(true);
        
        // Store admin credentials for synchronization
        localStorage.setItem('winshirt_admin', JSON.stringify({
          email: 'alan@shakass.com',
          password: 'admin123'
        }));
        
        toast.success("Identifiants admin stockés pour la synchronisation");
      } else {
        if (result.error?.message?.includes('email already')) {
          toast.info("L'utilisateur admin existe déjà. Connectez-vous avec alan@shakass.com/admin123");
          setCreated(true);
          
          // Store credentials anyway since the user exists
          localStorage.setItem('winshirt_admin', JSON.stringify({
            email: 'alan@shakass.com',
            password: 'admin123'
          }));
          
          toast.success("Identifiants admin stockés pour la synchronisation");
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
    <Card className="w-full mb-8 border-orange-300 border-2 shadow-md">
      <CardHeader className="bg-orange-50">
        <CardTitle className="flex items-center text-orange-700">
          <InfoIcon className="mr-2 h-5 w-5" /> 
          Configuration Admin Requise
        </CardTitle>
        <CardDescription className="text-orange-600">
          Vous devez créer un utilisateur admin dans Supabase pour activer la synchronisation
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {created ? (
          <Alert className="bg-green-50 border-green-300">
            <Check className="h-4 w-4 text-green-700" />
            <AlertTitle>Utilisateur admin configuré</AlertTitle>
            <AlertDescription>
              L'utilisateur admin a été configuré avec succès. Vous pouvez maintenant utiliser la synchronisation.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="mb-4 text-sm">
              Cette opération va créer un utilisateur admin dans Supabase avec les identifiants suivants:
            </p>
            <ul className="list-disc pl-6 mb-4 text-sm">
              <li>Email: alan@shakass.com</li>
              <li>Mot de passe: admin123</li>
            </ul>
            <p className="mb-4 text-amber-600 text-sm">
              <strong>IMPORTANT:</strong> Cet utilisateur est nécessaire pour la synchronisation avec Supabase.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="bg-orange-50">
        <Button 
          onClick={handleCreateAdminUser} 
          disabled={isCreating || created}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : created ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Utilisateur admin créé
            </>
          ) : (
            'Créer utilisateur admin'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminSetup;

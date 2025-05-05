
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isAuthenticated, isAdmin, login, logout, checkIfAdmin } = useAuth();
  
  const [adminEmail] = useState('alan@shakass.com');
  const [adminPassword] = useState('admin123');

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          console.log("Utilisateur déjà authentifié:", data.user.email);
          // Vérifier si l'utilisateur est admin
          checkIfAdmin(data.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      }
    };
    
    checkAuth();
  }, []);

  const createAdminUser = async () => {
    setIsCreating(true);
    setIsLoading(true);

    try {
      // Tenter de créer l'admin
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: 'Admin User',
            isAdmin: true
          }
        }
      });

      if (error) {
        // Si l'utilisateur existe déjà, on tente de se connecter
        if (error.message.includes('already been registered')) {
          toast.info("L'utilisateur admin existe déjà, tentative de connexion...", { position: "bottom-right" });
          await loginAsAdmin();
          return;
        } else {
          throw error;
        }
      }

      if (data?.user?.id) {
        // Ajouter le rôle admin
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            { 
              user_id: data.user.id, 
              role: 'admin' 
            }
          ]);

        if (roleError) {
          console.error("Erreur lors de l'attribution du rôle admin:", roleError);
          toast.error(`Erreur lors de l'attribution du rôle admin: ${roleError.message}`, { position: "bottom-right" });
        } else {
          toast.success("Utilisateur admin créé et rôle attribué avec succès", { position: "bottom-right" });
          await login(adminEmail, adminPassword);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur admin:", error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsCreating(false);
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setIsSigningIn(true);
    setIsLoading(true);

    try {
      const success = await login(adminEmail, adminPassword);
      if (success) {
        toast.success("Connecté en tant qu'admin avec succès", { position: "bottom-right" });
      } else {
        toast.error("Impossible de se connecter avec les identifiants fournis", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Erreur lors de la connexion admin:", error);
      toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logoutAdmin = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie", { position: "bottom-right" });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
  };

  return (
    <Card className="bg-winshirt-space-light p-6 rounded-lg border border-winshirt-purple/30 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Configuration Administrateur</h2>
      
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className={isAdmin ? "bg-green-500/20 p-3 rounded-md text-white" : "bg-yellow-500/20 p-3 rounded-md text-white"}>
            <p>{isAdmin 
              ? "Vous êtes connecté en tant qu'administrateur" 
              : "Vous êtes connecté mais vous n'avez pas les droits d'administrateur"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={logoutAdmin}
              variant="outline" 
              className="border-winshirt-purple text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se déconnecter
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-500/20 p-3 rounded-md text-white">
            <p>Pour utiliser les fonctionnalités d'administration, connectez-vous ou créez un compte administrateur</p>
            <p className="text-sm mt-2">Identifiants par défaut: {adminEmail} / {adminPassword}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={loginAsAdmin}
              disabled={isLoading}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter en tant qu'admin
            </Button>
            <Button 
              onClick={createAdminUser}
              disabled={isLoading}
              variant="outline" 
              className="border-winshirt-purple text-white"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer un utilisateur admin
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdminSetup;

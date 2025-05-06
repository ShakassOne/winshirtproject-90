
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

const AuthHandler = () => {
  // Cette fonction tente de connecter automatiquement l'utilisateur admin
  useEffect(() => {
    const autoSignIn = async () => {
      try {
        // Vérifier d'abord si l'utilisateur est déjà connecté
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Utilisateur déjà connecté:", session.user.email);
          return;
        }
        
        console.log("No authenticated session. Attempting to sign in...");
        // Si non connecté, essayer de se connecter avec les identifiants par défaut
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'alan@shakass.com',
          password: 'admin123'
        });
        
        if (error) {
          console.error("Auto-sign in failed:", error);
          return;
        }
        
        if (data?.user) {
          console.log("Auto-signed in as:", data.user.email);
          toast.success(`Connecté automatiquement en tant que ${data.user.email}`, {
            position: "bottom-right"
          });
        }
      } catch (err) {
        console.error("Error during auto sign-in:", err);
      }
    };
    
    // Exécuter la tentative de connexion automatique
    autoSignIn();
    
    // Configurer un écouteur pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
      }
    );
    
    // Nettoyage lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return null; // Composant invisible, seulement pour la logique
};

export default AuthHandler;

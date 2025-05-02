
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

/**
 * Vérifier si l'utilisateur actuel a les droits d'administration
 */
export const checkAdminPermission = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Vérifier d'abord les métadonnées de l'utilisateur pour la compatibilité avec les versions antérieures
    if (session.user.user_metadata?.isAdmin === true) {
      return true;
    }
    
    // Vérifier le rôle d'administrateur dans la table user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    return !!roleData;
  } catch (error) {
    console.error('Erreur lors de la vérification des droits d\'administration:', error);
    return false;
  }
};

/**
 * Attribuer des droits d'administration à un utilisateur par son email
 */
export const grantAdminAccess = async (email: string): Promise<boolean> => {
  try {
    // Rechercher l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;
    
    const user = userData?.users?.find(u => u.email === email);
    if (!user) {
      toast.error(`Utilisateur avec l'email ${email} non trouvé`);
      return false;
    }
    
    // Vérifier si l'utilisateur a déjà des droits d'administration
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select()
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (existingRole) {
      toast.info(`${email} est déjà administrateur`);
      return true;
    }
    
    // Attribuer le rôle d'administrateur
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      });
      
    if (roleError) throw roleError;
    
    // Mettre à jour les métadonnées de l'utilisateur pour la compatibilité
    await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, isAdmin: true } }
    );
    
    toast.success(`Droits d'administration accordés à ${email}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'attribution des droits d\'administration:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

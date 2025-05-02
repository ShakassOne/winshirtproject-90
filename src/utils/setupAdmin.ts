
import { supabase } from '@/integrations/supabase/client';

export interface AdminSetupResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Sets up a user as an admin
 * This function should be run once by the site owner to create the first admin
 */
export const setupAdminUser = async (email: string): Promise<AdminSetupResult> => {
  try {
    // First get all users and filter by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error finding users:', userError);
      return {
        success: false,
        message: `Impossible de récupérer les utilisateurs`,
        error: userError.message
      };
    }
    
    const userData = users?.find(user => user.email === email);
    
    if (!userData) {
      return {
        success: false,
        message: `Aucun utilisateur trouvé avec l'email ${email}`,
      };
    }
    
    // Check if user already has an admin role
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select()
      .eq('user_id', userData.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking for existing role:', roleError);
      return {
        success: false,
        message: `Erreur lors de la vérification des rôles`,
        error: roleError.message
      };
    }
    
    if (existingRole) {
      return {
        success: true,
        message: `${email} est déjà administrateur`
      };
    }
    
    // Alternatively, check if user has isAdmin in metadata
    if (userData.user_metadata?.isAdmin === true) {
      // User already has admin metadata, let's ensure they have a role too
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.id,
          role: 'admin'
        });
        
      if (insertError) {
        console.error('Error setting user as admin in roles table:', insertError);
        // Not returning error as the user is already admin in metadata
      }
      
      return {
        success: true,
        message: `${email} a déjà les droits administrateur dans ses métadonnées`
      };
    }
    
    // Insert admin role for user
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.id,
        role: 'admin'
      });
      
    if (insertError) {
      console.error('Error setting user as admin:', insertError);
      return {
        success: false,
        message: `Erreur lors de l'attribution du rôle d'administrateur`,
        error: insertError.message
      };
    }
    
    // Also update user metadata for backward compatibility
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { 
        user_metadata: { 
          ...userData.user_metadata,
          isAdmin: true 
        } 
      }
    );
    
    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      // Not returning as error since the role was already set
    }
    
    return {
      success: true,
      message: `${email} est maintenant administrateur`
    };
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de la configuration de l\'administrateur',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Checks if the current user is an admin
 */
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // First check user metadata for backward compatibility
    if (session.user.user_metadata?.isAdmin === true) {
      return true;
    }
    
    // Check for admin role in user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    return !!roleData;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

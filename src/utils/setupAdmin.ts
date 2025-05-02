
import { supabase } from '@/integrations/supabase/client';
import { createAdminUser } from '@/integrations/supabase/client';

// Define the type for user objects returned from Supabase
interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: Record<string, any>;
  [key: string]: any; // Allow for other properties
}

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
    // Use the createAdminUser function to create or update the admin user
    const result = await createAdminUser(email);
    return result;
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

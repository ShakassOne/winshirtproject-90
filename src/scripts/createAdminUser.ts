
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

/**
 * Creates an admin user in Supabase or verifies that it exists
 * This function is used to ensure we have an admin user for testing and development
 */
export const createAdminUserWithSignup = async () => {
  try {
    // Try to create or login the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'alan@shakass.com',
      password: 'admin123',
      options: {
        data: {
          name: 'Admin User',
          isAdmin: true
        }
      }
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error };
    }
    
    // Add the user to the admin role
    try {
      // The user has been created, now set their role to admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert([
          { 
            user_id: data.user?.id, 
            role: 'admin'
          }
        ])
        .select();
        
      if (roleError) {
        console.error("Error setting admin role:", roleError);
        // Continue anyway as the user might have been created
      } else {
        console.log("Admin role set successfully", roleData);
      }
    } catch (roleError) {
      console.error("Error in role assignment:", roleError);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error in admin user creation:", error);
    return { success: false, error };
  }
};

/**
 * Login the admin user directly
 */
export const loginAsAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'alan@shakass.com',
      password: 'admin123'
    });
    
    if (error) {
      console.error("Admin login error:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error in admin login:", error);
    return { success: false, error };
  }
};

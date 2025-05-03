
import { supabase } from '@/lib/supabase';

/**
 * This script creates an admin user in Supabase
 * Run this function once from a component to create the admin user
 */
export const createAdminUserInSupabase = async () => {
  try {
    // Check if admin user already exists to avoid duplicates
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error("Error searching for admin user:", searchError);
      return { success: false, error: searchError };
    }
    
    // Manually filter users to find admin
    // Add proper type checking to fix the TS error
    const adminUser = existingUsers?.users?.find((user: any) => 
      user.email === 'admin@winshirt.fr'
    );
    
    if (adminUser) {
      console.log("Admin user already exists in Supabase");
      return { success: true, message: "Admin user already exists" };
    }
    
    // Create the admin user with updated email
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@winshirt.fr',
      password: 'admin123',
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: 'Administrateur',
        isAdmin: true
      },
      role: 'authenticated'
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error };
    }
    
    console.log("Admin user created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in admin user creation script:", error);
    return { success: false, error };
  }
};

/**
 * Alternative function that uses the signUp API which is available to client-side code
 * This won't work for an existing user but can be used for initial setup
 */
export const createAdminUserWithSignup = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@winshirt.fr',
      password: 'admin123',
      options: {
        data: {
          full_name: 'Administrateur',
          isAdmin: true
        }
      }
    });
    
    if (error) {
      console.error("Error creating admin user with signup:", error);
      return { success: false, error };
    }
    
    console.log("Admin user created with signup:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in admin user creation with signup:", error);
    return { success: false, error };
  }
};

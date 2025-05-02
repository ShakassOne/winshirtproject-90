import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_URL = "https://uwgclposhhdovfjnazlp.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Z2NscG9zaGhkb3Zmam5hemxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTA4MzEsImV4cCI6MjA2MTA2NjgzMX0.wZBdCERqRHdWQMCZvFSbJBSMoXQHvpK49Jz_m4dx4cc";

// Types pour le débuggeur de tables
export type TablesStatus = 'both' | 'local' | 'supabase' | 'none' | 'error';

export interface TableData {
  localData: boolean;
  supabaseData: boolean;
  status: TablesStatus;
  count: number;
  error?: string;
}

export interface TablesData {
  [tableName: string]: TableData;
}

// Define our known database tables
export type Tables = {
  lotteries: {
    Row: {
      id: number;
      title: string;
      description: string | null;
      value: number;
      target_participants: number;
      current_participants: number;
      status: "active" | "completed" | "relaunched" | "cancelled";
      image: string | null;
      linked_products: number[] | null;
      end_date: string | null;
      draw_date: string | null;
      featured: boolean | null;
      created_at: string | null;
    };
    Insert: {
      id?: number;
      title: string;
      description?: string | null;
      value: number;
      target_participants?: number;
      current_participants?: number;
      status?: "active" | "completed" | "relaunched" | "cancelled";
      image?: string | null;
      linked_products?: number[] | null;
      end_date?: string | null;
      draw_date?: string | null;
      featured?: boolean | null;
      created_at?: string | null;
    };
    Update: {
      id?: number;
      title?: string;
      description?: string | null;
      value?: number;
      target_participants?: number;
      current_participants?: number;
      status?: "active" | "completed" | "relaunched" | "cancelled";
      image?: string | null;
      linked_products?: number[] | null;
      end_date?: string | null;
      draw_date?: string | null;
      featured?: boolean | null;
      created_at?: string | null;
    };
  };
  lottery_participants: {
    Row: {
      id: number;
      lottery_id: number;
      user_id: number;
      name: string | null;
      email: string | null;
      avatar: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: number;
      lottery_id: number;
      user_id: number;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: number;
      lottery_id?: number;
      user_id?: number;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      created_at?: string | null;
    };
  };
  lottery_winners: {
    Row: {
      id: number;
      lottery_id: number;
      user_id: number;
      name: string | null;
      email: string | null;
      avatar: string | null;
      drawn_at: string | null;
    };
    Insert: {
      id?: number;
      lottery_id: number;
      user_id: number;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      drawn_at?: string | null;
    };
    Update: {
      id?: number;
      lottery_id?: number;
      user_id?: number;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      drawn_at?: string | null;
    };
  };
  products: {
    Row: {
      id: number;
      name: string;
      description: string | null;
      price: number;
      image: string | null;
      secondary_image: string | null;
      sizes: string[] | null;
      colors: string[] | null;
      type: string | null;
      product_type: string | null;
      sleeve_type: string | null;
      linked_lotteries: number[] | null;
      popularity: number | null;
      tickets: number | null;
      weight: number | null;
      delivery_price: number | null;
      allow_customization: boolean | null;
      default_visual_id: number | null;
      default_visual_settings: any | null;
      visual_category_id: number | null;
      created_at: string | null;
    };
    Insert: {
      id?: number;
      name: string;
      description?: string | null;
      price: number;
      image?: string | null;
      secondary_image?: string | null;
      sizes?: string[] | null;
      colors?: string[] | null;
      type?: string | null;
      product_type?: string | null;
      sleeve_type?: string | null;
      linked_lotteries?: number[] | null;
      popularity?: number | null;
      tickets?: number | null;
      weight?: number | null;
      delivery_price?: number | null;
      allow_customization?: boolean | null;
      default_visual_id?: number | null;
      default_visual_settings?: any | null;
      visual_category_id?: number | null;
      created_at?: string | null;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string | null;
      price?: number;
      image?: string | null;
      secondary_image?: string | null;
      sizes?: string[] | null;
      colors?: string[] | null;
      type?: string | null;
      product_type?: string | null;
      sleeve_type?: string | null;
      linked_lotteries?: number[] | null;
      popularity?: number | null;
      tickets?: number | null;
      weight?: number | null;
      delivery_price?: number | null;
      allow_customization?: boolean | null;
      default_visual_id?: number | null;
      default_visual_settings?: any | null;
      visual_category_id?: number | null;
      created_at?: string | null;
    };
  };
  orders: {
    Row: {
      id: number;
      user_id: number | null;
      status: string | null;
      total: number;
      shipping_address: any | null;
      shipping_method: string | null;
      shipping_cost: number | null;
      payment_method: string | null;
      payment_status: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: number;
      user_id?: number | null;
      status?: string | null;
      total: number;
      shipping_address?: any | null;
      shipping_method?: string | null;
      shipping_cost?: number | null;
      payment_method?: string | null;
      payment_status?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: number;
      user_id?: number | null;
      status?: string | null;
      total?: number;
      shipping_address?: any | null;
      shipping_method?: string | null;
      shipping_cost?: number | null;
      payment_method?: string | null;
      payment_status?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  order_items: {
    Row: {
      id: number;
      order_id: number;
      product_id: number;
      quantity: number;
      price: number;
      customization: any | null;
      created_at: string | null;
    };
    Insert: {
      id?: number;
      order_id: number;
      product_id: number;
      quantity?: number;
      price: number;
      customization?: any | null;
      created_at?: string | null;
    };
    Update: {
      id?: number;
      order_id?: number;
      product_id?: number;
      quantity?: number;
      price?: number;
      customization?: any | null;
      created_at?: string | null;
    };
  };
  clients: {
    Row: {
      id: number;
      user_id: string | null;
      name: string | null;
      email: string | null;
      phone: string | null;
      address: any | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: number;
      user_id?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: any | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: number;
      user_id?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: any | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  visuals: {
    Row: {
      id: number;
      name: string;
      description: string | null;
      image_url: string;
      category_id: number | null;
      tags: string[] | null;
      created_at: string | null;
    };
    Insert: {
      id?: number;
      name: string;
      description?: string | null;
      image_url: string;
      category_id?: number | null;
      tags?: string[] | null;
      created_at?: string | null;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string | null;
      image_url?: string;
      category_id?: number | null;
      tags?: string[] | null;
      created_at?: string | null;
    };
  };
};

// This adds the necessary type information to the Database type
// so Supabase client knows about our tables
export type CustomDatabase = {
  public: {
    Tables: Tables;
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// Export the requiredTables list
export const requiredTables = [
  'lotteries', 
  'lottery_participants', 
  'lottery_winners', 
  'products',
  'visuals',
  'orders',
  'order_items', 
  'clients'
] as const;

// Define the valid table names type
export type ValidTableName = typeof requiredTables[number];

// Create the Supabase client as a singleton
let supabaseInstance: ReturnType<typeof createClient<CustomDatabase>> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
};

// Export supabase as the default client for backward compatibility
export const supabase = getSupabaseClient();

// Function to check if Supabase connection works
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Nous utilisons une requête plus simple qui a moins de chance d'échouer
    const { data, error } = await supabase
      .from('lotteries')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("Error checking Supabase connection:", error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Error checking Supabase connection:", e);
    return false;
  }
};

// Function to check if all required tables exist
export const checkRequiredTables = async (): Promise<{exists: boolean; missing: readonly string[]}> => {
  const missingTables: string[] = [];
  let allExist = true;
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        missingTables.push(table);
        allExist = false;
      }
    } catch (e) {
      console.error(`Error checking table ${table}:`, e);
      missingTables.push(table);
      allExist = false;
    }
  }
  
  return {
    exists: allExist,
    missing: missingTables as readonly string[]
  };
};

// Function to sync local data to Supabase
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    const localData = localStorage.getItem(tableName);
    if (!localData) return false;
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) return false;
    
    // Use upsert instead of delete+insert
    // This preserves any data created directly in Supabase while updating local changes
    const { error: upsertError } = await supabase
      .from(tableName)
      .upsert(parsedData, {
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records when there's a conflict
      });
    
    if (upsertError) {
      console.error(`Error upserting data to ${tableName}:`, upsertError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error(`Error syncing ${tableName}:`, e);
    return false;
  }
};

// Function to create an admin user with elevated permissions
export const createAdminUser = async (email: string, password: string = "Chacha2@25!!"): Promise<{
  success: boolean;
  message: string;
  error?: string;
  user?: any;
}> => {
  try {
    // First check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error finding users:", userError);
      return {
        success: false,
        message: "Impossible de vérifier les utilisateurs existants",
        error: userError.message
      };
    }
    
    // Type the users array correctly
    const users = userData.users as { id: string, email?: string }[];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      // User exists, we need to update their metadata and role
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { isAdmin: true },
        email: email,
      });
      
      if (updateError) {
        console.error("Error updating user:", updateError);
        return {
          success: false,
          message: "L'utilisateur existe mais impossible de mettre à jour ses droits",
          error: updateError.message
        };
      }
      
      // Add role to user_roles table if it exists
      try {
        await supabase
          .from('user_roles')
          .upsert({
            user_id: existingUser.id,
            role: 'admin'
          });
      } catch (roleError) {
        console.log("Note: user_roles table might not exist yet, ignoring:", roleError);
      }
      
      return {
        success: true,
        message: "L'utilisateur existant a été promu en administrateur",
        user: existingUser
      };
    } else {
      // Create a new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { isAdmin: true }
      });
      
      if (createError) {
        console.error("Error creating admin user:", createError);
        return {
          success: false,
          message: "Impossible de créer l'utilisateur administrateur",
          error: createError.message
        };
      }
      
      // Add role to user_roles table if it exists
      try {
        if (newUser?.user) {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: newUser.user.id,
              role: 'admin'
            });
        }
      } catch (roleError) {
        console.log("Note: user_roles table might not exist yet, ignoring:", roleError);
      }
      
      return {
        success: true,
        message: "L'utilisateur administrateur a été créé avec succès",
        user: newUser?.user
      };
    }
  } catch (error) {
    console.error("Error in createAdminUser:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'administrateur",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

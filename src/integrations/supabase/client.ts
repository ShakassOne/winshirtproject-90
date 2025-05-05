
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = 'https://aquxtqmotbiimahboqlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdXh0cW1vdGJpaW1haGJvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTA1MzcsImV4cCI6MjA2MjAyNjUzN30.znxP9tr78wQPVVFVMj2BLYaVOGHRzde9X0MUnRzeoxY';

// Create a type-safe supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Define the valid table names
export type ValidTableName = keyof Database['public']['Tables'];

// List of required tables for the application to work
export const requiredTables: ValidTableName[] = [
  'lotteries',
  'products',
  'clients',
  'orders',
  'order_items',
  'lottery_participants',
  'lottery_winners',
  'visuals',
  'visual_categories',
  'user_roles'
];

// Helper function to check supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Supabase connection error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection check failed:", err);
    return false;
  }
};

// Helper function to check table existence
export async function checkTableExists(tableName: ValidTableName): Promise<boolean> {
  try {
    // Use the validTableName which has the correct type
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    
    if (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
    
    // If no error, table exists
    return true;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

export default supabase;

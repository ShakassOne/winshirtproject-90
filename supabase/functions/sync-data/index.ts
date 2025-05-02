
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const { table, data, operation } = await req.json();
    
    // Create Supabase admin client with service role key (needed to bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Please check environment variables.');
    }
    
    // Validate table name to prevent SQL injection
    const validTables = [
      'products', 
      'lotteries', 
      'visuals', 
      'visual_categories', 
      'orders', 
      'order_items', 
      'clients', 
      'lottery_participants',
      'lottery_winners',
      'user_roles'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
    
    let result;
    
    if (operation === 'push') {
      // Convert camelCase keys to snake_case for Supabase
      const snakeCaseData = data.map((item: any) => {
        const newItem: { [key: string]: any } = {};
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            // Convert key to snake_case
            const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            newItem[snakeCaseKey] = item[key];
          }
        }
        return newItem;
      });

      // Upsert data to Supabase
      const { data: insertedData, error } = await supabase
        .from(table)
        .upsert(snakeCaseData, { onConflict: 'id' })
        .select();
        
      if (error) throw error;
      result = { success: true, operation: 'push', table, count: insertedData?.length || 0 };
      
    } else if (operation === 'pull') {
      // Fetch data from Supabase
      const { data: fetchedData, error } = await supabase
        .from(table)
        .select('*');
        
      if (error) throw error;
      
      // Convert snake_case keys to camelCase for localStorage
      const camelCaseData = fetchedData ? fetchedData.map(item => {
        const newItem: { [key: string]: any } = {};
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            // Convert key to camelCase
            const camelCaseKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
            newItem[camelCaseKey] = item[key];
          }
        }
        return newItem;
      }) : [];
      
      result = { 
        success: true, 
        operation: 'pull', 
        table, 
        count: fetchedData?.length || 0,
        data: camelCaseData 
      };
    } else {
      throw new Error(`Invalid operation: ${operation}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in sync-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || String(error),
        message: 'Failed to sync data with Supabase'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});

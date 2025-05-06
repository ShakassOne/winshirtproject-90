
// Follow this setup guide to integrate the Deno runtime into your Supabase functions:
// https://supabase.com/docs/guides/functions/deno-runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface LotteryInput {
  title: string;
  description?: string;
  image?: string;
  value: number;
  status: string;
  featured?: boolean;
  target_participants: number;
  current_participants?: number;
  draw_date?: string | null;
  end_date?: string | null;
  linked_products?: number[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Extract the API key from the Authorization header
    const apiKey = authHeader.replace('Bearer ', '');
    
    // Get the Supabase URL from the environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        global: { headers: { Authorization: `Bearer ${apiKey}` } },
        auth: {
          persistSession: false,
        },
      }
    );

    const { payload } = await req.json() as { payload: LotteryInput };
    
    // Validate the payload
    if (!payload.title || payload.value === undefined) {
      throw new Error('Title and value are required');
    }
    
    // Insert the lottery using the service role client
    const { data, error } = await supabase
      .from('lotteries')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ lottery: data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  try {
    // Récupérer les données envoyées dans le corps de la requête
    const { row_id, num_increment, field_name, table_name } = await req.json();
    
    // Vérifier les paramètres requis
    if (!row_id || num_increment === undefined || !field_name || !table_name) {
      return new Response(
        JSON.stringify({ 
          error: 'Paramètres manquants: row_id, num_increment, field_name et table_name sont requis' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Construire la requête SQL pour incrémenter la valeur du champ
    const query = `
      UPDATE ${table_name}
      SET ${field_name} = ${field_name} + ${num_increment}
      WHERE id = ${row_id}
      RETURNING ${field_name}
    `;
    
    // Exécuter la requête
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

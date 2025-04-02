
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// On peut utiliser SendGrid, Mailgun, ou Amazon SES
// Pour cet exemple, nous utilisons SendGrid
import * as SendGrid from "https://esm.sh/@sendgrid/mail"

// Récupérer les clés API depuis les variables d'environnement de Supabase
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@winshirt.com";

serve(async (req) => {
  // Gestion des requêtes CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Vérifier que la méthode est POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // Vérifier l'API Key
    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // Récupérer les données de la requête
    const { to, subject, body, html } = await req.json();

    // Vérifier que les champs requis sont présents
    if (!to || !subject || (!body && !html)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // Configurer SendGrid
    const sgMail = SendGrid.default;
    sgMail.setApiKey(SENDGRID_API_KEY);
    
    // Préparer l'email
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text: body || "",
      html: html || (body ? body.replace(/\n/g, "<br>") : "")
    };
    
    // Envoyer l'email
    await sgMail.send(msg);
    
    // Répondre avec succès
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );
  } catch (error) {
    // Gérer les erreurs
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );
  }
});


// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// Configuration email SMTP
const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465"); // 465 pour IONOS avec SSL/TLS
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "admin@winshirt.fr";

// Simple email validation function
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

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

    // Vérifier la configuration SMTP
    if (!SMTP_HOSTNAME || !SMTP_USERNAME || !SMTP_PASSWORD) {
      console.error("SMTP configuration is missing");
      return new Response(
        JSON.stringify({ error: "Email service not configured properly. Please set up SMTP credentials." }),
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
    const requestData = await req.json();
    const { to, subject, body, html } = requestData;

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

    // Valider l'email du destinataire
    if (!isValidEmail(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    console.log(`Tentative d'envoi d'email à ${to} via ${SMTP_HOSTNAME}:${SMTP_PORT}`);
    
    try {
      // Configurer le client SMTP avec denomailer
      const client = new SMTPClient({
        connection: {
          hostname: SMTP_HOSTNAME,
          port: SMTP_PORT,
          tls: true,
          auth: {
            username: SMTP_USERNAME,
            password: SMTP_PASSWORD,
          },
        },
        debug: true, // Add debug mode for more detailed logs
      });

      // Préparer l'email
      const content = html || body;
      const isHtml = Boolean(html);
      
      // Log content type before sending
      console.log(`Sending email with content type: ${isHtml ? 'HTML' : 'TEXT'}`);
      if (isHtml) {
        console.log(`HTML content length: ${content.length}`);
      }
      
      await client.send({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        content: isHtml ? undefined : content,
        html: isHtml ? content : undefined,
      });
      
      await client.close();
      
      console.log(`Email envoyé avec succès à ${to}`);
      
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
    } catch (emailError: any) {
      console.error("Error sending email via SMTP:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email via SMTP", details: emailError.message }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }
  } catch (error: any) {
    // Gérer les erreurs
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process email request", 
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


// This is an edge function to send emails via SMTP configuration

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import * as smtpClient from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.ionos.fr',
      port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
      username: Deno.env.get('SMTP_USERNAME') || '',
      password: Deno.env.get('SMTP_PASSWORD') || '',
    };

    const { to, subject, html, text, type = 'html' } = await req.json();
    const from = Deno.env.get('FROM_EMAIL') || 'no-reply@winshirt.fr';

    if (!to || !subject || !(html || text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and html or text' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Tentative d'envoi d'email à ${to} via ${emailConfig.hostname}:${emailConfig.port}`);

    const client = new smtpClient.SmtpClient();
    await client.connectTLS({
      hostname: emailConfig.hostname,
      port: emailConfig.port,
      username: emailConfig.username,
      password: emailConfig.password,
    });

    const contentType = type.toLowerCase() === 'html' ? 'html' : 'text';
    const content = contentType === 'html' ? html : text;
    
    console.log(`Sending email with content type: ${contentType.toUpperCase()}`);
    console.log(`${contentType.toUpperCase()} content length: ${content.length}`);

    // Création d'un mail complexe avec à la fois text et html si les deux sont fournis
    const email = {
      from: from,
      to: to,
      subject: subject,
      content: content,
      html: html || undefined,
      text: text || (html ? 'Votre client de messagerie ne supporte pas HTML' : undefined),
    };

    await client.send(email);
    await client.close();

    console.log(`Email envoyé avec succès à ${to}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email envoyé avec succès à ${to}` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur lors de l\'envoi de l\'email: ${error.message || error}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

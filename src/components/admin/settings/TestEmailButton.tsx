
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, InfoIcon, AlertTriangle, Database } from 'lucide-react';
import { toast } from '@/lib/toast';
import { EmailService } from '@/lib/emailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface TestEmailButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const TestEmailButton: React.FC<TestEmailButtonProps> = ({ 
  variant = "outline", 
  size = "default",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!supabaseUrl && !!supabaseAnonKey;
  });

  const handleClick = async () => {
    // Récupérer les emails de notification
    const emails = getNotificationEmails();
    
    if (emails.length === 0) {
      toast.error("Aucune adresse email configurée pour recevoir les notifications");
      toast.info("Ajoutez des emails dans la section Notifications");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Utiliser EmailService pour envoyer l'email de test
      const success = await EmailService.sendTestEmail(
        emails,
        "✉️ Test de fonctionnalité d'emails",
        `Ceci est un email de test pour confirmer que le système d'envoi d'emails fonctionne correctement.
        
Si vous recevez cet email, cela signifie que le système est bien configuré et opérationnel. Les notifications automatiques pour les commandes, inscriptions et autres événements seront bien envoyées.

Bien cordialement,
L'équipe WinShirt`
      );
      
      if (success) {
        if (isSupabaseConfigured) {
          toast.success(`Email de test envoyé à ${emails.length} destinataire(s) via Supabase`);
          toast.info("Vérifiez votre boîte de réception (et les spams)", {
            duration: 5000
          });
        } else {
          toast.success(`Email de test envoyé à ${emails.length} destinataire(s) (simulation)`);
          toast.info("En mode simulation, vérifiez la console pour voir les détails de l'email", {
            duration: 5000
          });
          setIsInfoDialogOpen(true);
        }
      } else {
        toast.error("Erreur lors de l'envoi de l'email de test");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error("Erreur lors de l'envoi de l'email de test");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getNotificationEmails = (): string[] => {
    const storedEmails = localStorage.getItem('admin_notification_emails');
    if (storedEmails) {
      try {
        const emails = JSON.parse(storedEmails);
        return Array.isArray(emails) ? emails : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  };
  
  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">&#9696;</span>
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Tester le système d'emails
          </>
        )}
      </Button>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-winshirt-blue-light flex items-center gap-2">
              <InfoIcon className="h-5 w-5" />
              Configuration pour la production
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isSupabaseConfigured 
                ? "Vos emails sont envoyés via Supabase, mais des configurations supplémentaires peuvent être nécessaires."
                : "Actuellement, les emails sont en mode simulation et ne sont pas réellement envoyés."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className={`${isSupabaseConfigured ? "bg-green-900/30 border-green-600/30" : "bg-yellow-900/30 border-yellow-600/30"} border rounded-md p-4 flex gap-3`}>
              <AlertTriangle className={`h-5 w-5 ${isSupabaseConfigured ? "text-green-500" : "text-yellow-500"} flex-shrink-0 mt-1`} />
              <div className="text-sm text-gray-300">
                <p className={`font-medium ${isSupabaseConfigured ? "text-green-400" : "text-yellow-400"} mb-1`}>
                  {isSupabaseConfigured ? "Mode Supabase" : "Mode Simulation"}
                </p>
                <p>
                  {isSupabaseConfigured 
                    ? "Supabase est configuré, mais vous devez aussi créer une fonction Edge 'send-email' pour que les emails fonctionnent correctement."
                    : "Les emails sont actuellement en mode simulation. Ils sont enregistrés dans la console du navigateur mais ne sont pas réellement envoyés aux destinataires."
                  }
                </p>
              </div>
            </div>
            
            <h3 className="text-winshirt-blue-light font-medium">Pour une configuration complète, vous devez :</h3>
            
            <ol className="list-decimal pl-5 space-y-2 text-gray-300">
              <li>
                <span className="font-medium text-white">Configurer Supabase :</span> {isSupabaseConfigured ? "✅ Fait" : "❌ À faire"}
                {!isSupabaseConfigured && <p className="text-sm text-gray-400 mt-1">Définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY comme variables d'environnement</p>}
              </li>
              <li>
                <span className="font-medium text-white">Créer une fonction Edge pour les emails :</span> ❌ À faire
                <p className="text-sm text-gray-400 mt-1">Créer une fonction 'send-email' dans Supabase qui utilise un service comme SendGrid, Mailgun, ou Amazon SES</p>
              </li>
              <li>
                <span className="font-medium text-white">Authentification sociale :</span> ❌ À faire
                <p className="text-sm text-gray-400 mt-1">Configurer l'authentification Google et Facebook dans les paramètres Auth de Supabase</p>
              </li>
              <li>
                <span className="font-medium text-white">Paiements :</span> ❌ À faire
                <p className="text-sm text-gray-400 mt-1">Connecter Stripe via une fonction Edge Supabase sécurisée</p>
              </li>
            </ol>
            
            <div className="bg-winshirt-space-light border border-winshirt-purple/30 rounded-md p-4 mt-4">
              <h4 className="flex items-center gap-2 text-winshirt-blue-light font-medium mb-2">
                <Database className="h-4 w-4" />
                Instructions pour la fonction Edge Supabase
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                Créez une fonction Edge 'send-email' avec ce code (exemple utilisant SendGrid) :
              </p>
              <pre className="bg-winshirt-space p-3 rounded text-xs text-gray-300 overflow-x-auto">
{`import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { SendGridClient } from 'https://esm.sh/@sendgrid/mail'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@winshirt.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const { to, subject, body } = await req.json()
  
  if (!to || !subject || !body) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    const sgMail = SendGridClient()
    sgMail.setApiKey(SENDGRID_API_KEY)
    
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text: body,
      html: body.replace(/\\n/g, '<br>')
    }
    
    await sgMail.send(msg)
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})`}
              </pre>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsInfoDialogOpen(false)}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestEmailButton;

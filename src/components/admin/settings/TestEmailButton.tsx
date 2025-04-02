
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, InfoIcon, AlertTriangle } from 'lucide-react';
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

  const handleClick = async () => {
    // Récupérer les emails de notification
    const emails = getNotificationEmails();
    
    if (emails.length === 0) {
      toast.error("Aucune adresse email configurée pour recevoir les notifications");
      toast.info("Ajoutez des emails dans la section Notifications");
      return;
    }
    
    setIsLoading(true);
    
    // Utiliser EmailService pour envoyer l'email de test
    const success = EmailService.sendTestEmail(
      emails,
      "✉️ Test de fonctionnalité d'emails",
      `Ceci est un email de test pour confirmer que le système d'envoi d'emails fonctionne correctement.
      
Si vous recevez cet email, cela signifie que le système est bien configuré et opérationnel. Les notifications automatiques pour les commandes, inscriptions et autres événements seront bien envoyées.

Bien cordialement,
L'équipe WinShirt`
    );
    
    setTimeout(() => {
      if (success) {
        toast.success(`Email de test envoyé à ${emails.length} destinataire(s) (simulation)`);
        toast.info("En mode production, vérifiez votre boîte de réception (et les spams)", {
          duration: 5000
        });
        setIsInfoDialogOpen(true);
      } else {
        toast.error("Erreur lors de l'envoi de l'email de test");
      }
      setIsLoading(false);
    }, 1500);
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
              Actuellement, les emails sont en mode simulation et ne sont pas réellement envoyés.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-md p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-yellow-400 mb-1">Mode Simulation</p>
                <p>Les emails sont actuellement en mode simulation. Ils sont enregistrés dans la console du navigateur mais ne sont pas réellement envoyés aux destinataires.</p>
              </div>
            </div>
            
            <h3 className="text-winshirt-blue-light font-medium">Pour passer en production, vous devez :</h3>
            
            <ol className="list-decimal pl-5 space-y-2 text-gray-300">
              <li>
                <span className="font-medium text-white">Service d'emails :</span> Configurer un service comme SendGrid, Mailgun, ou Amazon SES
              </li>
              <li>
                <span className="font-medium text-white">Authentification sociale :</span> Créer des applications sur les consoles développeurs de Facebook et Google
              </li>
              <li>
                <span className="font-medium text-white">Paiements :</span> Configurer un compte Stripe et remplacer la clé de test par une clé de production
              </li>
            </ol>
            
            <p className="text-sm text-gray-400 mt-2">
              Ces intégrations nécessitent généralement une API backend sécurisée pour gérer les clés API privées et les webhooks.
            </p>
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

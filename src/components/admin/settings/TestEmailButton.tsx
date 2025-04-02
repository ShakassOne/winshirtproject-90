
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/lib/toast';
import { EmailService } from '@/lib/emailService';

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
        toast.success(`Email de test envoyé à ${emails.length} destinataire(s)`);
        toast.info("Vérifiez votre boîte de réception (et les spams)", {
          duration: 5000
        });
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
  );
};

export default TestEmailButton;

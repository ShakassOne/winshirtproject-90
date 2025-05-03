
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Mail, Send } from 'lucide-react';
import { toast } from '@/lib/toast';
import { EmailService } from '@/lib/emailService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

const NotificationEmailsManager: React.FC = () => {
  const [emails, setEmails] = useState<string[]>(['admin@winshirt.fr']);
  const [newEmail, setNewEmail] = useState<string>('');
  const [isTestDialogOpen, setIsTestDialogOpen] = useState<boolean>(false);
  const [testEmailSubject, setTestEmailSubject] = useState<string>('Test de notification Winshirt');
  const [testEmailContent, setTestEmailContent] = useState<string>('Ceci est un email de test pour vérifier le système de notification.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Charger les emails de notification depuis localStorage
  useEffect(() => {
    const storedEmails = localStorage.getItem('admin_notification_emails');
    if (storedEmails) {
      try {
        const parsedEmails = JSON.parse(storedEmails);
        if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
          setEmails(parsedEmails);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des emails:", error);
      }
    }
  }, []);
  
  // Sauvegarder les emails de notification dans localStorage
  const saveEmails = (updatedEmails: string[]) => {
    localStorage.setItem('admin_notification_emails', JSON.stringify(updatedEmails));
    setEmails(updatedEmails);
  };
  
  // Ajouter un nouvel email
  const handleAddEmail = () => {
    if (!newEmail || !newEmail.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    
    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Adresse email invalide");
      return;
    }
    
    // Vérifier si l'email existe déjà
    if (emails.includes(newEmail)) {
      toast.error("Cette adresse email est déjà dans la liste");
      return;
    }
    
    const updatedEmails = [...emails, newEmail];
    saveEmails(updatedEmails);
    setNewEmail('');
    toast.success("Adresse email ajoutée avec succès");
  };
  
  // Supprimer un email
  const handleRemoveEmail = (email: string) => {
    const updatedEmails = emails.filter(e => e !== email);
    saveEmails(updatedEmails);
    toast.success("Adresse email supprimée");
  };
  
  // Envoyer un email de test
  const handleSendTestEmail = async () => {
    if (emails.length === 0) {
      toast.error("Aucune adresse email pour recevoir le test");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Utilisation du EmailService avec la nouvelle signature
      const success = await EmailService.sendTestEmail(emails, testEmailSubject, testEmailContent);
      
      if (success) {
        const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        toast.success(`Email de test envoyé à ${emails.length} destinataire(s)${isSupabaseConfigured ? ' via Supabase' : ' (simulation)'}`);
      } else {
        toast.error("Erreur lors de l'envoi de l'email de test");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error("Erreur lors de l'envoi de l'email de test");
    } finally {
      setIsLoading(false);
      setIsTestDialogOpen(false);
    }
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Emails de notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Les emails ci-dessous recevront des notifications pour chaque nouvelle commande et événements importants.
        </p>
        
        <div className="flex gap-2">
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Ajouter une adresse email"
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
          <Button 
            onClick={handleAddEmail}
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-2 mt-4">
          {emails.map((email, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-2 bg-winshirt-space-light rounded-md"
            >
              <span className="text-gray-300">{email}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemoveEmail(email)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {emails.length === 0 && (
            <p className="text-center text-gray-400 py-2">
              Aucune adresse email ajoutée
            </p>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => setIsTestDialogOpen(true)}
            variant="outline"
            className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer un email de test
          </Button>
        </div>
      </CardContent>
      
      {/* Dialog pour l'email de test */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-winshirt-blue-light">
              Envoyer un email de test
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Cet email sera envoyé à {emails.length} destinataire(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">Sujet</label>
              <Input
                value={testEmailSubject}
                onChange={(e) => setTestEmailSubject(e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">Contenu</label>
              <textarea
                value={testEmailContent}
                onChange={(e) => setTestEmailContent(e.target.value)}
                rows={5}
                className="bg-winshirt-space-light border-winshirt-purple/30 p-2 rounded-md text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTestDialogOpen(false)}
              className="border-winshirt-purple/30 text-winshirt-blue-light hover:bg-winshirt-purple/10"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSendTestEmail}
              disabled={isLoading}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">&#9696;</span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NotificationEmailsManager;

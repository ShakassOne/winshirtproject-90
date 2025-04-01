
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Mail } from 'lucide-react';
import { toast } from '@/lib/toast';

const NotificationEmailsManager: React.FC = () => {
  const [emails, setEmails] = useState<string[]>(['admin@winshirt.com']);
  const [newEmail, setNewEmail] = useState<string>('');
  
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
      </CardContent>
    </Card>
  );
};

export default NotificationEmailsManager;

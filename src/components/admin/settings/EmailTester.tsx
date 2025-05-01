
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

const EmailTester: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from Winshirt');
  const [body, setBody] = useState('Ceci est un email de test envoyé depuis votre application Winshirt.');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendTest = async () => {
    if (!recipientEmail) {
      toast.error("Veuillez saisir une adresse email de destination");
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          subject,
          body,
        }
      });

      if (error) {
        console.error("Erreur lors de l'appel de la fonction:", error);
        toast.error(`Erreur: ${error.message || 'Une erreur est survenue'}`);
        setLastResult({ success: false, error: error.message });
      } else {
        console.log("Réponse de la fonction:", data);
        toast.success("Email de test envoyé avec succès");
        setLastResult({ success: true, data });
      }
    } catch (err: any) {
      console.error("Exception:", err);
      toast.error(`Exception: ${err.message}`);
      setLastResult({ success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Mail className="h-5 w-5" />
          Testeur d'Email SMTP
        </CardTitle>
        <CardDescription className="text-gray-400">
          Utilisez ce formulaire pour vérifier votre configuration SMTP avec IONOS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-gray-300">Email de destination</Label>
          <Input
            id="recipient"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="destination@example.com"
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
          <p className="text-xs text-gray-500">Adresse email qui recevra le message de test</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-gray-300">Sujet</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body" className="text-gray-300">Contenu</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
        </div>

        {lastResult && (
          <div className={`p-4 border rounded ${lastResult.success ? 'border-green-600 bg-green-900/20' : 'border-red-600 bg-red-900/20'}`}>
            <h4 className={`font-medium ${lastResult.success ? 'text-green-400' : 'text-red-400'} mb-1`}>
              {lastResult.success ? 'Succès' : 'Erreur'}
            </h4>
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(lastResult.success ? lastResult.data : lastResult.error, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSendTest} 
          disabled={isSending}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark flex items-center gap-2"
        >
          {isSending ? (
            <>
              <span className="animate-spin">&#9696;</span>
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Envoyer un email de test
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailTester;

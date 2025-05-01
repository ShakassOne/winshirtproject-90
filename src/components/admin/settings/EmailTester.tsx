
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';

const EmailTester: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from Winshirt');
  const [body, setBody] = useState('Ceci est un email de test envoyé depuis votre application Winshirt.');
  const [htmlContent, setHtmlContent] = useState('<h1>Ceci est un email de test</h1><p>Envoyé depuis votre application <strong>Winshirt</strong>.</p>');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [useHtml, setUseHtml] = useState(true);
  
  // Template d'exemple pour l'email HTML
  const useTemplate = () => {
    setHtmlContent(`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #6c5ce7;">Winshirt Test Email</h2>
  <p>Bonjour,</p>
  <p>Ceci est un email de test formaté en HTML depuis l'application <strong>Winshirt</strong>.</p>
  <ul>
    <li>Les emails HTML permettent une meilleure mise en forme</li>
    <li>Ils peuvent inclure des images, des liens et plus encore</li>
    <li>La communication avec vos clients est ainsi plus professionnelle</li>
  </ul>
  <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
    <p style="margin: 0;">Cet email a été envoyé depuis le <strong>Testeur d'Email</strong> dans votre panneau d'administration.</p>
  </div>
  <p>Bien cordialement,<br>L'équipe WinShirt</p>
</div>
    `);
  };

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
          html: useHtml ? htmlContent : undefined
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

        <div className="flex items-center space-x-2 my-4">
          <Switch
            checked={useHtml}
            onCheckedChange={setUseHtml}
            id="html-mode"
          />
          <Label htmlFor="html-mode" className="text-gray-300">Utiliser le formatage HTML</Label>
        </div>

        <Tabs defaultValue={useHtml ? "html" : "text"} onValueChange={(val) => setUseHtml(val === "html")}>
          <TabsList className="bg-winshirt-space-light">
            <TabsTrigger value="text">Texte simple</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-2 mt-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="bg-winshirt-space-light border-winshirt-purple/30"
              placeholder="Contenu de l'email en texte simple..."
            />
          </TabsContent>
          
          <TabsContent value="html" className="space-y-2 mt-2">
            <div className="flex justify-end mb-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={useTemplate}
                className="text-xs"
              >
                Utiliser un modèle
              </Button>
            </div>
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={10}
              className="bg-winshirt-space-light border-winshirt-purple/30 font-mono text-sm"
              placeholder="<h1>Titre</h1><p>Contenu HTML...</p>"
            />
            <div className="mt-2 p-3 border border-dashed border-winshirt-purple/30 rounded-md bg-winshirt-space-light overflow-auto max-h-60">
              <div className="text-xs text-gray-400 mb-2">Aperçu HTML:</div>
              <div className="text-white" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </TabsContent>
        </Tabs>

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

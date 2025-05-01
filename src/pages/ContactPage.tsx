
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Phone, User } from 'lucide-react';
import StarBackground from '@/components/StarBackground';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Envoyer l'email via la fonction Supabase Edge
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'admin@winshirt.fr', // Adresse de notification
          subject: `Contact: ${formData.subject}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Téléphone:</strong> ${formData.phone || 'Non fourni'}</p>
            <p><strong>Sujet:</strong> ${formData.subject}</p>
            <h3>Message:</h3>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
          `,
        }
      });
      
      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        throw new Error(error.message);
      }
      
      // Si disponible, envoyer également un message de confirmation à l'expéditeur
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: formData.email,
            subject: 'Confirmation de votre message - Winshirt',
            html: `
              <h2>Merci de nous avoir contacté !</h2>
              <p>Bonjour ${formData.name},</p>
              <p>Nous avons bien reçu votre message concernant "${formData.subject}".</p>
              <p>Notre équipe vous répondra dans les plus brefs délais.</p>
              <p>Cordialement,<br>L'équipe Winshirt</p>
            `,
          }
        });
      } catch (confirmError) {
        // On ne bloque pas le processus si l'email de confirmation échoue
        console.warn('Erreur lors de l\'envoi de la confirmation:', confirmError);
      }
      
      toast.success('Message envoyé avec succès !', {
        description: 'Nous vous répondrons dans les plus brefs délais.'
      });
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erreur lors de l\'envoi du message', {
        description: 'Veuillez réessayer ultérieurement.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Contactez-nous</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une question, une suggestion ou un problème ? N'hésitez pas à nous contacter.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="winshirt-card p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nom complet</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <User size={18} />
                      </div>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Téléphone (optionnel)</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <Phone size={18} />
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                        placeholder="Votre numéro"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Sujet</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <MessageSquare size={18} />
                      </div>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="pl-10 bg-winshirt-space-light border-winshirt-purple/30"
                        placeholder="Sujet de votre message"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="bg-winshirt-space-light border-winshirt-purple/30"
                    placeholder="Votre message..."
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="winshirt-card p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-white">Informations de contact</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-winshirt-purple/20 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-winshirt-purple-light" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Email</h3>
                      <p className="text-gray-300 mt-1">contact@winshirt.fr</p>
                      <p className="text-gray-400 text-sm mt-1">Nous répondons généralement sous 24-48h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-winshirt-purple/20 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-winshirt-purple-light" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Téléphone</h3>
                      <p className="text-gray-300 mt-1">+33 (0)1 23 45 67 89</p>
                      <p className="text-gray-400 text-sm mt-1">Du lundi au vendredi, 9h-18h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-winshirt-purple/20 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-winshirt-purple-light" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Réseaux sociaux</h3>
                      <div className="flex space-x-4 mt-2">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-winshirt-purple-light">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                          </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-winshirt-purple-light">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-winshirt-purple-light">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="winshirt-card p-8">
                <h2 className="text-2xl font-semibold mb-6 text-white">Foire Aux Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-white">Comment fonctionne le système de loterie ?</h3>
                    <p className="text-gray-300 mt-1">
                      Chaque produit vous permet de participer à une ou plusieurs loteries. Lors de l'achat, vous choisirez les loteries auxquelles vous souhaitez participer.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white">Comment personnaliser mon t-shirt ?</h3>
                    <p className="text-gray-300 mt-1">
                      Dans la page produit, cliquez sur l'onglet "Personnaliser", puis sélectionnez parmi nos visuels ou téléchargez le vôtre. Vous pourrez ajuster la position et la taille.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white">Quels sont les délais de livraison ?</h3>
                    <p className="text-gray-300 mt-1">
                      Les délais de livraison varient généralement entre 3 et 7 jours ouvrés pour la France métropolitaine. Les délais internationaux peuvent être plus longs.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/20"
                      onClick={() => window.location.href = '/faq'}
                    >
                      Voir toutes les FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;

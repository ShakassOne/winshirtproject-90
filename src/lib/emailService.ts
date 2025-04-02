import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { simulateSendEmail } from "@/contexts/AuthContext";

interface EmailTemplate {
  subject: string;
  body: string;
}

// Email templates for different notification types
const emailTemplates = {
  // Account related
  accountCreation: (name: string): EmailTemplate => ({
    subject: "Bienvenue sur WinShirt",
    body: `Bonjour ${name},\n\nMerci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  passwordReset: (name: string): EmailTemplate => ({
    subject: "Réinitialisation de votre mot de passe WinShirt",
    body: `Bonjour ${name},\n\nVous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Order related
  orderConfirmation: (name: string, orderId: string): EmailTemplate => ({
    subject: `Confirmation de commande #${orderId} - WinShirt`,
    body: `Bonjour ${name},\n\nNous vous remercions pour votre commande #${orderId}. Votre commande est en cours de traitement.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  orderShipped: (name: string, orderId: string, trackingNumber?: string): EmailTemplate => ({
    subject: `Commande #${orderId} expédiée - WinShirt`,
    body: `Bonjour ${name},\n\nVotre commande #${orderId} a été expédiée.${trackingNumber ? `\nVotre numéro de suivi est: ${trackingNumber}` : ''}\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Lottery related
  lotteryParticipation: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `Participation à la loterie "${lotteryTitle}" - WinShirt`,
    body: `Bonjour ${name},\n\nNous vous confirmons votre participation à la loterie "${lotteryTitle}". Bonne chance !\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  lotteryWinner: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `🎉 Félicitations! Vous avez gagné la loterie "${lotteryTitle}" - WinShirt`,
    body: `Bonjour ${name},\n\nNous sommes heureux de vous annoncer que vous avez gagné la loterie "${lotteryTitle}"! Nous vous contacterons prochainement pour vous remettre votre prix.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Admin notifications
  newOrderNotification: (orderId: string, total: number): EmailTemplate => ({
    subject: `Nouvelle commande #${orderId} - WinShirt`,
    body: `Une nouvelle commande #${orderId} a été passée pour un montant total de ${total.toFixed(2)}€.\n\nConsultez le backoffice pour plus de détails.`
  }),
  lowStockNotification: (productName: string, quantityLeft: number): EmailTemplate => ({
    subject: `Stock faible - ${productName} - WinShirt`,
    body: `Le produit "${productName}" est en stock faible (${quantityLeft} restants).\n\nPensez à réapprovisionner.`
  }),
  
  // Generic test
  testEmail: (customSubject?: string, customBody?: string): EmailTemplate => ({
    subject: customSubject || 'Test de notification WinShirt',
    body: customBody || 'Ceci est un email de test pour vérifier le système de notification.'
  })
};

export class EmailService {
  private static getNotificationEmails(): string[] {
    try {
      const storedEmails = localStorage.getItem('admin_notification_emails');
      return storedEmails ? JSON.parse(storedEmails) : ['admin@winshirt.com'];
    } catch (error) {
      console.error("Erreur lors de la récupération des emails de notification:", error);
      return ['admin@winshirt.com'];
    }
  }
  
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      // Check if Supabase is properly configured and connected
      if (!supabase || !supabase.functions) {
        console.log(`[EMAIL SIMULATION] To: ${to}, Subject: ${subject}`);
        console.log(`[EMAIL SIMULATION] Body: ${body}`);
        
        // Fall back to simulation if Supabase is not configured or connected
        const result = simulateSendEmail(to, subject, body);
        return result;
      }
      
      // Use Supabase Edge Function to send emails
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          body,
        }
      });
      
      if (error) {
        console.error('Error sending email via Supabase:', error);
        toast.error("Erreur lors de l'envoi de l'email");
        return false;
      }
      
      console.log('Email sent successfully via Supabase:', data);
      toast.success("Email envoyé avec succès");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
      return false;
    }
  }
  
  // All other methods remain the same but need to be updated to be async
  static async sendAccountCreationEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.accountCreation(name);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async sendPasswordResetEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.passwordReset(name);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async sendOrderConfirmationEmail(email: string, name: string, orderId: string): Promise<boolean> {
    const template = emailTemplates.orderConfirmation(name, orderId);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async sendOrderShippedEmail(email: string, name: string, orderId: string, trackingNumber?: string): Promise<boolean> {
    const template = emailTemplates.orderShipped(name, orderId, trackingNumber);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async sendLotteryParticipationEmail(email: string, name: string, lotteryTitle: string): Promise<boolean> {
    const template = emailTemplates.lotteryParticipation(name, lotteryTitle);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async sendLotteryWinnerEmail(email: string, name: string, lotteryTitle: string): Promise<boolean> {
    const template = emailTemplates.lotteryWinner(name, lotteryTitle);
    return await this.sendEmail(email, template.subject, template.body);
  }
  
  static async notifyAdminNewOrder(orderId: string, total: number): Promise<boolean> {
    const adminEmails = this.getNotificationEmails();
    
    if (adminEmails.length === 0) {
      console.warn("Aucun email administrateur configuré pour les notifications");
      return false;
    }
    
    const template = emailTemplates.newOrderNotification(orderId, total);
    
    let success = true;
    for (const email of adminEmails) {
      const result = await this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    }
    
    return success;
  }
  
  static async notifyAdminLowStock(productName: string, quantityLeft: number): Promise<boolean> {
    const adminEmails = this.getNotificationEmails();
    
    if (adminEmails.length === 0) {
      console.warn("Aucun email administrateur configuré pour les notifications");
      return false;
    }
    
    const template = emailTemplates.lowStockNotification(productName, quantityLeft);
    
    let success = true;
    for (const email of adminEmails) {
      const result = await this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    }
    
    return success;
  }
  
  static async sendTestEmail(emails: string[], customSubject?: string, customBody?: string): Promise<boolean> {
    if (emails.length === 0) return false;
    
    const template = emailTemplates.testEmail(customSubject, customBody);
    
    let success = true;
    for (const email of emails) {
      const result = await this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    }
    
    return success;
  }
}

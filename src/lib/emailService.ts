
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { simulateSendEmail } from "@/utils/authUtils";
import { Order, OrderItem } from '@/types/order';

interface EmailTemplate {
  subject: string;
  body: string;
  html?: string;
}

// Email templates for different notification types
const emailTemplates = {
  // Account related
  accountCreation: (name: string): EmailTemplate => ({
    subject: "Bienvenue sur WinShirt",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Bienvenue sur WinShirt !</h2>
        <p>Bonjour ${name},</p>
        <p>Merci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.</p>
        <p>Vous pouvez maintenant participer à nos loteries et commander nos produits personnalisés.</p>
        <p>Bien cordialement,<br>L'équipe WinShirt</p>
      </div>
    `,
    body: `Bonjour ${name},\n\nMerci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  passwordReset: (name: string): EmailTemplate => ({
    subject: "Réinitialisation de votre mot de passe WinShirt",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Réinitialisation de mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.</p>
        <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>
        <p>Bien cordialement,<br>L'équipe WinShirt</p>
      </div>
    `,
    body: `Bonjour ${name},\n\nVous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Order related
  orderConfirmation: (name: string, order: Order): EmailTemplate => {
    // Generate HTML for order items
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.productImage ? 
            `<img src="${item.productImage}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover;">` : 
            ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.productName}
          ${item.size ? `<br><small>Taille: ${item.size}</small>` : ''}
          ${item.color ? `<br><small>Couleur: ${item.color}</small>` : ''}
          ${item.visualDesign ? `<br><small>Design personnalisé</small>` : ''}
          ${item.lotteriesEntries && item.lotteriesEntries.length > 0 ? `<br><small>${item.lotteriesEntries.length} ticket(s) de loterie</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>
    `).join('');

    return {
      subject: `Confirmation de commande #${order.id} - WinShirt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #6c5ce7;">Merci pour votre commande !</h2>
          <p>Bonjour ${name},</p>
          <p>Nous vous remercions pour votre commande #${order.id}. Votre commande est en cours de traitement.</p>
          
          <h3>Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: left;">Description</th>
                <th style="padding: 10px; text-align: center;">Qté</th>
                <th style="padding: 10px; text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Sous-total:</td>
                <td style="padding: 10px; text-align: right;">${order.subtotal?.toFixed(2) || '0.00'} €</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Frais de livraison:</td>
                <td style="padding: 10px; text-align: right;">${order.shipping?.cost?.toFixed(2) || '0.00'} €</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em;">${order.total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h4 style="margin-top: 0;">Adresse de livraison</h4>
            <p style="margin-bottom: 0;">
              ${order.shipping?.address || ''}<br>
              ${order.shipping?.postalCode || ''} ${order.shipping?.city || ''}<br>
              ${order.shipping?.country || ''}
            </p>
          </div>
          
          <p style="margin-top: 20px;">Vous recevrez un email de confirmation lorsque votre commande sera expédiée.</p>
          <p>Bien cordialement,<br>L'équipe WinShirt</p>
        </div>
      `,
      body: `Bonjour ${name},\n\nNous vous remercions pour votre commande #${order.id}. Votre commande est en cours de traitement.\n\nBien cordialement,\nL'équipe WinShirt`
    };
  },
  
  orderShipped: (name: string, orderId: string, trackingNumber?: string): EmailTemplate => ({
    subject: `Commande #${orderId} expédiée - WinShirt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Votre commande a été expédiée !</h2>
        <p>Bonjour ${name},</p>
        <p>Votre commande #${orderId} a été expédiée.</p>
        ${trackingNumber ? `<p>Votre numéro de suivi est: <strong>${trackingNumber}</strong></p>` : ''}
        <p>Bien cordialement,<br>L'équipe WinShirt</p>
      </div>
    `,
    body: `Bonjour ${name},\n\nVotre commande #${orderId} a été expédiée.${trackingNumber ? `\nVotre numéro de suivi est: ${trackingNumber}` : ''}\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Lottery related
  lotteryParticipation: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `Participation à la loterie "${lotteryTitle}" - WinShirt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Participation à la loterie confirmée</h2>
        <p>Bonjour ${name},</p>
        <p>Nous vous confirmons votre participation à la loterie "${lotteryTitle}". Bonne chance !</p>
        <p>Bien cordialement,<br>L'équipe WinShirt</p>
      </div>
    `,
    body: `Bonjour ${name},\n\nNous vous confirmons votre participation à la loterie "${lotteryTitle}". Bonne chance !\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  lotteryWinner: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `🎉 Félicitations! Vous avez gagné la loterie "${lotteryTitle}" - WinShirt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Félicitations ! Vous avez gagné !</h2>
        <p>Bonjour ${name},</p>
        <p>Nous sommes heureux de vous annoncer que vous avez gagné la loterie "${lotteryTitle}" !</p>
        <p>Nous vous contacterons prochainement pour vous remettre votre prix.</p>
        <p>Bien cordialement,<br>L'équipe WinShirt</p>
      </div>
    `,
    body: `Bonjour ${name},\n\nNous sommes heureux de vous annoncer que vous avez gagné la loterie "${lotteryTitle}" ! Nous vous contacterons prochainement pour vous remettre votre prix.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Admin notifications
  newOrderNotification: (orderId: string, total: number): EmailTemplate => ({
    subject: `Nouvelle commande #${orderId} - WinShirt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Nouvelle commande reçue</h2>
        <p>Une nouvelle commande #${orderId} a été passée pour un montant total de ${total.toFixed(2)}€.</p>
        <p>Consultez le backoffice pour plus de détails.</p>
      </div>
    `,
    body: `Une nouvelle commande #${orderId} a été passée pour un montant total de ${total.toFixed(2)}€.\n\nConsultez le backoffice pour plus de détails.`
  }),
  
  lowStockNotification: (productName: string, quantityLeft: number): EmailTemplate => ({
    subject: `Stock faible - ${productName} - WinShirt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Alerte stock faible</h2>
        <p>Le produit "${productName}" est en stock faible (${quantityLeft} restants).</p>
        <p>Pensez à réapprovisionner.</p>
      </div>
    `,
    body: `Le produit "${productName}" est en stock faible (${quantityLeft} restants).\n\nPensez à réapprovisionner.`
  }),
  
  // Generic test
  testEmail: (customSubject?: string, customBody?: string): EmailTemplate => ({
    subject: customSubject || 'Test de notification WinShirt',
    html: customBody ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        ${customBody}
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Test de notification WinShirt</h2>
        <p>Ceci est un email de test pour vérifier le système de notification.</p>
      </div>
    `,
    body: customBody || 'Ceci est un email de test pour vérifier le système de notification.'
  })
};

export class EmailService {
  private static getNotificationEmails(): string[] {
    try {
      const storedEmails = localStorage.getItem('admin_notification_emails');
      return storedEmails ? JSON.parse(storedEmails) : ['admin@winshirt.fr'];
    } catch (error) {
      console.error("Erreur lors de la récupération des emails de notification:", error);
      return ['admin@winshirt.fr'];
    }
  }
  
  static async sendEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
    try {
      // Check if Supabase is properly configured and connected
      if (!supabase || !supabase.functions) {
        console.log(`[EMAIL SIMULATION] To: ${to}, Subject: ${subject}`);
        if (html) {
          console.log(`[EMAIL SIMULATION] HTML Content available`);
        } else {
          console.log(`[EMAIL SIMULATION] Body: ${body}`);
        }
        
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
          html
        }
      });
      
      if (error) {
        console.error('Error sending email via Supabase:', error);
        toast.error("Erreur lors de l'envoi de l'email");
        return false;
      }
      
      console.log('Email sent successfully via Supabase:', data);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
      return false;
    }
  }
  
  // Account related emails
  static async sendAccountCreationEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.accountCreation(name);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  static async sendPasswordResetEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.passwordReset(name);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  // Order related emails
  static async sendOrderConfirmationEmail(email: string, name: string, order: Order): Promise<boolean> {
    const template = emailTemplates.orderConfirmation(name, order);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  static async sendOrderShippedEmail(email: string, name: string, orderId: string, trackingNumber?: string): Promise<boolean> {
    const template = emailTemplates.orderShipped(name, orderId, trackingNumber);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  // Lottery related emails
  static async sendLotteryParticipationEmail(email: string, name: string, lotteryTitle: string): Promise<boolean> {
    const template = emailTemplates.lotteryParticipation(name, lotteryTitle);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  static async sendLotteryWinnerEmail(email: string, name: string, lotteryTitle: string): Promise<boolean> {
    const template = emailTemplates.lotteryWinner(name, lotteryTitle);
    return await this.sendEmail(email, template.subject, template.body, template.html);
  }
  
  // Admin notifications
  static async notifyAdminNewOrder(orderId: string, total: number): Promise<boolean> {
    const adminEmails = this.getNotificationEmails();
    
    if (adminEmails.length === 0) {
      console.warn("Aucun email administrateur configuré pour les notifications");
      return false;
    }
    
    const template = emailTemplates.newOrderNotification(orderId, total);
    
    let success = true;
    for (const email of adminEmails) {
      const result = await this.sendEmail(email, template.subject, template.body, template.html);
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
      const result = await this.sendEmail(email, template.subject, template.body, template.html);
      if (!result) success = false;
    }
    
    return success;
  }
  
  // Test emails
  static async sendTestEmail(emails: string[], customSubject?: string, customBody?: string): Promise<boolean> {
    if (emails.length === 0) return false;
    
    const template = emailTemplates.testEmail(customSubject, customBody);
    
    let success = true;
    for (const email of emails) {
      const result = await this.sendEmail(email, template.subject, template.body, template.html);
      if (!result) success = false;
    }
    
    return success;
  }
}


import { simulateSendEmail } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";

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
  
  static sendEmail(to: string, subject: string, body: string): boolean {
    try {
      // Log this email to the console for debugging
      console.log(`[EMAIL SENDING] To: ${to}, Subject: ${subject}`);
      console.log(`[EMAIL CONTENT] ${body}`);
      
      // Using the simulateSendEmail function from AuthContext
      const result = simulateSendEmail(to, subject, body);
      
      // In a real implementation, this would be where you'd call an API
      // For demo purposes, we'll just return success
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
      return false;
    }
  }
  
  static sendAccountCreationEmail(email: string, name: string): boolean {
    const template = emailTemplates.accountCreation(name);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static sendPasswordResetEmail(email: string, name: string): boolean {
    const template = emailTemplates.passwordReset(name);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static sendOrderConfirmationEmail(email: string, name: string, orderId: string): boolean {
    const template = emailTemplates.orderConfirmation(name, orderId);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static sendOrderShippedEmail(email: string, name: string, orderId: string, trackingNumber?: string): boolean {
    const template = emailTemplates.orderShipped(name, orderId, trackingNumber);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static sendLotteryParticipationEmail(email: string, name: string, lotteryTitle: string): boolean {
    const template = emailTemplates.lotteryParticipation(name, lotteryTitle);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static sendLotteryWinnerEmail(email: string, name: string, lotteryTitle: string): boolean {
    const template = emailTemplates.lotteryWinner(name, lotteryTitle);
    return this.sendEmail(email, template.subject, template.body);
  }
  
  static notifyAdminNewOrder(orderId: string, total: number): boolean {
    const adminEmails = this.getNotificationEmails();
    
    if (adminEmails.length === 0) {
      console.warn("Aucun email administrateur configuré pour les notifications");
      return false;
    }
    
    const template = emailTemplates.newOrderNotification(orderId, total);
    
    let success = true;
    adminEmails.forEach(email => {
      const result = this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    });
    
    return success;
  }
  
  static notifyAdminLowStock(productName: string, quantityLeft: number): boolean {
    const adminEmails = this.getNotificationEmails();
    
    if (adminEmails.length === 0) {
      console.warn("Aucun email administrateur configuré pour les notifications");
      return false;
    }
    
    const template = emailTemplates.lowStockNotification(productName, quantityLeft);
    
    let success = true;
    adminEmails.forEach(email => {
      const result = this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    });
    
    return success;
  }
  
  static sendTestEmail(emails: string[], customSubject?: string, customBody?: string): boolean {
    if (emails.length === 0) return false;
    
    const template = emailTemplates.testEmail(customSubject, customBody);
    
    let success = true;
    emails.forEach(email => {
      const result = this.sendEmail(email, template.subject, template.body);
      if (!result) success = false;
    });
    
    return success;
  }
}


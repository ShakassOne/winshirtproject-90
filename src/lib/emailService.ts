
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

interface EmailTemplateOptions {
  userName?: string;
  orderNumber?: string;
  orderDetails?: Order;
  products?: any[];
  totalAmount?: number;
  link?: string;
}

export class EmailService {
  private static async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: htmlContent,
          type: 'html'
        }
      });

      if (error) throw error;
      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Template HTML pour les emails
  private static getEmailTemplate(options: EmailTemplateOptions, templateType: 'welcome' | 'order' | 'admin') {
    const baseTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${templateType === 'welcome' ? 'Bienvenue sur WinShirt' : templateType === 'order' ? 'Votre commande WinShirt' : 'Nouvelle commande WinShirt'}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #d6f0ff, #ffffff);
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 1rem;
        }
        .header img {
          width: 100px;
          border-radius: 50%;
        }
        h1 {
          font-size: 22px;
          color: #003366;
        }
        p {
          font-size: 16px;
          color: #333;
          line-height: 1.6;
        }
        .order-summary {
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 15px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .order-summary p {
          margin: 5px 0;
        }
        .product-list {
          border-top: 1px solid #ddd;
          margin-top: 10px;
          padding-top: 10px;
        }
        .product-item {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .cta-button {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 12px 24px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 30px;
          transition: background 0.3s ease;
        }
        .cta-button:hover {
          background-color: #218838;
        }
        .footer {
          margin-top: 2rem;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://pixelprint.world/wp-content/uploads/2025/05/Logo-Shakass.png" alt="WinShirt">
        </div>
    `;

    // Contenu spécifique selon le type d'email
    let specificContent = '';

    if (templateType === 'welcome') {
      specificContent = `
        <h1>🎉 Bienvenue sur WinShirt!</h1>
        <p>Bonjour ${options.userName || 'cher client'},</p>
        <p>Merci de vous être inscrit sur WinShirt, la plateforme de t-shirts personnalisés avec loteries intégrées.</p>
        <p>Sur WinShirt, vous pouvez:</p>
        <ul>
          <li>Créer et personnaliser vos propres t-shirts</li>
          <li>Participer à des loteries pour gagner des articles exclusifs</li>
          <li>Suivre vos commandes facilement</li>
        </ul>
        <p>N'hésitez pas à explorer notre catalogue et à participer à nos loteries!</p>
        <a href="${options.link || 'https://winshirt.com'}" class="cta-button">Découvrir WinShirt</a>
      `;
    } else if (templateType === 'order') {
      // Génération de la liste des produits
      let productList = '';
      if (options.products && options.products.length > 0) {
        productList = '<div class="product-list">';
        options.products.forEach(product => {
          productList += `
            <div class="product-item">
              <p><strong>${product.product_name || 'Produit'}</strong> x${product.quantity || 1}</p>
              <p>Taille: ${product.size || 'N/A'}, Couleur: ${product.color || 'Standard'}</p>
              <p>${product.price ? (product.price * (product.quantity || 1)).toFixed(2) + ' €' : ''}</p>
            </div>
          `;
        });
        productList += '</div>';
      }

      specificContent = `
        <h1>🎉 Votre commande est confirmée!</h1>
        <p>Bonjour ${options.userName || 'cher client'},</p>
        <p>Merci pour votre commande sur WinShirt. Voici un récapitulatif:</p>
        <div class="order-summary">
          <p><strong>Commande n° :</strong> ${options.orderNumber || '#N/A'}</p>
          ${productList}
          <p><strong>Total :</strong> ${options.totalAmount ? options.totalAmount.toFixed(2) + ' €' : 'N/A'}</p>
        </div>
        <p>Vous pouvez suivre l'état de votre commande dans votre espace client.</p>
        <a href="${options.link || 'https://winshirt.com/account'}" class="cta-button">Suivre ma commande</a>
      `;
    } else if (templateType === 'admin') {
      specificContent = `
        <h1>🎉 Nouvelle commande reçue!</h1>
        <p>Une nouvelle commande vient d'être enregistrée sur WinShirt.</p>
        <div class="order-summary">
          <p><strong>Commande n° :</strong> ${options.orderNumber || '#N/A'}</p>
          <p><strong>Client :</strong> ${options.userName || 'N/A'}</p>
          <p><strong>Total :</strong> ${options.totalAmount ? options.totalAmount.toFixed(2) + ' €' : 'N/A'}</p>
        </div>
        <p>Consultez les détails et préparez l'envoi depuis votre tableau de bord :</p>
        <a href="${options.link || 'https://winshirt.com/admin/commandes'}" class="cta-button">Voir la commande</a>
      `;
    }

    // Pied de page commun
    const footer = `
        <div class="footer">
          © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
          Ce message est généré automatiquement.
        </div>
      </div>
    </body>
    </html>
    `;

    return baseTemplate + specificContent + footer;
  }

  // Email de bienvenue lors de la création de compte
  public static async sendAccountCreationEmail(email: string, name: string, order?: Order) {
    const subject = 'Bienvenue sur WinShirt';
    const htmlContent = this.getEmailTemplate(
      {
        userName: name,
        link: 'https://winshirt.com'
      },
      'welcome'
    );

    try {
      await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Faire une silencieuse, ne pas bloquer le flux pour un email
    }
  }

  // Email de confirmation de commande au client
  public static async sendOrderConfirmationEmail(order: Order) {
    if (!order.client_email) {
      console.error('Cannot send order confirmation: No client email provided');
      return;
    }

    const subject = 'Confirmation de votre commande WinShirt';
    const htmlContent = this.getEmailTemplate(
      {
        userName: order.client_name || 'Client',
        orderNumber: `#${order.id}`,
        orderDetails: order,
        products: order.items || [],
        totalAmount: order.total || 0,
        link: `https://winshirt.com/orders/${order.id}`
      },
      'order'
    );

    try {
      await this.sendEmail(order.client_email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Faire une silencieuse, ne pas bloquer le flux pour un email
    }

    // Envoyer également un email à l'administrateur
    await this.sendNewOrderNotificationToAdmin(order);
  }

  // Email de notification de nouvelle commande à l'administrateur
  public static async sendNewOrderNotificationToAdmin(order: Order) {
    const adminEmail = 'admin@winshirt.fr'; // Utiliser l'email admin correct
    const subject = 'Nouvelle commande sur WinShirt';
    const htmlContent = this.getEmailTemplate(
      {
        userName: order.client_name || 'Client inconnu',
        orderNumber: `#${order.id}`,
        totalAmount: order.total || 0,
        link: `https://winshirt.com/admin/commandes/${order.id}`
      },
      'admin'
    );

    try {
      await this.sendEmail(adminEmail, subject, htmlContent);
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      // Faire une silencieuse, ne pas bloquer le flux pour un email
    }
  }

  // Méthode générique pour envoyer un email de test
  public static async sendTestEmail(to: string) {
    const subject = 'Test de WinShirt';
    const htmlContent = `
      <h1>Test d'envoi d'email</h1>
      <p>Ceci est un test d'envoi d'email depuis WinShirt.</p>
      <p>Si vous recevez ce message, la configuration d'email fonctionne correctement.</p>
    `;

    return await this.sendEmail(to, subject, htmlContent);
  }
}

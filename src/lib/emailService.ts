
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
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Bienvenue chez WinShirt</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #c0e0ff, #f8f9ff);
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
            font-size: 24px;
            color: #003366;
          }
          p {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
          }
          .cta-button {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 12px 24px;
            background-color: #0055ff;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
          }
          .cta-button:hover {
            background-color: #003dcc;
          }
          .user-info {
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
          }
          .user-info p {
            margin: 5px 0;
          }
          .order-summary {
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
          }
          .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          .order-table th,
          .order-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .order-table th {
            background-color: rgba(0, 85, 255, 0.1);
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
          <h1>Bienvenue dans l'univers WinShirt !</h1>
          <p>Bonjour ${name} 👋</p>
          <p>Merci de rejoindre notre communauté ✨</p>
          
          <div class="user-info">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${name}@example.com</p>
            <p><strong>Date d'inscription:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p>Personnalise tes vêtements, organise des loteries, et crée ta marque facilement avec WinShirt.</p>
          <p>Pour commencer, connecte-toi à ton espace en cliquant ci-dessous :</p>
          <a href="https://winshirt.com/mon-espace" class="cta-button">Accéder à mon compte</a>
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email vous a été envoyé suite à votre inscription sur winshirt.com
          </div>
        </div>
      </body>
      </html>
    `,
    body: `Bonjour ${name},\n\nMerci de vous être inscrit sur WinShirt. Votre compte a été créé avec succès.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  passwordReset: (name: string): EmailTemplate => ({
    subject: "Réinitialisation de votre mot de passe WinShirt",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Réinitialisation de mot de passe</title>
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
          .cta-button {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 12px 24px;
            background-color: #6c5ce7;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
          }
          .cta-button:hover {
            background-color: #5f50e6;
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
          <h1>Réinitialisation de mot de passe</h1>
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.</p>
          <p><a href="#" class="cta-button">Réinitialiser mon mot de passe</a></p>
          <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email vous a été envoyé suite à une demande de réinitialisation de mot de passe
          </div>
        </div>
      </body>
      </html>
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
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Confirmation de commande - WinShirt</title>
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
            .order-table {
              width: 100%;
              border-collapse: collapse;
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
            }
            .order-table th {
              background-color: #6c5ce7;
              color: white;
              padding: 10px;
              text-align: left;
            }
            .order-table td {
              padding: 10px;
              border-bottom: 1px solid #eee;
            }
            .order-table tr:last-child td {
              border-bottom: none;
            }
            .total-row {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .shipping-info {
              background-color: rgba(255, 255, 255, 0.4);
              border-radius: 15px;
              padding: 1rem;
              margin: 1.5rem 0;
              border: 1px solid rgba(0, 0, 0, 0.05);
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
            <h1>🎉 Confirmation de commande</h1>
            <p>Bonjour ${name},</p>
            <p>Nous vous remercions pour votre commande. Votre commande a bien été reçue et est en cours de traitement.</p>
            
            <div class="order-summary">
              <p><strong>Commande n° :</strong> #${order.id}</p>
              <p><strong>Date :</strong> ${new Date(order.orderDate).toLocaleDateString('fr-FR')}</p>
              
              <table class="order-table">
                <thead>
                  <tr>
                    <th style="width: 60px;"></th>
                    <th>Produit</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 10px;"><strong>Sous-total:</strong></td>
                    <td style="text-align: right; padding: 10px;">${order.subtotal?.toFixed(2) || '0.00'} €</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 10px;"><strong>Frais de livraison:</strong></td>
                    <td style="text-align: right; padding: 10px;">${order.shipping?.cost?.toFixed(2) || '0.00'} €</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                    <td style="text-align: right; padding: 10px; font-size: 1.1em;">${order.total.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div class="shipping-info">
              <h3 style="margin-top: 0;">Adresse de livraison</h3>
              <p style="margin-bottom: 0;">
                ${order.shipping?.address || ''}<br>
                ${order.shipping?.postalCode || ''} ${order.shipping?.city || ''}<br>
                ${order.shipping?.country || ''}
              </p>
            </div>
            
            <p>Un email de confirmation vous sera envoyé lorsque votre commande sera expédiée.</p>
            <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter.</p>
            
            <p>Merci d'avoir choisi WinShirt!</p>
            
            <div class="footer">
              © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
              Cet email est généré automatiquement, merci de ne pas y répondre.
            </div>
          </div>
        </body>
        </html>
      `,
      body: `Bonjour ${name},\n\nNous vous remercions pour votre commande #${order.id}. Votre commande est en cours de traitement.\n\nBien cordialement,\nL'équipe WinShirt`
    };
  },
  
  orderShipped: (name: string, orderId: string, trackingNumber?: string): EmailTemplate => ({
    subject: `Commande #${orderId} expédiée - WinShirt`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Commande expédiée - WinShirt</title>
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
          .tracking-info {
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 15px;
            padding: 1rem;
            margin: 1.5rem 0;
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          .tracking-number {
            font-size: 18px;
            background: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            text-align: center;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            margin-top: 0.5rem;
            padding: 12px 24px;
            background-color: #6c5ce7;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #5f50e6;
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
          <h1>🚚 Votre commande a été expédiée !</h1>
          <p>Bonjour ${name},</p>
          <p>Bonne nouvelle ! Votre commande #${orderId} a été expédiée et est en route vers vous.</p>
          
          ${trackingNumber ? `
          <div class="tracking-info">
            <p><strong>Numéro de suivi :</strong></p>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="https://track.laposte.fr/suivi/detail/${trackingNumber}" class="cta-button" target="_blank">Suivre mon colis</a>
          </div>
          ` : ''}
          
          <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
          
          <p>Nous espérons que vous apprécierez vos nouveaux articles WinShirt !</p>
          
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email est généré automatiquement, merci de ne pas y répondre.
          </div>
        </div>
      </body>
      </html>
    `,
    body: `Bonjour ${name},\n\nVotre commande #${orderId} a été expédiée.${trackingNumber ? `\nVotre numéro de suivi est: ${trackingNumber}` : ''}\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Lottery related
  lotteryParticipation: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `Participation à la loterie "${lotteryTitle}" - WinShirt`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Participation à la loterie - WinShirt</title>
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
          .lottery-info {
            background-color: rgba(108, 92, 231, 0.1);
            border-radius: 15px;
            padding: 1rem;
            margin: 1.5rem 0;
            border: 1px solid rgba(108, 92, 231, 0.3);
            text-align: center;
          }
          .ticket {
            background-color: #6c5ce7;
            color: white;
            padding: 15px 30px;
            border-radius: 15px;
            margin: 20px auto;
            width: 60%;
            text-align: center;
          }
          .ticket h3 {
            margin: 0;
            font-size: 18px;
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
          <h1>🎫 Participation à la loterie confirmée</h1>
          <p>Bonjour ${name},</p>
          <p>Nous vous confirmons votre participation à la loterie "${lotteryTitle}".</p>
          
          <div class="lottery-info">
            <div class="ticket">
              <h3>TICKET DE PARTICIPATION</h3>
            </div>
            <p>Le tirage au sort aura lieu dès que le seuil de participants sera atteint.</p>
            <p>Bonne chance ! 🍀</p>
          </div>
          
          <p>Vous recevrez un email si vous êtes l'heureux gagnant de cette loterie.</p>
          
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email est généré automatiquement, merci de ne pas y répondre.
          </div>
        </div>
      </body>
      </html>
    `,
    body: `Bonjour ${name},\n\nNous vous confirmons votre participation à la loterie "${lotteryTitle}". Bonne chance !\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  lotteryWinner: (name: string, lotteryTitle: string): EmailTemplate => ({
    subject: `🎉 Félicitations! Vous avez gagné la loterie "${lotteryTitle}" - WinShirt`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Félicitations - Vous avez gagné la loterie WinShirt</title>
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
            font-size: 28px;
            color: #003366;
            text-align: center;
          }
          p {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
          }
          .winner-announcement {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.3));
            border-radius: 15px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            border: 2px solid gold;
            text-align: center;
          }
          .trophy {
            font-size: 48px;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            margin-top: 1rem;
            padding: 12px 24px;
            background-color: #6c5ce7;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
          }
          .cta-button:hover {
            background-color: #5f50e6;
          }
          .confetti {
            font-size: 30px;
            text-align: center;
            margin: 20px 0;
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
          
          <div class="confetti">🎉 🎊 🎈 🎁</div>
          
          <h1>Félicitations, vous avez gagné !</h1>
          
          <div class="winner-announcement">
            <div class="trophy">🏆</div>
            <p style="font-size: 18px; font-weight: bold;">Bonjour ${name},</p>
            <p style="font-size: 18px;">Nous sommes heureux de vous annoncer que vous avez gagné la loterie</p>
            <p style="font-size: 20px; font-weight: bold; color: #6c5ce7;">"${lotteryTitle}"</p>
          </div>
          
          <p>Notre équipe va vous contacter très prochainement pour organiser la remise de votre prix.</p>
          
          <p style="text-align: center;">Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://winshirt.com/contact" class="cta-button">Contacter l'équipe WinShirt</a>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">Encore félicitations et merci de votre participation !</p>
          
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email est généré automatiquement, merci de ne pas y répondre.
          </div>
        </div>
      </body>
      </html>
    `,
    body: `Bonjour ${name},\n\nNous sommes heureux de vous annoncer que vous avez gagné la loterie "${lotteryTitle}" ! Nous vous contacterons prochainement pour vous remettre votre prix.\n\nBien cordialement,\nL'équipe WinShirt`
  }),
  
  // Admin notifications
  newOrderNotification: (orderId: string, total: number): EmailTemplate => ({
    subject: `Nouvelle commande #${orderId} - WinShirt`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Nouvelle commande - WinShirt</title>
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
            text-align: center;
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
          <h1>🎉 Nouvelle commande reçue !</h1>
          <p>Une nouvelle commande vient d'être enregistrée sur WinShirt.</p>
          <div class="order-summary">
            <p><strong>Commande n° :</strong> #${orderId}</p>
            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Total :</strong> ${total.toFixed(2)} €</p>
          </div>
          <p>Consulte les détails et prépare l'envoi depuis ton tableau de bord :</p>
          <div style="text-align: center;">
            <a href="https://winshirt.com/admin/orders/${orderId}" class="cta-button">Voir la commande</a>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Ce message est généré automatiquement suite à une nouvelle commande.
          </div>
        </div>
      </body>
      </html>
    `,
    body: `Une nouvelle commande #${orderId} a été passée pour un montant total de ${total.toFixed(2)}€.\n\nConsultez le backoffice pour plus de détails.`
  }),
  
  lowStockNotification: (productName: string, quantityLeft: number): EmailTemplate => ({
    subject: `Stock faible - ${productName} - WinShirt`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Alerte stock faible - WinShirt</title>
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
          .alert-box {
            background-color: rgba(255, 152, 0, 0.1);
            border-radius: 15px;
            padding: 1rem;
            margin: 1.5rem 0;
            border: 1px solid rgba(255, 152, 0, 0.3);
          }
          .stock-qty {
            font-size: 24px;
            font-weight: bold;
            color: #ff9800;
            text-align: center;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            margin-top: 1rem;
            padding: 12px 24px;
            background-color: #ff9800;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #e68a00;
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
          <h1>⚠️ Alerte stock faible</h1>
          <p>Attention, le produit suivant est en stock faible :</p>
          
          <div class="alert-box">
            <p style="font-weight: bold; font-size: 18px; text-align: center;">${productName}</p>
            <div class="stock-qty">
              ${quantityLeft} unités restantes
            </div>
          </div>
          
          <p>Pensez à réapprovisionner ce produit pour éviter toute rupture de stock.</p>
          
          <div style="text-align: center;">
            <a href="https://winshirt.com/admin/products" class="cta-button">Gérer les stocks</a>
          </div>
          
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Ce message est généré automatiquement suite à une détection de stock faible.
          </div>
        </div>
      </body>
      </html>
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
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Test Email - WinShirt</title>
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
          .test-section {
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 15px;
            padding: 1rem;
            margin: 1.5rem 0;
            border: 1px solid rgba(0, 0, 0, 0.05);
            text-align: center;
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
          <h1>Email de test WinShirt</h1>
          <p>Bonjour,</p>
          <div class="test-section">
            <p>Ceci est un email de test pour vérifier le système de notification.</p>
            <p>Si vous recevez ce message, le système d'email fonctionne correctement ! 👍</p>
          </div>
          <p>Vous pouvez maintenant configurer des notifications personnalisées pour votre plateforme.</p>
          <div class="footer">
            © ${new Date().getFullYear()} WinShirt — Tous droits réservés<br>
            Cet email est un test et ne requiert aucune action.
          </div>
        </div>
      </body>
      </html>
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
  static async sendAccountCreationEmail(email: string, name: string, order?: Order): Promise<boolean> {
    let template = emailTemplates.accountCreation(name);
    
    // Replace placeholders in the HTML template
    if (template.html) {
      template.html = template.html
        .replace(/{{email}}/g, email)
        .replace(/{{registrationDate}}/g, new Date().toLocaleDateString('fr-FR'));
        
      // Replace order placeholders if an order is provided
      if (order) {
        template.html = template.html
          .replace(/{{#if order}}/g, '')
          .replace(/{{\/if}}/g, '')
          .replace(/{{order\.id}}/g, order.id.toString())
          .replace(/{{order\.orderDate}}/g, new Date(order.orderDate).toLocaleDateString('fr-FR'))
          .replace(/{{order\.total}}/g, order.total.toFixed(2));
          
        // Format the order items
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const itemName = item.productName || 'Produit';
            const itemSize = item.size ? ` - ${item.size}` : '';
            const itemColor = item.color ? ` - ${item.color}` : '';
            
            itemsHtml += `
              <tr>
                <td>${itemName}${itemSize}${itemColor}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} €</td>
              </tr>
            `;
          });
          
          // Replace the items placeholder
          template.html = template.html.replace(/{{#each order.items}}[\s\S]*?{{\/each}}/g, itemsHtml);
        }
        
        // Replace shipping address
        if (order.shipping) {
          template.html = template.html
            .replace(/{{order\.shipping\.address}}/g, order.shipping.address || '')
            .replace(/{{order\.shipping\.postalCode}}/g, order.shipping.postalCode || '')
            .replace(/{{order\.shipping\.city}}/g, order.shipping.city || '')
            .replace(/{{order\.shipping\.country}}/g, order.shipping.country || '');
        }
      } else {
        // Remove the order section if no order is provided
        template.html = template.html.replace(/{{#if order}}[\s\S]*?{{\/if}}/g, '');
      }
    }
    
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

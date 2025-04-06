
import React from 'react';
import StarBackground from '@/components/StarBackground';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Conditions Générales</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Veuillez lire attentivement nos conditions générales avant d'utiliser nos services.
            </p>
          </div>
          
          <div className="winshirt-card p-8">
            <div className="prose prose-lg prose-invert max-w-none">
              <h2>Conditions Générales de Vente (CGV)</h2>
              
              <p>Dernière mise à jour : 6 avril 2025</p>
              
              <h3>1. Introduction</h3>
              <p>
                Bienvenue sur WinShirt. Les présentes Conditions Générales de Vente régissent votre utilisation de notre site web et les achats que vous y effectuez. En utilisant notre site ou en passant une commande, vous acceptez d'être lié par ces conditions.
              </p>
              
              <h3>2. Produits et Services</h3>
              <p>
                2.1. WinShirt propose à la vente des vêtements et accessoires personnalisables, ainsi que la participation à des loteries associées à ces produits.<br />
                2.2. Les images des produits sont présentées à titre illustratif seulement. De légères variations peuvent exister entre l'image affichée et le produit livré.<br />
                2.3. Nous nous réservons le droit de modifier notre gamme de produits à tout moment sans préavis.
              </p>
              
              <h3>3. Commandes et Paiements</h3>
              <p>
                3.1. Pour passer une commande, vous devez suivre le processus d'achat en ligne.<br />
                3.2. Toutes les commandes sont soumises à acceptation et disponibilité.<br />
                3.3. Les prix affichés incluent la TVA au taux applicable mais n'incluent pas les frais de livraison, qui sont indiqués séparément.<br />
                3.4. Le paiement doit être effectué au moment de la commande. Nous acceptons plusieurs méthodes de paiement comme indiqué sur notre site.
              </p>
              
              <h3>4. Livraison</h3>
              <p>
                4.1. Nous visons à livrer les produits dans les délais indiqués lors de la commande.<br />
                4.2. Les délais de livraison sont donnés à titre indicatif et peuvent varier.<br />
                4.3. Le risque de perte ou de dommage des produits vous est transféré à la livraison.
              </p>
              
              <h3>5. Loteries</h3>
              <p>
                5.1. La participation aux loteries est soumise à des règles spécifiques détaillées pour chaque tirage.<br />
                5.2. L'achat d'un produit avec des tickets de loterie constitue une participation valide aux tirages concernés.<br />
                5.3. Les gagnants seront notifiés par les moyens de contact fournis lors de l'achat.
              </p>
              
              <h3>6. Retours et Remboursements</h3>
              <p>
                6.1. Vous disposez d'un délai de 14 jours après réception pour retourner un produit non personnalisé.<br />
                6.2. Les produits personnalisés ne peuvent pas être retournés sauf en cas de défaut.<br />
                6.3. Les remboursements seront effectués en utilisant la même méthode de paiement que celle utilisée pour l'achat.
              </p>
              
              <h3>7. Propriété Intellectuelle</h3>
              <p>
                7.1. Tout le contenu du site, y compris logos, images, textes et designs, est la propriété de WinShirt ou de ses concédants.<br />
                7.2. En téléchargeant vos propres designs, vous garantissez détenir les droits nécessaires et nous accordez une licence d'utilisation pour la production de votre commande.
              </p>
              
              <h3>8. Limitation de Responsabilité</h3>
              <p>
                8.1. Notre responsabilité maximale pour toute réclamation découlant de ces Conditions est limitée au montant payé pour les produits concernés.<br />
                8.2. Nous ne sommes pas responsables des pertes indirectes, consécutives ou spéciales découlant de l'utilisation de nos services.
              </p>
              
              <h3>9. Modifications des Conditions</h3>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les nouvelles conditions s'appliqueront aux commandes passées après leur publication.
              </p>
              
              <h3>10. Loi Applicable</h3>
              <p>
                Ces conditions sont régies par la loi française. Tout litige sera soumis à la juridiction des tribunaux français.
              </p>
              
              <h3>11. Contact</h3>
              <p>
                Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse indiquée sur notre page Contact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsAndConditionsPage;

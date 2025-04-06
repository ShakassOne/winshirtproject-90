
import React from 'react';
import StarBackground from '@/components/StarBackground';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Politique de Confidentialité</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comment nous protégeons vos données personnelles et respectons votre vie privée.
            </p>
          </div>
          
          <div className="winshirt-card p-8">
            <div className="prose prose-lg prose-invert max-w-none">
              <h2>Politique de Confidentialité</h2>
              
              <p>Dernière mise à jour : 6 avril 2025</p>
              
              <h3>1. Introduction</h3>
              <p>
                Chez WinShirt, nous prenons la protection de vos données personnelles très au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
              </p>
              
              <h3>2. Informations que nous collectons</h3>
              <p>
                2.1. <strong>Informations que vous nous fournissez :</strong> Nom, adresse, email, numéro de téléphone, informations de paiement lors de la création d'un compte ou d'une commande.<br />
                2.2. <strong>Informations collectées automatiquement :</strong> Données de navigation, adresse IP, type de navigateur, temps passé sur le site et pages visitées.<br />
                2.3. <strong>Designs et contenus utilisateur :</strong> Images et designs que vous téléchargez pour personnaliser vos produits.
              </p>
              
              <h3>3. Utilisation de vos informations</h3>
              <p>
                Nous utilisons vos informations pour :<br />
                - Traiter et livrer vos commandes<br />
                - Gérer votre compte<br />
                - Vous informer sur vos participations aux loteries<br />
                - Améliorer notre site et nos services<br />
                - Communiquer avec vous concernant des offres spéciales ou de nouveaux produits<br />
                - Prévenir les fraudes et activités illégales
              </p>
              
              <h3>4. Partage de vos informations</h3>
              <p>
                Nous pouvons partager vos informations avec :<br />
                - Des prestataires de services qui nous aident à exploiter notre site et à fournir nos services (production, livraison, traitement des paiements)<br />
                - Des autorités légales si nous y sommes légalement obligés<br />
                - Des partenaires commerciaux après avoir obtenu votre consentement
              </p>
              
              <h3>5. Sécurité des données</h3>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre l'accès non autorisé, la perte ou l'altération. Cependant, aucune méthode de transmission sur Internet n'est totalement sécurisée.
              </p>
              
              <h3>6. Vos droits</h3>
              <p>
                Conformément au RGPD, vous avez le droit :<br />
                - D'accéder à vos données<br />
                - De rectifier vos données<br />
                - De supprimer vos données<br />
                - De limiter le traitement de vos données<br />
                - De vous opposer au traitement<br />
                - À la portabilité des données<br />
                - De retirer votre consentement
              </p>
              
              <h3>7. Cookies et technologies similaires</h3>
              <p>
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences concernant les cookies via les paramètres de votre navigateur.
              </p>
              
              <h3>8. Conservation des données</h3>
              <p>
                Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services, respecter nos obligations légales, résoudre les litiges et faire respecter nos accords.
              </p>
              
              <h3>9. Transferts internationaux</h3>
              <p>
                Vos données peuvent être transférées et traitées dans des pays autres que celui où vous résidez. Dans ce cas, nous prenons des mesures pour garantir un niveau adéquat de protection.
              </p>
              
              <h3>10. Modifications de cette politique</h3>
              <p>
                Nous pouvons modifier cette politique de confidentialité de temps à autre. La version la plus récente sera toujours disponible sur notre site.
              </p>
              
              <h3>11. Contact</h3>
              <p>
                Pour toute question concernant cette politique ou pour exercer vos droits, veuillez nous contacter à l'adresse indiquée sur notre page Contact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicyPage;

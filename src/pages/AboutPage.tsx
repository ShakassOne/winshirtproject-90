
import React from 'react';
import StarBackground from '@/components/StarBackground';

const AboutPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">À Propos de WinShirt</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez notre histoire et notre mission.
            </p>
          </div>
          
          <div className="winshirt-card p-8">
            <div className="prose prose-lg prose-invert max-w-none">
              <h2>Notre histoire</h2>
              <p>
                Fondée en 2025, WinShirt est née d'une idée simple : et si acheter un t-shirt pouvait être plus 
                qu'une simple transaction ? Et si cela pouvait devenir une expérience excitante avec la 
                possibilité de gagner des prix exceptionnels ?
              </p>
              
              <p>
                Notre fondateur, passionné à la fois par la mode et les jeux, a développé ce concept unique
                qui allie vêtements de qualité et tirages au sort exclusifs. Depuis, notre équipe n'a cessé 
                de grandir, partageant tous la même vision : rendre chaque achat spécial.
              </p>
              
              <h2 className="mt-8">Notre mission</h2>
              <p>
                Chez WinShirt, notre mission est double : proposer des vêtements de qualité, fabriqués 
                dans le respect de l'environnement et des conditions de travail équitables, tout en offrant 
                à nos clients une expérience d'achat unique et divertissante.
              </p>
              
              <p>
                Nous croyons fermement que le commerce en ligne peut être plus qu'une simple transaction.
                Il peut être une aventure, un moment d'excitation et une opportunité de gagner bien plus 
                que ce que l'on a acheté.
              </p>
              
              <h2 className="mt-8">Nos valeurs</h2>
              <ul>
                <li>
                  <strong>Qualité</strong> - Nos produits sont fabriqués avec les meilleurs matériaux
                  pour garantir confort et durabilité.
                </li>
                <li>
                  <strong>Transparence</strong> - Nous sommes honnêtes sur nos produits, nos loteries
                  et nos processus.
                </li>
                <li>
                  <strong>Innovation</strong> - Nous cherchons constamment à améliorer notre concept
                  et à offrir de nouvelles expériences à nos clients.
                </li>
                <li>
                  <strong>Responsabilité</strong> - Nous nous engageons à minimiser notre impact
                  environnemental et à promouvoir des pratiques commerciales éthiques.
                </li>
              </ul>
              
              <h2 className="mt-8">Notre équipe</h2>
              <p>
                Notre équipe est composée de passionnés de mode, de technologie et de marketing,
                tous unis par la volonté de créer quelque chose de différent dans le monde du e-commerce.
                Chaque membre apporte son expertise unique pour faire de WinShirt une expérience
                inoubliable pour nos clients.
              </p>
              
              <p>
                Nous sommes constamment à la recherche de nouveaux talents pour rejoindre notre aventure.
                Si vous êtes intéressés, n'hésitez pas à consulter notre page Carrières.
              </p>
              
              <h2 className="mt-8">Contactez-nous</h2>
              <p>
                Vous avez des questions, des suggestions ou simplement envie de nous dire bonjour ?
                N'hésitez pas à nous contacter via notre page de contact ou à nous suivre sur les réseaux sociaux.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

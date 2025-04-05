
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
              {/* Le contenu sera édité manuellement */}
              <p className="text-gray-300">
                Contenu des conditions générales à remplir...
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsAndConditionsPage;

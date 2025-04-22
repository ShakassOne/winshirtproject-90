
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomeIntroConfig, getHomeIntroConfig, getDefaultHomeIntroConfig } from '@/lib/supabase';

const HomeIntroSlider: React.FC = () => {
  const [config, setConfig] = useState<HomeIntroConfig | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement de la configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getHomeIntroConfig();
        setConfig(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
        setConfig(getDefaultHomeIntroConfig());
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Navigation entre les slides
  const goToNextSlide = useCallback(() => {
    if (!config) return;
    setCurrentSlideIndex((prevIndex) => 
      prevIndex === config.slides.length - 1 ? 0 : prevIndex + 1
    );
  }, [config]);

  const goToPrevSlide = useCallback(() => {
    if (!config) return;
    setCurrentSlideIndex((prevIndex) => 
      prevIndex === 0 ? config.slides.length - 1 : prevIndex - 1
    );
  }, [config]);

  // Défilement automatique
  useEffect(() => {
    if (!config || !config.autoPlay) return;
    
    const interval = setInterval(() => {
      goToNextSlide();
    }, config.transitionTime);
    
    return () => clearInterval(interval);
  }, [config, goToNextSlide]);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-winshirt-space fullscreen-slider">
        <div className="white-text">Chargement...</div>
      </div>
    );
  }

  // Fallback si pas de configuration
  if (!config || config.slides.length === 0) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-winshirt-space fullscreen-slider">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Achetez des vêtements, <br />Gagnez des cadeaux incroyables
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            WinShirt révolutionne le shopping en ligne. Achetez nos vêtements de qualité et participez automatiquement à nos loteries exclusives pour gagner des prix exceptionnels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir les produits
              </Button>
            </Link>
            <Link to="/lotteries">
              <Button className="bg-winshirt-blue hover:bg-winshirt-blue-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                Voir les loteries
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Tri des slides par ordre
  const sortedSlides = [...config.slides].sort((a, b) => a.order - b.order);
  const currentSlide = sortedSlides[currentSlideIndex];

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden fullscreen-slider">
      {/* Slides */}
      {sortedSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 ${
            index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: slide.textColor,
          }}
        >
          <div className="max-w-5xl mx-auto text-center px-4 z-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: slide.textColor }}>
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto" style={{ color: slide.textColor }}>
              {slide.subtitle}
            </p>
            {slide.buttonText && (
              <Link to={slide.buttonLink}>
                <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                  {slide.buttonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      {config.showButtons && (
        <>
          <Button
            onClick={goToPrevSlide}
            className="absolute left-5 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full h-12 w-12 white-text"
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            onClick={goToNextSlide}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full h-12 w-12 white-text"
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {config.showIndicators && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2 z-20">
          {sortedSlides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentSlideIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlideIndex(index)}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll down arrow */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20">
        <svg 
          className="animate-bounce w-6 h-6 white-text" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default HomeIntroSlider;

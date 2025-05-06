
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomeIntroConfig, getHomeIntroConfig, getDefaultHomeIntroConfig } from '@/lib/supabase';

const HomeIntroSlider: React.FC = () => {
  const [slides, setSlides] = useState<HomeIntroConfig['slides']>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [transitionTime, setTransitionTime] = useState(5000); // Default 5s
  const [showButtons, setShowButtons] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getHomeIntroConfig();
        setSlides(config.slides);
        setAutoPlay(config.autoPlay);
        setTransitionTime(config.transitionTime);
        setShowButtons(config.showButtons);
        setShowIndicators(config.showIndicators);
      } catch (error) {
        console.error('Error loading intro config:', error);
        const defaultConfig = getDefaultHomeIntroConfig();
        setSlides(defaultConfig.slides);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(current => (current + 1) % slides.length);
    }, transitionTime);
    
    return () => clearInterval(interval);
  }, [autoPlay, currentSlide, slides.length, transitionTime]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentSlide(current => (current === 0 ? slides.length - 1 : current - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide(current => (current + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] lg:h-[80vh] bg-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white max-w-4xl"
              style={{ color: slide.textColor }}
            >
              {slide.title}
            </h1>
            <p 
              className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl"
              style={{ color: slide.textColor }}
            >
              {slide.subtitle}
            </p>
            {slide.buttonText && slide.buttonLink && (
              <Button asChild size="lg" className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-lg">
                <Link to={slide.buttonLink}>
                  {slide.buttonText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      {showButtons && slides.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 border-white/40 text-white rounded-full hover:bg-black/50 z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            onClick={goToNext}
            variant="outline" 
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 border-white/40 text-white rounded-full hover:bg-black/50 z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0">
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40'
                } hover:bg-white/80 transition-colors`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeIntroSlider;

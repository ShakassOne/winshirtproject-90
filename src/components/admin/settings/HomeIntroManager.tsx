import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Eye, Move, Image } from 'lucide-react';
import { toast } from '@/lib/toast';
import { HomeIntroConfig, SlideType, getHomeIntroConfig, saveHomeIntroConfig, uploadImage } from '@/lib/supabase';

const HomeIntroManager: React.FC = () => {
  const [config, setConfig] = useState<HomeIntroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('slides');
  const [previewMode, setPreviewMode] = useState(false);

  // Chargement de la configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getHomeIntroConfig();
        setConfig(data);
        if (data?.slides && data.slides.length > 0) {
          setActiveSlideId(data.slides[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
        toast.error("Erreur lors du chargement de la configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Sauvegarde de la configuration
  const handleSave = async () => {
    if (!config) return;

    try {
      // Fix: Don't test void for truthiness
      saveHomeIntroConfig(config);
      toast.success("Configuration enregistrée avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la configuration");
    }
  };

  // Ajouter un nouveau slide
  const handleAddSlide = () => {
    if (!config) return;

    const newSlideId = Math.max(0, ...config.slides.map(s => s.id)) + 1;
    const newSlide: SlideType = {
      id: newSlideId,
      title: "Nouveau slide",
      subtitle: "Description du nouveau slide",
      buttonText: "En savoir plus",
      buttonLink: "/",
      backgroundImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      textColor: "#FFFFFF",
      order: config.slides.length + 1
    };

    setConfig({
      ...config,
      slides: [...config.slides, newSlide]
    });
    setActiveSlideId(newSlideId);
    setActiveTab('slides');
  };

  // Supprimer un slide
  const handleDeleteSlide = (id: number) => {
    if (!config) return;

    if (config.slides.length <= 1) {
      toast.error("Vous devez conserver au moins un slide");
      return;
    }

    const newSlides = config.slides.filter(slide => slide.id !== id);
    
    // Réordonner les slides restants
    const orderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }));

    setConfig({
      ...config,
      slides: orderedSlides
    });

    // Sélectionner le premier slide si le slide actif a été supprimé
    if (activeSlideId === id && newSlides.length > 0) {
      setActiveSlideId(newSlides[0].id);
    }
  };

  // Mettre à jour un slide
  const handleUpdateSlide = (id: number, field: keyof SlideType, value: string | number) => {
    if (!config) return;

    const updatedSlides = config.slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    );

    setConfig({
      ...config,
      slides: updatedSlides
    });
  };

  // Upload d'image pour le background
  const handleImageUpload = async (id: number, file: File) => {
    try {
      const imageUrl = await uploadImage(file, 'slides');
      if (imageUrl) {
        handleUpdateSlide(id, 'backgroundImage', imageUrl);
        toast.success("Image téléchargée avec succès");
      } else {
        toast.error("Erreur lors du téléchargement de l'image");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    }
  };

  // Modifier les paramètres généraux
  const handleSettingsChange = (setting: keyof HomeIntroConfig, value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      [setting]: value
    });
  };

  // Réorganiser les slides
  const handleMoveSlide = (id: number, direction: 'up' | 'down') => {
    if (!config) return;

    const slideIndex = config.slides.findIndex(slide => slide.id === id);
    if (slideIndex === -1) return;

    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    // Vérifier les limites
    if (newIndex < 0 || newIndex >= config.slides.length) return;

    // Échanger les positions
    const newSlides = [...config.slides];
    const temp = newSlides[slideIndex].order;
    newSlides[slideIndex].order = newSlides[newIndex].order;
    newSlides[newIndex].order = temp;

    // Trier par ordre
    newSlides.sort((a, b) => a.order - b.order);

    setConfig({
      ...config,
      slides: newSlides
    });
  };

  if (isLoading) {
    return (
      <Card className="winshirt-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-white">Chargement des configurations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="winshirt-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-white">Erreur: Impossible de charger la configuration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSlide = config.slides.find(slide => slide.id === activeSlideId);

  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Configuration de l'intro de la page d'accueil</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Éditer" : "Aperçu"}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Enregistrer
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {previewMode ? (
          <div className="bg-winshirt-space-light p-4 rounded-md">
            <h3 className="text-white mb-4">Aperçu du slider</h3>
            <div className="h-[400px] relative overflow-hidden rounded-md">
              {config.slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className="absolute inset-0 flex flex-col justify-center items-center text-center p-8"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: slide.textColor,
                    display: index === 0 ? 'flex' : 'none'
                  }}
                >
                  <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl mb-8">{slide.subtitle}</p>
                  {slide.buttonText && (
                    <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                      {slide.buttonText}
                    </Button>
                  )}
                </div>
              ))}
              
              {config.showIndicators && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {config.slides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="slides" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Slides
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-winshirt-purple data-[state=active]:text-white">
                Paramètres
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="slides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 bg-winshirt-space-light p-4 rounded-md">
                  <h3 className="text-white mb-4">Liste des slides</h3>
                  <div className="space-y-2">
                    {config.slides.map(slide => (
                      <div 
                        key={slide.id}
                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${activeSlideId === slide.id ? 'bg-winshirt-purple/30 border border-winshirt-purple/50' : 'bg-winshirt-space hover:bg-winshirt-space-light/80'}`}
                        onClick={() => setActiveSlideId(slide.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-10 w-10 rounded-md bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                          ></div>
                          <span className="text-white truncate max-w-[100px]">{slide.title}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSlide(slide.id, 'up');
                            }}
                            disabled={slide.order === 1}
                          >
                            <Move className="h-4 w-4 rotate-90" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlide(slide.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4 bg-winshirt-purple/20 hover:bg-winshirt-purple/30 text-winshirt-purple-light"
                    onClick={handleAddSlide}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un slide
                  </Button>
                </div>
                
                <div className="col-span-2 bg-winshirt-space-light p-4 rounded-md">
                  <h3 className="text-white mb-4">Éditer le slide</h3>
                  {activeSlide ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-white">Titre</Label>
                        <Input
                          id="title"
                          value={activeSlide.title}
                          onChange={(e) => handleUpdateSlide(activeSlide.id, 'title', e.target.value)}
                          className="bg-winshirt-space border-winshirt-purple/30 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subtitle" className="text-white">Sous-titre</Label>
                        <Input
                          id="subtitle"
                          value={activeSlide.subtitle}
                          onChange={(e) => handleUpdateSlide(activeSlide.id, 'subtitle', e.target.value)}
                          className="bg-winshirt-space border-winshirt-purple/30 text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buttonText" className="text-white">Texte du bouton</Label>
                          <Input
                            id="buttonText"
                            value={activeSlide.buttonText}
                            onChange={(e) => handleUpdateSlide(activeSlide.id, 'buttonText', e.target.value)}
                            className="bg-winshirt-space border-winshirt-purple/30 text-white"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="buttonLink" className="text-white">Lien du bouton</Label>
                          <Input
                            id="buttonLink"
                            value={activeSlide.buttonLink}
                            onChange={(e) => handleUpdateSlide(activeSlide.id, 'buttonLink', e.target.value)}
                            className="bg-winshirt-space border-winshirt-purple/30 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="textColor" className="text-white">Couleur du texte</Label>
                        <div className="flex gap-2">
                          <Input
                            id="textColor"
                            type="text"
                            value={activeSlide.textColor}
                            onChange={(e) => handleUpdateSlide(activeSlide.id, 'textColor', e.target.value)}
                            className="bg-winshirt-space border-winshirt-purple/30 text-white"
                          />
                          <Input
                            type="color"
                            value={activeSlide.textColor}
                            onChange={(e) => handleUpdateSlide(activeSlide.id, 'textColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-white">Image de fond</Label>
                        <div className="mt-2">
                          <div 
                            className="h-40 w-full rounded-md bg-cover bg-center mb-4 relative"
                            style={{ backgroundImage: `url(${activeSlide.backgroundImage})` }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="outline" className="bg-white/10 border-white">
                                    <Image className="h-4 w-4 mr-2" />
                                    Changer l'image
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-winshirt-space-light border-winshirt-purple/30">
                                  <SheetHeader>
                                    <SheetTitle className="text-white">Sélectionner une image</SheetTitle>
                                    <SheetDescription className="text-gray-400">
                                      Téléchargez une image ou choisissez parmi les images prédéfinies.
                                    </SheetDescription>
                                  </SheetHeader>
                                  
                                  <div className="py-6">
                                    <Label className="text-white block mb-2">Télécharger une image</Label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="bg-winshirt-space border-winshirt-purple/30 text-white"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(activeSlide.id, file);
                                        }
                                      }}
                                    />
                                    
                                    <div className="mt-6">
                                      <Label className="text-white block mb-2">Images prédéfinies</Label>
                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                        {[
                                          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
                                          "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
                                          "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
                                          "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                                          "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
                                          "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
                                        ].map((img) => (
                                          <div 
                                            key={img}
                                            className="h-24 rounded-md bg-cover bg-center cursor-pointer hover:ring-2 hover:ring-winshirt-purple-light"
                                            style={{ backgroundImage: `url(${img})` }}
                                            onClick={() => {
                                              handleUpdateSlide(activeSlide.id, 'backgroundImage', img);
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <SheetFooter>
                                    <SheetClose asChild>
                                      <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark">
                                        Fermer
                                      </Button>
                                    </SheetClose>
                                  </SheetFooter>
                                </SheetContent>
                              </Sheet>
                            </div>
                          </div>
                          <Input
                            value={activeSlide.backgroundImage}
                            onChange={(e) => handleUpdateSlide(activeSlide.id, 'backgroundImage', e.target.value)}
                            className="bg-winshirt-space border-winshirt-purple/30 text-white"
                            placeholder="URL de l'image de fond"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-gray-400">Sélectionnez un slide à éditer</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-winshirt-space-light p-6 rounded-md">
                <h3 className="text-white mb-6">Paramètres du slider</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-white mb-4 flex justify-between">
                      <span>Temps de transition (secondes): {config.transitionTime / 1000}</span>
                    </Label>
                    <Slider
                      value={[config.transitionTime / 1000]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={(value) => handleSettingsChange('transitionTime', value[0] * 1000)}
                      className="my-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoPlay" className="text-white">
                      Lecture automatique
                    </Label>
                    <Switch
                      id="autoPlay"
                      checked={config.autoPlay}
                      onCheckedChange={(checked) => handleSettingsChange('autoPlay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showButtons" className="text-white">
                      Afficher les boutons de navigation
                    </Label>
                    <Switch
                      id="showButtons"
                      checked={config.showButtons}
                      onCheckedChange={(checked) => handleSettingsChange('showButtons', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showIndicators" className="text-white">
                      Afficher les indicateurs de slide
                    </Label>
                    <Switch
                      id="showIndicators"
                      checked={config.showIndicators}
                      onCheckedChange={(checked) => handleSettingsChange('showIndicators', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
        >
          Enregistrer les modifications
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HomeIntroManager;

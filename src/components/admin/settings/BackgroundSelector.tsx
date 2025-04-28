
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Image as ImageIcon, Stars, Upload, Globe } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { BackgroundSetting } from '@/types/background';
import { predefinedBackgrounds, saveBackgroundSetting, getBackgroundSetting, removeBackgroundSetting } from '@/services/backgroundService';
import { toast } from '@/lib/toast';

interface BackgroundSelectorProps {
  pageId: string;
  pageTitle?: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ pageId, pageTitle = "cette page" }) => {
  const [currentTab, setCurrentTab] = useState<string>('color');
  const [customBackground, setCustomBackground] = useState<BackgroundSetting>({
    pageId,
    type: 'color',
    value: predefinedBackgrounds.colors[0].value,
    opacity: 1
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Charger les paramètres existants au chargement
  useEffect(() => {
    const savedSetting = getBackgroundSetting(pageId);
    if (savedSetting) {
      setCustomBackground(savedSetting);
      setCurrentTab(savedSetting.type);
      if (savedSetting.type === 'image' && savedSetting.value) {
        setImageUrl(savedSetting.value);
      }
    }
  }, [pageId]);
  
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setCustomBackground({
      ...customBackground,
      type: value as 'color' | 'image' | 'stars',
      // Valeurs par défaut pour chaque type
      value: value === 'color' ? predefinedBackgrounds.colors[0].value : 
             value === 'image' ? predefinedBackgrounds.images[0].value : ''
    });
  };
  
  const handleOpacityChange = (value: number[]) => {
    setCustomBackground({
      ...customBackground,
      opacity: value[0]
    });
  };
  
  const handleSelectColor = (color: string) => {
    setCustomBackground({
      ...customBackground,
      value: color
    });
  };
  
  const handleSelectImage = (imageUrl: string) => {
    setCustomBackground({
      ...customBackground,
      value: imageUrl
    });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const handleApplyCustomUrl = () => {
    if (imageUrl) {
      setCustomBackground({
        ...customBackground,
        value: imageUrl
      });
      toast.success("URL d'image appliquée");
    } else {
      toast.error("Veuillez entrer une URL d'image valide");
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for the uploaded file
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      setCustomBackground({
        ...customBackground,
        value: tempUrl
      });
      toast.success("Image téléchargée avec succès");
      
      // In a real application, you would upload the file to your server here
      // and get a permanent URL back
      // For now we're just using the temporary URL
    }
  };
  
  const handleSaveBackground = () => {
    saveBackgroundSetting(pageId, customBackground);
  };
  
  const handleResetBackground = () => {
    removeBackgroundSetting(pageId);
    setCustomBackground({
      pageId,
      type: 'stars',
      value: '',
      opacity: 1
    });
    setCurrentTab('stars');
    setImageUrl('');
  };
  
  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-white">Fond d'écran pour {pageTitle}</h3>
      
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="color" className="flex items-center gap-1">
            <Palette size={16} /> Couleur
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-1">
            <ImageIcon size={16} /> Image
          </TabsTrigger>
          <TabsTrigger value="stars" className="flex items-center gap-1">
            <Stars size={16} /> Étoiles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="color" className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {predefinedBackgrounds.colors.map((color, index) => (
              <div 
                key={index}
                onClick={() => handleSelectColor(color.value)}
                className={`h-12 rounded cursor-pointer transition-all ${customBackground.value === color.value ? 'ring-2 ring-winshirt-purple ring-offset-2 ring-offset-background' : 'hover:scale-105'}`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <div className="space-y-4">
            {/* Custom URL Input */}
            <div className="space-y-2">
              <Label htmlFor="image-url" className="text-sm text-gray-400">URL personnalisée</Label>
              <div className="flex gap-2">
                <Input 
                  id="image-url" 
                  value={imageUrl} 
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCustomUrl} 
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Globe size={16} className="mr-1" /> Appliquer
                </Button>
              </div>
            </div>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-sm text-gray-400">Télécharger une image</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload size={16} className="mr-2" /> Télécharger une image
                </Button>
              </div>
            </div>
            
            <div className="my-4 border-t border-gray-700"></div>
            
            <Label className="text-sm text-gray-400 block mb-2">Images prédéfinies</Label>
            <RadioGroup value={customBackground.value} onValueChange={handleSelectImage}>
              <div className="grid grid-cols-2 gap-3">
                {predefinedBackgrounds.images.map((image, index) => (
                  <div key={index} className="relative">
                    <RadioGroupItem 
                      value={image.value} 
                      id={`image-${index}`} 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor={`image-${index}`}
                      className={`block cursor-pointer overflow-hidden rounded-lg ${
                        customBackground.value === image.value ? 'ring-2 ring-winshirt-purple' : ''
                      }`}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img 
                          src={image.value} 
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <span className="text-xs text-white">{image.name}</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
        
        <TabsContent value="stars" className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <Stars size={40} className="mx-auto mb-2 text-winshirt-purple opacity-70" />
              <p className="text-gray-400">Fond d'écran étoilé par défaut</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {customBackground.type !== 'stars' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="opacity">Opacité</Label>
            <span className="text-sm text-gray-400">{Math.round((customBackground.opacity || 1) * 100)}%</span>
          </div>
          <Slider
            id="opacity"
            defaultValue={[customBackground.opacity || 1]}
            max={1}
            step={0.01}
            onValueChange={handleOpacityChange}
          />
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleResetBackground}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Réinitialiser
        </Button>
        <Button 
          onClick={handleSaveBackground}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
        >
          Appliquer
        </Button>
      </div>
    </Card>
  );
};

export default BackgroundSelector;

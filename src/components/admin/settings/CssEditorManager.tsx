
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PaintBucket, Code, Save, Undo, RefreshCw, ArrowUpDown, Check, FileCode, Image, Box, Palette } from 'lucide-react';
import { showNotification } from '@/lib/notifications';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface CssVariable {
  name: string;
  value: string;
  originalValue: string;
  description: string;
  category: 'colors' | 'spacing' | 'typography' | 'other' | 'backgrounds' | 'containers';
}

interface CssEditorManagerProps {
  showAdvancedSettings?: boolean;
}

const CssEditorManager: React.FC<CssEditorManagerProps> = ({ showAdvancedSettings = false }) => {
  const [cssVariables, setCssVariables] = useState<CssVariable[]>([]);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const [isChanged, setIsChanged] = useState(false);
  const [cssCode, setCssCode] = useState<string>('');
  const [originalCssCode, setOriginalCssCode] = useState<string>('');
  const [isCssCodeChanged, setIsCssCodeChanged] = useState(false);
  const [editorMode, setEditorMode] = useState<'variables' | 'code'>(showAdvancedSettings ? 'code' : 'variables');
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(100);
  const [containerRadius, setContainerRadius] = useState<number>(12);
  const [containerBlur, setContainerBlur] = useState<number>(8);
  const [containerOpacity, setContainerOpacity] = useState<number>(40);
  const [containerBorder, setContainerBorder] = useState<string>('rgba(155, 135, 245, 0.3)');
  
  // Load CSS variables and custom CSS on component mount
  useEffect(() => {
    loadCssVariables();
    loadCustomCss();
    
    // Appliquer le CSS personnalisé dès le chargement du composant
    applyCustomCssOnLoad();
    
    // Charger les paramètres d'arrière-plan et de conteneur
    loadBackgroundSettings();
  }, []);
  
  const loadBackgroundSettings = () => {
    try {
      const bgSettings = localStorage.getItem('winshirt-background-settings');
      if (bgSettings) {
        const settings = JSON.parse(bgSettings);
        if (settings.backgroundImage) setBackgroundPreview(settings.backgroundImage);
        if (settings.backgroundOpacity) setBackgroundOpacity(Number(settings.backgroundOpacity));
        if (settings.containerRadius) setContainerRadius(Number(settings.containerRadius));
        if (settings.containerBlur) setContainerBlur(Number(settings.containerBlur));
        if (settings.containerOpacity) setContainerOpacity(Number(settings.containerOpacity));
        if (settings.containerBorder) setContainerBorder(settings.containerBorder);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres d\'arrière-plan:', error);
    }
  };
  
  const loadCssVariables = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Essayer de charger les variables CSS depuis le localStorage
    try {
      const savedSettings = localStorage.getItem('winshirt-css-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Appliquer les variables sauvegardées
        Object.entries(settings).forEach(([name, value]) => {
          root.style.setProperty(name, value as string);
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des variables CSS:', error);
    }
    
    const winshirtVariables: CssVariable[] = [
      // Couleurs
      { name: '--winshirt-purple', value: computedStyle.getPropertyValue('--winshirt-purple').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple').trim(), description: 'Couleur principale', category: 'colors' },
      { name: '--winshirt-purple-light', value: computedStyle.getPropertyValue('--winshirt-purple-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple-light').trim(), description: 'Couleur principale claire', category: 'colors' },
      { name: '--winshirt-purple-dark', value: computedStyle.getPropertyValue('--winshirt-purple-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple-dark').trim(), description: 'Couleur principale foncée', category: 'colors' },
      { name: '--winshirt-blue', value: computedStyle.getPropertyValue('--winshirt-blue').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue').trim(), description: 'Couleur secondaire', category: 'colors' },
      { name: '--winshirt-blue-light', value: computedStyle.getPropertyValue('--winshirt-blue-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue-light').trim(), description: 'Couleur secondaire claire', category: 'colors' },
      { name: '--winshirt-blue-dark', value: computedStyle.getPropertyValue('--winshirt-blue-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue-dark').trim(), description: 'Couleur secondaire foncée', category: 'colors' },
      
      // Arrière-plans
      { name: '--winshirt-space', value: computedStyle.getPropertyValue('--winshirt-space').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space').trim(), description: 'Couleur de fond principale', category: 'backgrounds' },
      { name: '--winshirt-space-light', value: computedStyle.getPropertyValue('--winshirt-space-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space-light').trim(), description: 'Couleur de fond secondaire', category: 'backgrounds' },
      { name: '--winshirt-space-dark', value: computedStyle.getPropertyValue('--winshirt-space-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space-dark').trim(), description: 'Couleur de fond sombre', category: 'backgrounds' },
      { name: '--background-image', value: backgroundPreview || 'none', originalValue: backgroundPreview || 'none', description: 'Image d\'arrière-plan', category: 'backgrounds' },
      { name: '--background-opacity', value: `${backgroundOpacity}%`, originalValue: `${backgroundOpacity}%`, description: 'Opacité de l\'arrière-plan', category: 'backgrounds' },
      
      // Conteneurs
      { name: '--container-radius', value: `${containerRadius}px`, originalValue: `${containerRadius}px`, description: 'Rayon des coins des conteneurs', category: 'containers' },
      { name: '--container-blur', value: `${containerBlur}px`, originalValue: `${containerBlur}px`, description: 'Flou des conteneurs (effet verre)', category: 'containers' },
      { name: '--container-opacity', value: `${containerOpacity}%`, originalValue: `${containerOpacity}%`, description: 'Opacité des conteneurs', category: 'containers' },
      { name: '--container-border', value: containerBorder, originalValue: containerBorder, description: 'Couleur de bordure des conteneurs', category: 'containers' },
      
      // Typography variables
      { name: '--font-size-base', value: '1rem', originalValue: '1rem', description: 'Taille de police de base', category: 'typography' },
      { name: '--font-size-lg', value: '1.125rem', originalValue: '1.125rem', description: 'Grande taille de police', category: 'typography' },
      { name: '--font-size-xl', value: '1.25rem', originalValue: '1.25rem', description: 'Très grande taille de police', category: 'typography' },
      { name: '--font-size-2xl', value: '1.5rem', originalValue: '1.5rem', description: 'Taille de titre', category: 'typography' },
      { name: '--font-weight-normal', value: '400', originalValue: '400', description: 'Poids de police normal', category: 'typography' },
      { name: '--font-weight-medium', value: '500', originalValue: '500', description: 'Poids de police moyen', category: 'typography' },
      { name: '--font-weight-bold', value: '700', originalValue: '700', description: 'Poids de police gras', category: 'typography' },
      
      // Spacing variables
      { name: '--spacing-xs', value: '0.25rem', originalValue: '0.25rem', description: 'Espacement très petit', category: 'spacing' },
      { name: '--spacing-sm', value: '0.5rem', originalValue: '0.5rem', description: 'Espacement petit', category: 'spacing' },
      { name: '--spacing-md', value: '1rem', originalValue: '1rem', description: 'Espacement moyen', category: 'spacing' },
      { name: '--spacing-lg', value: '1.5rem', originalValue: '1.5rem', description: 'Espacement grand', category: 'spacing' },
      { name: '--spacing-xl', value: '2rem', originalValue: '2rem', description: 'Espacement très grand', category: 'spacing' },
      { name: '--radius-sm', value: '0.25rem', originalValue: '0.25rem', description: 'Rayon des coins petit', category: 'spacing' },
      { name: '--radius-md', value: '0.5rem', originalValue: '0.5rem', description: 'Rayon des coins moyen', category: 'spacing' },
      { name: '--radius-lg', value: '0.75rem', originalValue: '0.75rem', description: 'Rayon des coins grand', category: 'spacing' },
      
      // Other UI variables
      { name: '--shadow-sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', originalValue: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', description: 'Ombre légère', category: 'other' },
      { name: '--shadow-md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', originalValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', description: 'Ombre moyenne', category: 'other' },
      { name: '--shadow-lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', originalValue: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', description: 'Ombre grande', category: 'other' },
      { name: '--transition-base', value: '0.2s ease-in-out', originalValue: '0.2s ease-in-out', description: 'Transition de base', category: 'other' },
    ];
    
    setCssVariables(winshirtVariables);
  };
  
  const loadCustomCss = () => {
    // Récupérer le CSS personnalisé depuis le localStorage
    const customCss = localStorage.getItem('winshirt-custom-css') || '';
    setCssCode(customCss);
    setOriginalCssCode(customCss);
  };
  
  // Nouvelle fonction pour appliquer le CSS personnalisé au chargement
  const applyCustomCssOnLoad = () => {
    try {
      const customCss = localStorage.getItem('winshirt-custom-css');
      if (customCss) {
        // Supprimer l'ancien style personnalisé s'il existe
        const existingStyle = document.getElementById('winshirt-custom-css');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Créer et ajouter le nouveau style
        const styleEl = document.createElement('style');
        styleEl.id = 'winshirt-custom-css';
        styleEl.textContent = customCss;
        document.head.appendChild(styleEl);
        
        console.log('CSS personnalisé appliqué au chargement:', customCss);
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du CSS personnalisé au chargement:', error);
    }
  };
  
  const handleInputChange = (index: number, value: string) => {
    const updatedVariables = [...cssVariables];
    updatedVariables[index].value = value;
    setCssVariables(updatedVariables);
    
    // Check if any variable has been changed from its original value
    const hasChanges = updatedVariables.some(v => v.value !== v.originalValue);
    setIsChanged(hasChanges);
  };
  
  const handleCssCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCssCode = e.target.value;
    setCssCode(newCssCode);
    setIsCssCodeChanged(newCssCode !== originalCssCode);
  };
  
  // Fonction pour appliquer le code CSS personnalisé
  const applyCustomCss = () => {
    try {
      // Supprimer l'ancien style personnalisé s'il existe
      const existingStyle = document.getElementById('winshirt-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Créer et ajouter le nouveau style
      if (cssCode) {
        const styleEl = document.createElement('style');
        styleEl.id = 'winshirt-custom-css';
        styleEl.textContent = cssCode;
        document.head.appendChild(styleEl);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('winshirt-custom-css', cssCode);
        setOriginalCssCode(cssCode);
        setIsCssCodeChanged(false);
        
        showNotification('success', 'system', true, "Le code CSS personnalisé a été appliqué");
      } else {
        localStorage.removeItem('winshirt-custom-css');
        setOriginalCssCode('');
        setIsCssCodeChanged(false);
        showNotification('success', 'system', true, "Le code CSS personnalisé a été réinitialisé");
      }
    } catch (error) {
      console.error('Error applying custom CSS:', error);
      showNotification('error', 'system', false, "Erreur lors de l'application du CSS personnalisé");
    }
  };
  
  // Réinitialiser le code CSS personnalisé
  const resetCustomCss = () => {
    setCssCode('');
    setIsCssCodeChanged(originalCssCode !== '');
  };
  
  // Fonction pour appliquer les changements d'image d'arrière-plan
  const applyBackgroundChange = () => {
    try {
      // Sauvegarder les réglages d'arrière-plan
      const bgSettings = {
        backgroundImage: backgroundPreview,
        backgroundOpacity: backgroundOpacity,
        containerRadius: containerRadius,
        containerBlur: containerBlur,
        containerOpacity: containerOpacity,
        containerBorder: containerBorder,
      };
      
      localStorage.setItem('winshirt-background-settings', JSON.stringify(bgSettings));
      
      // Générer le CSS pour l'arrière-plan
      const backgroundCss = `
      body {
        background-image: url("${backgroundPreview}");
        background-size: cover;
        background-attachment: fixed;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--background);
      }
      
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(26, 31, 44, ${(100 - backgroundOpacity) / 100});
        z-index: -1;
      }
      
      .winshirt-card {
        border-radius: ${containerRadius}px;
        backdrop-filter: blur(${containerBlur}px);
        background-color: rgba(26, 31, 44, ${containerOpacity / 100});
        border-color: ${containerBorder};
      }
      `;
      
      // Appliquer le CSS
      const existingBgStyle = document.getElementById('winshirt-background-css');
      if (existingBgStyle) {
        existingBgStyle.remove();
      }
      
      const styleEl = document.createElement('style');
      styleEl.id = 'winshirt-background-css';
      styleEl.textContent = backgroundCss;
      document.head.appendChild(styleEl);
      
      showNotification('success', 'system', true, "Les paramètres d'arrière-plan ont été appliqués");
    } catch (error) {
      console.error('Error applying background changes:', error);
      showNotification('error', 'system', false, "Erreur lors de l'application des changements d'arrière-plan");
    }
  };
  
  const saveCssChanges = () => {
    try {
      const root = document.documentElement;
      
      // Apply CSS changes
      cssVariables.forEach(variable => {
        root.style.setProperty(variable.name, variable.value);
      });
      
      // Save to localStorage for persistence
      const cssSettings = cssVariables.reduce((acc: Record<string, string>, variable) => {
        acc[variable.name] = variable.value;
        return acc;
      }, {});
      
      localStorage.setItem('winshirt-css-settings', JSON.stringify(cssSettings));
      
      // Update the original values
      setCssVariables(cssVariables.map(variable => ({
        ...variable,
        originalValue: variable.value
      })));
      
      setIsChanged(false);
      showNotification('success', 'system', true, "Les modifications CSS ont été appliquées");
    } catch (error) {
      console.error('Error saving CSS changes:', error);
      showNotification('error', 'system', false, "Erreur lors de l'application des modifications CSS");
    }
  };
  
  const resetToDefault = () => {
    const root = document.documentElement;
    
    // Reset to default values from App.tsx
    root.style.setProperty('--winshirt-space', '#0c1019');
    root.style.setProperty('--winshirt-space-light', '#151b27');
    root.style.setProperty('--winshirt-space-dark', '#080c12');
    root.style.setProperty('--winshirt-purple', '#7c3aed');
    root.style.setProperty('--winshirt-purple-light', '#9869f5');
    root.style.setProperty('--winshirt-purple-dark', '#6026c5');
    root.style.setProperty('--winshirt-blue', '#3a86ff');
    root.style.setProperty('--winshirt-blue-light', '#66a3ff');
    root.style.setProperty('--winshirt-blue-dark', '#2e6acd');
    
    // Remove from localStorage
    localStorage.removeItem('winshirt-css-settings');
    localStorage.removeItem('winshirt-custom-css');
    localStorage.removeItem('winshirt-background-settings');
    
    // Reset background settings
    setBackgroundPreview('');
    setBackgroundOpacity(100);
    setContainerRadius(12);
    setContainerBlur(8);
    setContainerOpacity(40);
    setContainerBorder('rgba(155, 135, 245, 0.3)');
    
    // Remove custom styles
    const existingStyle = document.getElementById('winshirt-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const existingBgStyle = document.getElementById('winshirt-background-css');
    if (existingBgStyle) {
      existingBgStyle.remove();
    }
    
    // Reload variables
    loadCssVariables();
    setCssCode('');
    setOriginalCssCode('');
    setIsCssCodeChanged(false);
    
    setIsChanged(false);
    showNotification('success', 'system', true, "Réinitialisation des styles par défaut");
  };
  
  const resetCurrentChanges = () => {
    setCssVariables(cssVariables.map(variable => ({
      ...variable,
      value: variable.originalValue
    })));
    setIsChanged(false);
  };
  
  // Filtrer les variables CSS selon l'onglet actif
  const filteredVariables = cssVariables.filter(
    variable => variable.category === activeTab
  );
  
  // Prévisualisation de l'arrière-plan
  const backgroundStyle = {
    backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: backgroundOpacity / 100,
  };
  
  // Prévisualisation du conteneur
  const containerStyle = {
    borderRadius: `${containerRadius}px`,
    backdropFilter: `blur(${containerBlur}px)`,
    backgroundColor: `rgba(26, 31, 44, ${containerOpacity / 100})`,
    borderColor: containerBorder,
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personnalisation de l'apparence
        </CardTitle>
        <CardDescription className="text-gray-300">
          Personnalisez les couleurs, les polices et l'apparence générale de votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-winshirt-space-light border border-winshirt-purple/20">
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="backgrounds">Arrière-plan</TabsTrigger>
              <TabsTrigger value="containers">Conteneurs</TabsTrigger>
              <TabsTrigger value="typography">Typographie</TabsTrigger>
              <TabsTrigger value="spacing">Espacement</TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>
            
            {showAdvancedSettings && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditorMode(editorMode === 'variables' ? 'code' : 'variables')}
                  className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                >
                  {editorMode === 'variables' ? (
                    <>
                      <Code className="h-4 w-4 mr-1" />
                      Mode code CSS
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Mode variables
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {editorMode === 'variables' ? (
            <>
              <TabsContent value="backgrounds" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white mb-2 block">URL de l'image d'arrière-plan</Label>
                    <div className="flex gap-2">
                      <Input 
                        className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
                        value={backgroundPreview} 
                        onChange={(e) => setBackgroundPreview(e.target.value)}
                        placeholder="https://exemple.com/image.jpg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white mb-1 block">Opacité de l'image d'arrière-plan ({backgroundOpacity}%)</Label>
                    <Slider 
                      value={[backgroundOpacity]} 
                      onValueChange={values => setBackgroundOpacity(values[0])}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-white mb-2 block">Prévisualisation</Label>
                    <div className="relative h-40 w-full rounded-lg overflow-hidden border border-winshirt-purple/30">
                      <div className="absolute inset-0" style={backgroundStyle}></div>
                      <div className="absolute inset-0 bg-winshirt-space" style={{ opacity: 1 - backgroundOpacity / 100 }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 rounded-lg glass-effect" style={containerStyle}>
                          <p className="text-white">Prévisualisation de l'arrière-plan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      className="bg-winshirt-purple hover:bg-winshirt-purple/80"
                      onClick={applyBackgroundChange}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Appliquer les changements d'arrière-plan
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="containers" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white mb-1 block">Rayon des coins ({containerRadius}px)</Label>
                    <Slider 
                      value={[containerRadius]} 
                      onValueChange={values => setContainerRadius(values[0])}
                      max={24}
                      step={1}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white mb-1 block">Niveau de flou ({containerBlur}px)</Label>
                    <Slider 
                      value={[containerBlur]} 
                      onValueChange={values => setContainerBlur(values[0])}
                      max={20}
                      step={1}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white mb-1 block">Opacité du fond ({containerOpacity}%)</Label>
                    <Slider 
                      value={[containerOpacity]} 
                      onValueChange={values => setContainerOpacity(values[0])}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Couleur de bordure</Label>
                    <Input 
                      type="text"
                      className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
                      value={containerBorder} 
                      onChange={(e) => setContainerBorder(e.target.value)}
                      placeholder="rgba(155, 135, 245, 0.3)"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-white mb-2 block">Prévisualisation du conteneur</Label>
                    <div className="h-40 w-full rounded-lg overflow-hidden border border-winshirt-purple/30 flex items-center justify-center">
                      {backgroundPreview && (
                        <div className="absolute inset-0" style={backgroundStyle}></div>
                      )}
                      <div className="p-6 rounded-lg winshirt-card" style={containerStyle}>
                        <div className="text-white text-center">
                          <h3 className="text-lg font-bold">Titre du conteneur</h3>
                          <p className="text-sm text-gray-300">Contenu d'exemple pour la prévisualisation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      className="bg-winshirt-purple hover:bg-winshirt-purple/80"
                      onClick={applyBackgroundChange}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Appliquer les changements de conteneur
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Autres onglets */}
              <TabsContent value="colors" className="space-y-4">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredVariables.map((variable, index) => {
                      const originalIndex = cssVariables.findIndex(v => v.name === variable.name);
                      return (
                        <div key={variable.name} className="space-y-1">
                          <div className="flex justify-between">
                            <Label className="text-white">{variable.description}</Label>
                            {variable.value !== variable.originalValue && (
                              <span className="text-xs text-winshirt-blue-light">Modifié</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              className="w-12 h-8 p-1 bg-transparent border-winshirt-purple/30"
                              value={variable.value} 
                              onChange={(e) => handleInputChange(originalIndex, e.target.value)} 
                            />
                            <Input 
                              className="flex-1 bg-winshirt-space-light border-winshirt-purple/30 text-white"
                              value={variable.value} 
                              onChange={(e) => handleInputChange(originalIndex, e.target.value)} 
                              placeholder={variable.originalValue}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{variable.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Onglets Typography, Spacing et Other */}
              {['typography', 'spacing', 'other'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredVariables.map((variable, index) => {
                        const originalIndex = cssVariables.findIndex(v => v.name === variable.name);
                        return (
                          <div key={variable.name} className="space-y-1">
                            <div className="flex justify-between">
                              <Label className="text-white">{variable.description}</Label>
                              {variable.value !== variable.originalValue && (
                                <span className="text-xs text-winshirt-blue-light">Modifié</span>
                              )}
                            </div>
                            <Input 
                              className="bg-winshirt-space-light border-winshirt-purple/30 text-white"
                              value={variable.value} 
                              onChange={(e) => handleInputChange(originalIndex, e.target.value)} 
                              placeholder={variable.originalValue}
                            />
                            <p className="text-xs text-muted-foreground font-mono">{variable.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline"
                  onClick={resetCurrentChanges}
                  disabled={!isChanged}
                  className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                >
                  <Undo className="h-4 w-4 mr-1" />
                  Annuler les changements
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={resetToDefault}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Réinitialiser tous les styles
                  </Button>
                  <Button 
                    onClick={saveCssChanges}
                    disabled={!isChanged}
                    className="bg-winshirt-purple hover:bg-winshirt-purple/80"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Appliquer les modifications
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Card className="bg-winshirt-space-light border border-winshirt-purple/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center text-base">
                    <FileCode className="h-4 w-4 mr-2" />
                    Éditeur CSS avancé
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    Utilisez cet éditeur pour définir des styles CSS personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={cssCode}
                    onChange={handleCssCodeChange}
                    className="font-mono bg-winshirt-space border-winshirt-purple/30 text-white h-96"
                    placeholder="/* Ajoutez ici votre CSS personnalisé */"
                    spellCheck={false}
                  />
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline"
                      onClick={resetCustomCss}
                      disabled={!isCssCodeChanged}
                      className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/10"
                    >
                      <Undo className="h-4 w-4 mr-1" />
                      Réinitialiser
                    </Button>
                    <Button 
                      onClick={applyCustomCss}
                      disabled={!isCssCodeChanged}
                      className="bg-winshirt-purple hover:bg-winshirt-purple/80"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Appliquer le CSS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CssEditorManager;
